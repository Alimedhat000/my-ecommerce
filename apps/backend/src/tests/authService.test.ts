import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import * as authService from '../services/authService';
import { AppError } from '../utils/errorHandler';
import { Prisma } from '@prisma/client';

vi.mock('../../src/config/database');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('../../src/utils/logger');

vi.mock('../../src/config/database', () => ({
    default: {
        user: {
            create: vi.fn(),
            findUnique: vi.fn(),
        },
        refreshToken: {
            upsert: vi.fn(),
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

describe('authService.register', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should throw if email is missing', async () => {
        await expect(authService.register('', 'password123', 'Test')).rejects.toBeInstanceOf(
            AppError
        );
    });

    it('should throw if password too short', async () => {
        await expect(
            authService.register('test@example.com', '123', 'Test')
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should throw if name is missing', async () => {
        await expect(
            authService.register('test@example.com', 'password123', '')
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should throw if email already exists', async () => {
        bcrypt.hash = vi.fn().mockResolvedValue('hashed-password');

        const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
        prismaError.message = 'Unique constraint failed';
        prismaError.code = 'P2002';
        prismaError.meta = { target: ['email'] };

        prisma.user.create = vi.fn().mockRejectedValue(prismaError);

        await expect(
            authService.register('test@example.com', 'password123', 'Test')
        ).rejects.toThrow('Email already in use');
    });

    it('should return tokens and user on success', async () => {
        (bcrypt.hash as any).mockResolvedValue('hashed-password');
        (prisma.user.create as any).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            name: 'Test',
            createdAt: new Date(),
        });
        (prisma.refreshToken.upsert as any).mockResolvedValue({});

        (jwt.sign as any).mockReturnValue('token');

        const result = await authService.register('test@example.com', 'password123', 'Test');
        expect(result.accessToken).toBe('token');
        expect(result.refreshToken).toBe('token');
        expect(result.user.email).toBe('test@example.com');
    });

    it('should throw Registration failed on unexpected error', async () => {
        (bcrypt.hash as any).mockResolvedValue('hashed-password');
        (prisma.user.create as any).mockRejectedValue(new Error('DB down'));

        await expect(
            authService.register('test@example.com', 'password123', 'Test')
        ).rejects.toThrow('Registration failed');
    });
});

describe('authService.login', () => {
    it('should throw if user not found', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);
        await expect(authService.login('test@example.com', 'password')).rejects.toThrow(
            'Invalid credentials'
        );
    });

    it('should throw if password is invalid', async () => {
        (prisma.user.findUnique as any).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            password: 'hash',
            name: 'Test',
        });
        (bcrypt.compare as any).mockResolvedValue(false);
        await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow(
            'Invalid credentials'
        );
    });

    it('should return tokens and user on success', async () => {
        (prisma.user.findUnique as any).mockResolvedValue({
            id: 1,
            email: 'test@example.com',
            password: 'hash',
            name: 'Test',
        });
        (bcrypt.compare as any).mockResolvedValue(true);
        (prisma.refreshToken.upsert as any).mockResolvedValue({});
        (jwt.sign as any).mockReturnValue('token');

        const result = await authService.login('test@example.com', 'password123');
        expect(result.accessToken).toBe('token');
        expect(result.refreshToken).toBe('token');
        expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if email is missing', async () => {
        await expect(authService.login('', 'password')).rejects.toThrow('Email is required');
    });

    it('should throw if password is missing', async () => {
        await expect(authService.login('test@example.com', '')).rejects.toThrow(
            'Password is required'
        );
    });
});

describe('authService.refreshTokens', () => {
    it('should throw if token invalid', async () => {
        (jwt.verify as any).mockImplementation(() => {
            throw new jwt.JsonWebTokenError('invalid');
        });
        await expect(authService.refreshTokens('badtoken')).rejects.toThrow(
            'Invalid refresh token'
        );
    });

    it('should return new tokens on success', async () => {
        (jwt.verify as any).mockReturnValue({
            userId: 1,
            email: 'test@example.com',
            type: 'refresh',
        });
        (prisma.refreshToken.findFirst as any).mockResolvedValue({
            user: { id: 1, email: 'test@example.com', name: 'Test' },
        });
        (prisma.refreshToken.upsert as any).mockResolvedValue({});
        (jwt.sign as any).mockReturnValue('token');

        const result = await authService.refreshTokens('token');
        expect(result.accessToken).toBe('token');
        expect(result.refreshToken).toBe('token');
        expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if token type is not refresh', async () => {
        (jwt.verify as any).mockReturnValue({
            userId: 1,
            email: 'test@example.com',
            type: 'access',
        });
        await expect(authService.refreshTokens('token')).rejects.toThrow('Invalid token type');
    });

    it('should throw if refresh token not found', async () => {
        (jwt.verify as any).mockReturnValue({
            userId: 1,
            email: 'test@example.com',
            type: 'refresh',
        });
        (prisma.refreshToken.findFirst as any).mockResolvedValue(null);

        await expect(authService.refreshTokens('token')).rejects.toThrow(
            'Invalid or expired refresh token'
        );
    });

    it('should throw if unexpected error occurs', async () => {
        (jwt.verify as any).mockImplementation(() => {
            throw new Error('Unexpected');
        });

        await expect(authService.refreshTokens('token')).rejects.toThrow('Unexpected');
    });
});

describe('authService.logout', () => {
    it('should revoke all refresh tokens for a user', async () => {
        (prisma.refreshToken.updateMany as any).mockResolvedValue({});
        await authService.logout(1);
        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
            where: { userId: 1 },
            data: { isRevoked: true },
        });
    });
});

describe('authService.verifyAccessToken', () => {
    it('should throw if token invalid', () => {
        (jwt.verify as any).mockImplementation(() => {
            throw new jwt.JsonWebTokenError('invalid');
        });
        expect(() => authService.verifyAccessToken('badtoken')).toThrow('Invalid access token');
    });

    it('should return payload if token valid', () => {
        (jwt.verify as any).mockReturnValue({
            userId: 1,
            email: 'test@example.com',
            type: 'access',
        });
        const payload = authService.verifyAccessToken('token');
        expect(payload.userId).toBe(1);
    });

    it('should throw if token type is not access', () => {
        (jwt.verify as any).mockReturnValue({
            userId: 1,
            email: 'test@example.com',
            type: 'refresh',
        });
        expect(() => authService.verifyAccessToken('token')).toThrow('Invalid token type');
    });
});
