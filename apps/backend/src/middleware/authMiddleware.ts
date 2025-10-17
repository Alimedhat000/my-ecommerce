// src/middleware/authMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Role } from '@prisma/client';
import prisma from '../config/database';

// eslint-disable-next-line
export interface AuthRequest<Params = any, ResBody = any, ReqBody = any, ReqQuery = any>
    extends Request<Params, ResBody, ReqBody, ReqQuery> {
    userId?: number;
    user?: {
        id: number;
        email: string;
        role?: Role;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        logger.warn('No Authorization header provided');
        return next(new AppError('Access token is required', 401));
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
        logger.warn('Invalid or missing token in Authorization header');
        return next(new AppError('Access token is required', 401));
    }

    const token = parts[1].trim();

    try {
        const decoded = authService.verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        req.userId = user.id;
        req.user = user;

        logger.info(`User ${user.id} authenticated successfully`);
        next();
    } catch (error) {
        logger.error(
            `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );

        // Handle JWT-specific errors
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                return next(new AppError('Access token has expired', 401));
            }
            if (error.name === 'JsonWebTokenError') {
                return next(new AppError('Invalid access token', 401));
            }
        }

        // For other errors, pass them through
        return next(new AppError('Authentication failed', 401));
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role !== Role.ADMIN) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    next();
};
