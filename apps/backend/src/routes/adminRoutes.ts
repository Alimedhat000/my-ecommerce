import express from 'express';
import * as productController from '../controllers/productController';
import { upload } from '../config/mutler';

const router = express.Router();

router.get('/products', productController.getAdminProducts);

router.get('/products/:id', productController.getAdminProduct);

router.post('/products', productController.createProductEndpoint);

router.get('/products/:id/images', productController.getProductImages);

router.put('/products/:id', productController.updateProductEndpoint);

router.delete('/products/:id', productController.deleteProductEndpoint);

router.patch('/products/:id/status', productController.updateProductStatus);

router.post('/products/:id/images', upload.single('image'), productController.uploadProductImage);

router.delete('/products/:productId/images/:imageId', productController.deleteProductImage);

export default router;
