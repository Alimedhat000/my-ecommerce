// src/routes/authRoutes.ts
import express from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh', authController.refreshTokens);

router.post('/logout', authenticate, authController.logout);

export default router;
