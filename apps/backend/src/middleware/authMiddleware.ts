// src/middleware/authMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';

interface AuthRequest extends Request {
    userId?: number;
    user?: {
        id: number;
        email: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        logger.warn('No Authorization header provided');
        return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        logger.warn('No token provided in Authorization header');
        return next(new AppError('Access token is required', 401));
    }

    try {
        const decoded = authService.verifyAccessToken(token);
        req.userId = decoded.userId;
        req.user = {
            id: decoded.userId,
            email: decoded.email,
        };

        logger.info(`User ${decoded.userId} authenticated successfully`);
        next();
    } catch (error) {
        logger.error(
            `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        next(error);
    }
};
