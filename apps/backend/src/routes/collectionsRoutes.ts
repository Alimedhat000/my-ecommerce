import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

/**
 * @swagger
 * /api/collections/{id}/products:
 *   get:
 *     summary: Get products by collection
 *     description: Retrieve all published products in a specific collection
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Collection ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     collectionId:
 *                       type: integer
 *                       example: 1
 *                     productsCount:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Invalid collection ID
 *       500:
 *         description: Server error
 */
router.get('/:id/products', productController.getProductsByCollectionEndpoint);

export default router;
