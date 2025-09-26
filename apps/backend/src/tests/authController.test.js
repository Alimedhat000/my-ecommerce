import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../controllers/authController';
import * as authService from '../services/authService';
import logger from '../utils/logger';
import cookieParser from 'cookie-parser';

vi.mock('../services/authService');
vi.mock('../utils/logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('authController', () => {
    let app;

    beforeEach(() => {
        vi.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Set up minimal routes for testing
        app.post('/register', authController.register);
        app.post('/login', authController.login);
        app.post('/refresh', authController.refreshTokens);
        app.post('/logout', (req, res, next) => {
            // mock AuthRequest.userId for logout
            req.userId = 1;
            authController.logout(req, res).catch(next);
        });
    });

    it('should register a user and set refresh token cookie', async () => {
        authService.register.mockResolvedValue({
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });

        const res = await request(app)
            .post('/register')
            .send({ email: 'test@example.com', password: 'pass', name: 'Test' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBe('access-token');
        expect(res.headers['set-cookie'][0]).toContain('refreshToken=refresh-token');
    });

    it('should login a user and set refresh token cookie', async () => {
        authService.login.mockResolvedValue({
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });

        const res = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'pass' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBe('access-token');
        expect(res.headers['set-cookie'][0]).toContain('refreshToken=refresh-token');
    });

    it('should refresh tokens using cookie', async () => {
        authService.refreshTokens.mockResolvedValue({
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        });

        const res = await request(app)
            .post('/refresh')
            .set('Cookie', ['refreshToken=old-refresh-token']);

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBe('new-access-token');
        expect(res.headers['set-cookie'][0]).toContain('refreshToken=new-refresh-token');
    });

    it('should return 401 if refresh token is missing', async () => {
        const res = await request(app).post('/refresh').send({});
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Refresh token is required');
    });

    it('should logout a user and clear refresh token cookie', async () => {
        authService.logout.mockResolvedValue(undefined);

        const res = await request(app).post('/logout');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.headers['set-cookie'][0]).toContain('refreshToken=;'); // cleared cookie
    });
});
