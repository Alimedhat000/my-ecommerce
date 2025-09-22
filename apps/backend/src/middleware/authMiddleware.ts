// src/middleware/authMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Role } from '@prisma/client';
import prisma from '../config/database';

interface AuthRequest extends Request {
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

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        logger.warn('No token provided in Authorization header');
        return next(new AppError('Access token is required', 401));
    }

    try {
        const decoded = authService.verifyAccessToken(token);
        req.userId = decoded.userId;
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        req.userId = user.id;
        req.user = user;

        logger.info(`User ${decoded.userId} authenticated successfully`);
        next();
    } catch (error) {
        logger.error(
            `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        next(error);
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
