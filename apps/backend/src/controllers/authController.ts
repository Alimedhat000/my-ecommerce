import type { Request, Response } from 'express';
import * as authService from '../services/authService';
import { catchAsync } from '../utils/errorHandler';
import logger from '../utils/logger';

interface AuthRequest extends Request {
    userId?: number;
}

interface RegisterBody {
    email: string;
    password: string;
    name: string;
}

export const register = catchAsync(
    async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
        logger.info('Register endpoint called');
        const { email, password, name } = req.body;

        const result = await authService.register(email, password, name);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        logger.info(`User registered successfully: ${result.user.id}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    }
);

interface LoginBody {
    email: string;
    password: string;
}

export const login = catchAsync(
    async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
        logger.info('Login endpoint called');
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        logger.info(`User logged in successfully: ${result.user.email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    }
);

interface RefreshTokensBody {
    refreshToken?: string;
}

export const refreshTokens = catchAsync(
    async (req: Request<unknown, unknown, RefreshTokensBody>, res: Response) => {
        logger.info('Refresh tokens endpoint called');

        // Try to get refresh token from cookie first, then from body
        const cookieToken =
            typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : undefined;

        const bodyToken = req.body.refreshToken;

        const refreshToken: string | undefined = cookieToken ?? bodyToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        const result = await authService.refreshTokens(refreshToken);

        // Set new refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        logger.info(`Tokens refreshed successfully for user: ${result.user.id}`);

        res.json({
            success: true,
            message: 'Tokens refreshed successfully',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    }
);

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
    logger.info('Logout endpoint called');

    const userId = req.userId!;
    await authService.logout(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    logger.info(`User logged out successfully: ${userId}`);

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
