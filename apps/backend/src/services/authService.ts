// src/services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail fast on startup would be better, but this guard prevents runtime signing without a secret
  logger.error('JWT_SECRET is not configured in environment variables');
  throw new Error('JWT_SECRET not configured');
}

/**
 * Basic input sanitization/normalization.
 * You may prefer to use a library like `validator` or `zod` at the route layer instead.
 */
function normalizeEmail(email?: string): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

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

    logger.info(`User registered successfully: ${user.id}`);
    return user;
  } catch (err: any) {
    // Handle unique constraint violation race (duplicate email)
    // Prisma error code for unique constraint is P2002
    if (err?.code === 'P2002' && err?.meta?.target?.includes('email')) {
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
      password: true, // we need the hashed password to compare
      name: true,
    },
  });

  if (!user) {
    logger.warn(`Login failed: User not found - ${normalizedEmail}`);
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn(`Login failed: Invalid password for user - ${normalizedEmail}`);
    // Avoid leaking whether the user exists when possible — but keep existing behavior if you rely on it
    throw new AppError('Invalid credentials', 401);
  }

  // Sign JWT (do not include sensitive data like password)
  const payload = { userId: user.id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // Log successful login without token or password
  logger.info(`User logged in successfully: ${user.id}`);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};
