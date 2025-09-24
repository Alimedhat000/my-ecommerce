import express from 'express';
import * as productController from '../controllers/productController';
import * as imageController from '../controllers/imageController';
import { upload } from '../config/mutler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - title
 *         - handle
 *       properties:
 *         title:
 *           type: string
 *           example: "Nike Air Max 90"
 *         handle:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *           example: "nike-air-max-90"
 *         bodyHtml:
 *           type: string
 *           example: "<p>Classic comfort and style</p>"
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
 *           default: DRAFT
 *         seoTitle:
 *           type: string
 *           example: "Nike Air Max 90 - Classic Running Shoes"
 *         seoDescription:
 *           type: string
 *           example: "Shop the iconic Nike Air Max 90 with classic comfort and modern style."
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Red / Large"
 *               sku:
 *                 type: string
 *                 example: "NIKE-AM90-RED-L"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 129.99
 *               compareAtPrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 149.99
 *               inventoryQty:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               option1:
 *                 type: string
 *                 example: "Red"
 *               option2:
 *                 type: string
 *                 example: "Large"
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - src
 *             properties:
 *               src:
 *                 type: string
 *                 example: "https://res.cloudinary.com/example/image/upload/v1/products/nike-air-max-90.jpg"
 *               alt:
 *                 type: string
 *                 example: "Nike Air Max 90 in Red"
 *               position:
 *                 type: integer
 *                 example: 1
 *         collectionIds:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products (Admin)
 *     description: Retrieve all products including drafts and archived products
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED]
 *         description: Filter by product status
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/products', productController.getAdminProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get product by ID (Admin)
 *     description: Retrieve any product regardless of status
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/products/:id', productController.getAdminProduct);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product with variants, images, and collections
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *       400:
 *         description: Validation error or handle already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Product title is required", "Valid price is required"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/products', productController.createProductEndpoint);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update product
 *     description: Update an existing product with all its related data
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *       400:
 *         description: Validation error or invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/products/:id', productController.updateProductEndpoint);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Permanently delete a product and all its related data
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product \"Nike Air Max 90\" deleted successfully"
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/products/:id', productController.deleteProductEndpoint);

/**
 * @swagger
 * /admin/products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     description: Update the status of a product (DRAFT, ACTIVE, ARCHIVED)
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, ARCHIVED]
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Product status updated successfully
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
 *                 message:
 *                   type: string
 *                   example: "Product status updated to ACTIVE"
 *       400:
 *         description: Invalid product ID or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Valid status is required"
 *                 allowedValues:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["DRAFT", "ACTIVE", "ARCHIVED"]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch('/products/:id/status', productController.updateProductStatus);

/**
 * @swagger
 * /admin/products/{id}/images:
 *   post:
 *     summary: Upload product image
 *     description: Upload a product image to Cloudinary and associate it with the product
 *     tags: [Admin - Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               alt:
 *                 type: string
 *                 example: "Nike Air Max 90 in Red"
 *               position:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *                 cloudinaryData:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     secureUrl:
 *                       type: string
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     format:
 *                       type: string
 *       400:
 *         description: Validation error or missing image
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/products/:id/images', upload.single('image'), imageController.uploadProductImage);

/**
 * @swagger
 * /admin/images/{id}:
 *   delete:
 *     summary: Delete product image
 *     description: Delete a product image from database and Cloudinary
 *     tags: [Admin - Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Invalid image ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 *       500:
 *         description: Server error
 */
router.delete('/images/:id', imageController.deleteProductImage);

export default router;
