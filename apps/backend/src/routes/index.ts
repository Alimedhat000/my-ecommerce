import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import adminRoutes from './adminRoutes';
import collectionsRoutes from './collectionsRoutes';
import userRoutes from './userRoutes';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware';
import { catchAsync } from '../utils/errorHandler';

const router = Router();

// Each sub-route is mounted under /api/* in app.ts
router.use('/auth', authRoutes);

router.use('/products', productRoutes);

router.use('/collections', collectionsRoutes);

router.use('/admin', authorizeAdmin, adminRoutes);

router.use('/user', catchAsync(authenticate), userRoutes);
export default router;
