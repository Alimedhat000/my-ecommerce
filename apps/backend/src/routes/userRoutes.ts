import express from 'express';
import {
    getMe,
    updateMe,
    updatePassword,
    getAddresses,
    createAddresses,
    updateAddress,
    deleteAddress,
    getOrders,
    getOrder,
} from '../controllers/userController';

const router = express.Router();

router.get('/me', getMe);

router.patch('/me', updateMe);

router.patch('/update-password', updatePassword);

router.get('/addresses', getAddresses);

router.post('/addresses', createAddresses);

router.patch('/addresses/:addressId', updateAddress);

router.delete('/addresses/:addressId', deleteAddress);

router.get('/orders', getOrders);

router.get('/orders/:orderId', getOrder);

export default router;
