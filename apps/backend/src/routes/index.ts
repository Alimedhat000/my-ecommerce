import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import adminRoutes from './adminRoutes';
import collectionsRoutes from './collectionsRoutes';
import { authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();

// Each sub-route is mounted under /api/* in app.ts
router.use('/auth', authRoutes);

router.use('/products', productRoutes);

router.use('/collections', collectionsRoutes);

router.use('/admin', authorizeAdmin, adminRoutes);

export default router;
