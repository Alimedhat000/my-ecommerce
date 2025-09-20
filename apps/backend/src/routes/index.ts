import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Each sub-route is mounted under /api/* in app.ts
router.use('/auth', authRoutes);

export default router;
