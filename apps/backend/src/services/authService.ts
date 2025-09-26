// src/services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client'; // at the top

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Fail fast on startup would be better, but this guard prevents runtime signing without a secret
/* c8 ignore start */
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    logger.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET not configured');
}
/* c8 ignore end */

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

interface TokenPayload {
    userId: number;
    email: string;
    type: 'access' | 'refresh';
}

/**
 * Basic input sanitization/normalization.
 * TODO use `zod` at the route layer instead.
 */
function normalizeEmail(email?: string): string | null {
    if (!email) return null;
    return email.trim().toLowerCase();
}

const generateTokens = (userId: number, email: string) => {
    const accessToken = jwt.sign(
        { userId, email, type: 'access' } as TokenPayload,
        JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId, email, type: 'refresh' } as TokenPayload,
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

const saveRefreshToken = async (userId: number, token: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.upsert({
        where: { userId },
        update: {
            token,
            expiresAt,
            isRevoked: false,
        },
        create: {
            userId,
            token,
            expiresAt,
        },
    });
};

export const register = async (email: string, password: string, name?: string) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new AppError('Email is required', 400);
    if (!password || typeof password !== 'string' || password.length < 8) {
        throw new AppError('Password is required and must be at least 8 characters', 400);
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError('Name is required', 400);
    }

    logger.info(`Attempting to register user with email: ${normalizedEmail}`);

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: name.trim(),
            },
            // Optionally select only non-sensitive fields you want to return
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                // Exclude password field!
            },
        });

        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        await saveRefreshToken(user.id, refreshToken);

        logger.info(`User registered successfully: ${user.id}`);
        return {
            accessToken,
            refreshToken,
            user,
        };
    } catch (err: unknown) {
        console.log(err instanceof Prisma.PrismaClientKnownRequestError);
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            Array.isArray(err.meta?.target) &&
            err.meta.target.includes('email')
        ) {
            console.log(`Registration failed: Email already in use - ${normalizedEmail}`);
            logger.warn(`Registration failed: Email already in use - ${normalizedEmail}`);
            throw new AppError('Email already in use', 400);
        }

        logger.error('Unexpected error during registration', { err });
        throw new AppError('Registration failed', 500);
    }
};

export const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new AppError('Email is required', 400);
    if (!password || typeof password !== 'string') {
        throw new AppError('Password is required', 400);
    }

    logger.info(`Login attempt for user: ${normalizedEmail}`);

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
        },
    });

    if (!user) {
        logger.warn(`Login failed: User not found - ${normalizedEmail}`);
        throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for user - ${normalizedEmail}`);
        throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Save refresh token
    await saveRefreshToken(user.id, refreshToken);

    logger.info(`User logged in successfully: ${user.id}`);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    };
};

export const refreshTokens = async (refreshToken: string) => {
    logger.info('Attempting to refresh tokens');

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid token type', 401);
        }

        // Check if refresh token exists and is not revoked
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                userId: decoded.userId,
                token: refreshToken,
                isRevoked: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!storedToken) {
            logger.warn(`Refresh token not found or expired for user: ${decoded.userId}`);
            throw new AppError('Invalid or expired refresh token', 401);
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            storedToken.user.id,
            storedToken.user.email
        );

        // Update refresh token in database
        await saveRefreshToken(storedToken.user.id, newRefreshToken);

        logger.info(`Tokens refreshed successfully for user: ${storedToken.user.id}`);

        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: storedToken.user,
        };
    } catch (error) {
        logger.error('Token refresh failed:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError('Invalid refresh token', 401);
        }
        throw error;
    }
};

export const logout = async (userId: number) => {
    logger.info(`Logging out user: ${userId}`);

    await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
    });

    logger.info(`User logged out successfully: ${userId}`);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;

        if (decoded.type !== 'access') {
            throw new AppError('Invalid token type', 401);
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError('Invalid access token', 401);
        }
        throw error;
    }
};
