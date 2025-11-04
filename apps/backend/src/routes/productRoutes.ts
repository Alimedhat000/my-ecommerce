import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

router.get('/', productController.getProducts);

router.get('/:id', productController.getProduct);

router.get('/handle/:handle', productController.getProductByHandleEndpoint);

export default router;
