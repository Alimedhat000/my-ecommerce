import express from 'express';
import * as productController from '../controllers/productController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Nike Air Max 90"
 *         handle:
 *           type: string
 *           example: "nike-air-max-90"
 *         bodyHtml:
 *           type: string
 *           example: "Classic comfort and style"
 *         vendor:
 *           type: string
 *           example: "Nike"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["sneakers", "running", "lifestyle"]
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED]
 *           example: "ACTIVE"
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *           example: "Red / Large"
 *         sku:
 *           type: string
 *           example: "NIKE-AM90-RED-L"
 *         price:
 *           type: number
 *           format: decimal
 *           example: 129.99
 *         compareAtPrice:
 *           type: number
 *           format: decimal
 *           example: 149.99
 *         inventoryQty:
 *           type: integer
 *           example: 50
 *         available:
 *           type: boolean
 *           example: true
 *         option1:
 *           type: string
 *           example: "Red"
 *         option2:
 *           type: string
 *           example: "Large"
 *
 *     ProductImage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         src:
 *           type: string
 *           example: "https://res.cloudinary.com/example/image/upload/v1/products/nike-air-max-90.jpg"
 *         alt:
 *           type: string
 *           example: "Nike Air Max 90 in Red"
 *         position:
 *           type: integer
 *           example: 1
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         totalCount:
 *           type: integer
 *           example: 150
 *         totalPages:
 *           type: integer
 *           example: 8
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all published products
 *     description: Retrieve a paginated list of published products with optional filtering
 *     tags: [Products]
 *     parameters:
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
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor/brand
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: collectionId
 *         schema:
 *           type: integer
 *         description: Filter by collection ID
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
 *         description: Search in title, description, vendor, and tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, publishedAt]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         description: Server error
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single published product by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', productController.getProduct);

/**
 * @swagger
 * /products/handle/{handle}:
 *   get:
 *     summary: Get product by handle
 *     description: Retrieve a single published product by its SEO-friendly handle
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: Product handle (URL-friendly identifier)
 *         example: nike-air-max-90
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Product handle is required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/handle/:handle', productController.getProductByHandleEndpoint);

export default router;
