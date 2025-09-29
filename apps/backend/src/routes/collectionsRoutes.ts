import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

/**
 * @swagger
 * /collections/{id}/products:
 *   get:
 *     summary: Get products by collection
 *     description: Retrieve all published products in a specific collection, with pagination, filters, and sorting
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, publishedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DRAFT]
 *         description: Filter by product status
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter by tags (comma separated or repeated query param)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query (matches title or description)
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
 *                     totalCount:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid collection ID
 *       500:
 *         description: Server error
 */
router.get('/:id/products', productController.getProductsByCollectionEndpoint);

/**
 * @swagger
 * /collections/handle/{handle}/products:
 *   get:
 *     summary: Get products by collection handle
 *     description: Retrieve all published products in a specific collection by its handle with pagination and sorting support
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection handle (e.g. "summer-shirts")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products to return per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [manual, price-asc, price-desc, date-asc, date-desc, alpha-asc, alpha-desc]
 *           default: manual
 *         description: |
 *           Sort products by various criteria:
 *           - manual: Featured products (default)
 *           - price-asc: Price low to high
 *           - price-desc: Price high to low
 *           - date-asc: Date old to new
 *           - date-desc: Date new to old
 *           - alpha-asc: Alphabetically A to Z
 *           - alpha-desc: Alphabetically Z to A
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
 *                       example: 12
 *                     collectionHandle:
 *                       type: string
 *                       example: "summer-shirts"
 *                     productsCount:
 *                       type: integer
 *                       example: 15
 *                     totalCount:
 *                       type: integer
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid collection handle
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Server error
 */

router.get('/handle/:handle/products', productController.getProductsByCollectionHandleEndpoint);

export default router;
