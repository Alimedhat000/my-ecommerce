import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

router.get('/:id/products', productController.getProductsByCollectionEndpoint);

router.get('/handle/:handle/products', productController.getProductsByCollectionHandleEndpoint);

router.get('/handle/:handle/filters', productController.getCollectionFiltersEndpoint);

export default router;
