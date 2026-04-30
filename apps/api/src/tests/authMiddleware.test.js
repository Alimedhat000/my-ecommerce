import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware';
import * as authService from '../services/authService';
import prisma from '../config/database';
import { Role } from '@prisma/client';
import logger from '../utils/logger';

// Minimal Express app with routes using middleware
const app = express();
app.get('/protected', authenticate, (req, res) => res.json({ success: true }));
app.get('/admin', authenticate, authorizeAdmin, (req, res) => res.json({ success: true }));
// Error handler for tests
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Mocks
vi.mock('../services/authService');
vi.mock('../config/database', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));
vi.mock('../utils/logger', () => ({
    default: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('authMiddleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should reject when no Authorization header is provided', async () => {
        const res = await request(app).get('/protected');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Access token is required');
    });

    it('should reject when token is missing after Bearer', async () => {
        const res = await request(app).get('/protected').set('Authorization', 'Bearer ');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Access token is required');
    });

    it('should reject if user is not found in database', async () => {
        authService.verifyAccessToken.mockReturnValue({ userId: 1 });
        prisma.user.findUnique.mockResolvedValue(null);

        const res = await request(app).get('/protected').set('Authorization', 'Bearer validtoken');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it('should allow access with valid token and user', async () => {
        authService.verifyAccessToken.mockReturnValue({ userId: 1 });
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            role: Role.USER,
        });

        const res = await request(app).get('/protected').set('Authorization', 'Bearer validtoken');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should reject non-admin users on admin route', async () => {
        authService.verifyAccessToken.mockReturnValue({ userId: 1 });
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            role: Role.USER,
        });

        const res = await request(app).get('/admin').set('Authorization', 'Bearer validtoken');
        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden: Admins only');
    });

    it('should reject if authorizeAdmin is called without user set', async () => {
        const app2 = express();
        app2.get('/admin-only', authorizeAdmin, (req, res) => res.json({ success: true }));

        const res = await request(app2).get('/admin-only');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });

    it('should allow admin users on admin route', async () => {
        authService.verifyAccessToken.mockReturnValue({ userId: 1 });
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            email: 'admin@example.com',
            role: Role.ADMIN,
        });

        const res = await request(app).get('/admin').set('Authorization', 'Bearer validtoken');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should handle token verification errors', async () => {
        authService.verifyAccessToken.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const res = await request(app).get('/protected').set('Authorization', 'Bearer invalid');

        // Express error handler should receive error from `next(error)`
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid token'); // comes from next(error)

        // Ensure logger was called as well
        expect(logger.error).toHaveBeenCalledWith('Authentication failed: Invalid token');
    });

    it('should handle unknown errors in token verification', async () => {
        authService.verifyAccessToken.mockImplementation(() => {
            throw 'String error'; // Non-Error object
        });

        const res = await request(app).get('/protected').set('Authorization', 'Bearer badtoken');

        expect(res.status).toBe(500);
        expect(logger.error).toHaveBeenCalledWith('Authentication failed: Unknown error');
    });
});
