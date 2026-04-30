import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as productService from '../services/productService';
import * as imageService from '../services/imageService';
import logger from '../utils/logger';
import { upload } from '../config/mutler';
import {
    getProducts,
    getProduct,
    getProductByHandleEndpoint,
    getProductsByCollectionEndpoint,
    getAdminProducts,
    getAdminProduct,
    createProductEndpoint,
    updateProductEndpoint,
    deleteProductEndpoint,
    updateProductStatus,
    uploadProductImage,
    getProductImages,
    deleteProductImage,
} from '../controllers/productController';

// Create Express app for testing
const app = express();
app.use(express.json());

// Add middleware to simulate file upload
app.use((req, res, next) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
        req.file = req.body.file || null;
    }
    next();
});

// Public routes
app.get('/api/products', getProducts);
app.get('/api/products/handle/:handle', getProductByHandleEndpoint);
app.get('/api/products/:id', getProduct);
app.get('/api/collections/:id/products', getProductsByCollectionEndpoint);

// Admin routes
app.get('/api/admin/products', getAdminProducts);
app.get('/api/admin/products/:id', getAdminProduct);
app.post('/api/admin/products', createProductEndpoint);
app.put('/api/admin/products/:id', updateProductEndpoint);
app.delete('/api/admin/products/:id', deleteProductEndpoint);
app.patch('/api/admin/products/:id/status', updateProductStatus);
app.post('/api/admin/products/:id/images', upload.single('file'), uploadProductImage);
app.get('/api/admin/products/:id/images', getProductImages);
app.delete('/api/admin/products/:productId/images/:imageId', deleteProductImage);

// Error handler
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Mocks
vi.mock('../services/productService');
vi.mock('../services/imageService');
vi.mock('../utils/logger', () => ({
    default: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
    },
}));

describe('Product Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('parseQueryParams utility', () => {
        // This function is internal but we can test it through the endpoints
        it('should handle all query parameters correctly', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app).get('/api/products').query({
                status: 'ACTIVE',
                vendor: 'test-vendor',
                tags: 'tag1,tag2',
                collectionId: '1',
                search: 'test',
                minPrice: '10',
                maxPrice: '100',
                page: '2',
                limit: '50',
                sortBy: 'title',
                sortOrder: 'desc',
            });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'ACTIVE',
                    vendor: 'test-vendor',
                    tags: ['tag1', 'tag2'],
                    collectionId: 1,
                    search: 'test',
                    priceRange: { min: 10, max: 100 },
                }),
                expect.objectContaining({
                    page: 2,
                    limit: 50,
                    sortBy: 'title',
                    sortOrder: 'desc',
                })
            );
        });

        it('should handle array tags correctly', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app)
                .get('/api/products')
                .query({ tags: ['tag1', 'tag2'] });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: ['tag1', 'tag2'],
                }),
                expect.any(Object)
            );
        });

        it('should handle invalid pagination values', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app).get('/api/products').query({
                page: '0',
                limit: '200',
            });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    page: 1,
                    limit: 100,
                })
            );
        });
    });

    describe('validateProductData utility', () => {
        it('should validate through createProductEndpoint', async () => {
            const response = await request(app)
                .post('/api/admin/products')
                .send({
                    title: '',
                    handle: '',
                    variants: [
                        { title: '', price: -1 },
                        { title: 'Valid', price: 0 },
                    ],
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toEqual([
                'Product title is required',
                'Product handle is required',
                'Variant 1: title is required',
                'Variant 1: valid price is required',
                'Variant 2: valid price is required',
            ]);
        });

        it('should validate handle format', async () => {
            const response = await request(app).post('/api/admin/products').send({
                title: 'Test Product',
                handle: 'Invalid Handle!',
            });

            expect(response.status).toBe(400);
            expect(response.body.details).toContain(
                'Handle must contain only lowercase letters, numbers, and hyphens'
            );
        });
    });

    describe('GET /api/products (getProducts)', () => {
        it('should return all active products successfully', async () => {
            const mockResult = {
                products: [{ id: 1, title: 'Test Product', status: 'ACTIVE' }],
                pagination: { page: 1, limit: 20, total: 1 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockResult.products);
            expect(response.body.pagination).toEqual(mockResult.pagination);
            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'ACTIVE' }),
                expect.any(Object)
            );
        });

        it('should handle service errors', async () => {
            productService.getAllProducts.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/products');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch products');
            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching products:',
                expect.any(Error)
            );
        });
    });

    describe('GET /api/products/:id (getProduct)', () => {
        it('should return active product by ID successfully', async () => {
            const mockProduct = { id: 1, title: 'Test Product', status: 'ACTIVE' };
            productService.getProductById.mockResolvedValue(mockProduct);

            const response = await request(app).get('/api/products/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProduct);
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app).get('/api/products/invalid');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should return 400 for zero or negative ID', async () => {
            const response = await request(app).get('/api/products/0');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should return 404 for non-active product', async () => {
            const mockProduct = { id: 1, title: 'Test Product', status: 'DRAFT' };
            productService.getProductById.mockResolvedValue(mockProduct);

            const response = await request(app).get('/api/products/1');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle product not found error', async () => {
            productService.getProductById.mockRejectedValue(new Error('Product not found'));

            const response = await request(app).get('/api/products/1');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle other service errors', async () => {
            productService.getProductById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/products/1');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch product');
            expect(logger.error).toHaveBeenCalledWith('Error fetching product:', expect.any(Error));
        });
    });

    describe('GET /api/products/handle/:handle (getProductByHandleEndpoint)', () => {
        it('should return active product by handle successfully', async () => {
            const mockProduct = {
                id: 1,
                title: 'Test Product',
                status: 'ACTIVE',
                handle: 'test-product',
            };
            productService.getProductByHandle.mockResolvedValue(mockProduct);

            const response = await request(app).get('/api/products/handle/test-product');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProduct);
        });

        it('should return 400 for missing handle', async () => {
            const response = await request(app).get('/api/products/handle/%20'); // or ' ' (URL encoded)

            console.log('Response Body:', response.body);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product handle is required');
        });

        it('should return 404 for non-active product by handle', async () => {
            const mockProduct = {
                id: 1,
                title: 'Test Product',
                status: 'DRAFT',
                handle: 'test-product',
            };
            productService.getProductByHandle.mockResolvedValue(mockProduct);

            const response = await request(app).get('/api/products/handle/test-product');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle product not found by handle', async () => {
            productService.getProductByHandle.mockRejectedValue(new Error('Product not found'));

            const response = await request(app).get('/api/products/handle/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle other service errors by handle', async () => {
            productService.getProductByHandle.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/products/handle/test-product');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch product');
            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching product by handle:',
                expect.any(Error)
            );
        });
    });

    describe('GET /api/collections/:id/products (getProductsByCollectionEndpoint)', () => {
        it('should return products by collection successfully', async () => {
            const mockProducts = [
                { id: 1, title: 'Product 1' },
                { id: 2, title: 'Product 2' },
            ];
            productService.getProductsByCollection.mockResolvedValue(mockProducts);

            const response = await request(app).get('/api/collections/1/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProducts);
            expect(response.body.meta).toEqual({
                collectionId: 1,
                productsCount: 2,
            });
        });

        it('should handle pagination parameters', async () => {
            const mockProducts = [];
            productService.getProductsByCollection.mockResolvedValue(mockProducts);

            const response = await request(app)
                .get('/api/collections/1/products')
                .query({ page: '2', limit: '10' });

            expect(productService.getProductsByCollection).toHaveBeenCalledWith(1, {
                page: 2,
                limit: 10,
            });
        });

        it('should return 400 for invalid collection ID', async () => {
            const response = await request(app).get('/api/collections/invalid/products');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid collection ID');
        });

        it('should return 400 for zero or negative collection ID', async () => {
            const response = await request(app).get('/api/collections/0/products');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid collection ID');
        });

        it('should handle service errors', async () => {
            productService.getProductsByCollection.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app).get('/api/collections/1/products');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch products');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching products by collection:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('GET /api/admin/products (getAdminProducts)', () => {
        it('should return all products for admin', async () => {
            const mockResult = {
                products: [
                    { id: 1, title: 'Active Product', status: 'ACTIVE' },
                    { id: 2, title: 'Draft Product', status: 'DRAFT' },
                ],
                pagination: { page: 1, limit: 20, total: 2 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            const response = await request(app).get('/api/admin/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockResult.products);
        });

        it('should handle service errors', async () => {
            productService.getAllProducts.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app).get('/api/admin/products');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch products');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching admin products:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('GET /api/admin/products/:id (getAdminProduct)', () => {
        it('should return product by ID for admin', async () => {
            const mockProduct = { id: 1, title: 'Test Product', status: 'DRAFT' };
            productService.getProductById.mockResolvedValue(mockProduct);

            const response = await request(app).get('/api/admin/products/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProduct);
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app).get('/api/admin/products/invalid');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should handle product not found', async () => {
            productService.getProductById.mockRejectedValue(new Error('Product not found'));

            const response = await request(app).get('/api/admin/products/1');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle other service errors', async () => {
            productService.getProductById.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app).get('/api/admin/products/1');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch product');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching admin product:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('POST /api/admin/products (createProductEndpoint)', () => {
        it('should create product successfully without images', async () => {
            const productData = {
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ title: 'Default', price: 10 }],
            };
            const mockProduct = { id: 1, ...productData };
            productService.createProduct.mockResolvedValue(mockProduct);

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProduct);
            expect(response.body.message).toBe('Product created successfully');
        });

        it('should create product with images successfully', async () => {
            const productData = {
                title: 'Test Product',
                handle: 'test-product',
                images: [{ alt: 'Test image', position: 1, buffer: 'fake-buffer' }],
            };
            const mockProduct = { id: 1, title: 'Test Product', handle: 'test-product' };
            const mockImage = { id: 1, alt: 'Test image', position: 1 };

            productService.createProduct.mockResolvedValue(mockProduct);
            imageService.createImage.mockResolvedValue(mockImage);

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(imageService.createImage).toHaveBeenCalledWith({
                productId: 1,
                alt: 'Test image',
                position: 1,
                imageBuffer: 'fake-buffer',
                uploadOptions: { generateSizes: true },
            });
        });

        it('should handle image upload failure gracefully', async () => {
            const productData = {
                title: 'Test Product',
                handle: 'test-product',
                images: [{ alt: 'Test image', buffer: 'fake-buffer' }],
            };
            const mockProduct = { id: 1, title: 'Test Product', handle: 'test-product' };

            productService.createProduct.mockResolvedValue(mockProduct);
            imageService.createImage.mockRejectedValue(new Error('Image upload failed'));

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(logger.warn).toHaveBeenCalledWith(
                'Failed to upload some images for product 1:',
                expect.any(Error)
            );
        });

        it('should handle validation errors', async () => {
            const response = await request(app)
                .post('/api/admin/products')
                .send({ title: '', handle: '' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation failed');
        });

        it('should handle duplicate handle error', async () => {
            const productData = { title: 'Test', handle: 'existing-handle' };
            productService.createProduct.mockRejectedValue(new Error('handle already exists'));

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('handle already exists');
        });

        it('should handle other service errors', async () => {
            const productData = { title: 'Test', handle: 'test' };
            productService.createProduct.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to create product');
            expect(consoleSpy).toHaveBeenCalledWith('Error creating product:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle images with missing buffer gracefully', async () => {
            const productData = {
                title: 'Test Product',
                handle: 'test-product',
                images: [{ alt: 'No buffer image' }],
            };
            const mockProduct = { id: 1, title: 'Test Product', handle: 'test-product' };
            productService.createProduct.mockResolvedValue(mockProduct);

            // Mock createImage to fail
            imageService.createImage.mockRejectedValue(new Error('No buffer provided'));

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(logger.warn).toHaveBeenCalledWith(
                `Failed to upload some images for product ${mockProduct.id}:`,
                expect.any(Error)
            );
        });

        it('should use product title as alt when alt is not provided', async () => {
            const productData = {
                title: 'Fallback Title',
                handle: 'test-product',
                images: [{ buffer: 'fake-buffer' }], // no alt
            };
            const mockProduct = { id: 1, title: 'Fallback Title', handle: 'test-product' };
            const mockImage = { id: 1, position: 0 };

            productService.createProduct.mockResolvedValue(mockProduct);
            imageService.createImage.mockResolvedValue(mockImage);

            const response = await request(app).post('/api/admin/products').send(productData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            // Confirm createImage was called with product.title as alt
            expect(imageService.createImage).toHaveBeenCalledWith(
                expect.objectContaining({
                    alt: 'Fallback Title',
                    imageBuffer: 'fake-buffer',
                    productId: 1,
                    position: 0,
                    uploadOptions: { generateSizes: true },
                })
            );
        });
    });

    describe('PUT /api/admin/products/:id (updateProductEndpoint)', () => {
        it('should update product successfully', async () => {
            const updateData = { title: 'Updated Product', handle: 'updated-product' };
            const mockProduct = { id: 1, ...updateData };
            productService.updateProduct.mockResolvedValue(mockProduct);

            const response = await request(app).put('/api/admin/products/1').send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProduct);
            expect(response.body.message).toBe('Product updated successfully');
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .put('/api/admin/products/invalid')
                .send({ title: 'Test' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should handle validation errors', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app)
                .put('/api/admin/products/1')
                .send({ title: '', handle: '' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation failed');
            expect(consoleSpy).toHaveBeenCalledWith('Validation errors:', expect.any(Array));

            consoleSpy.mockRestore();
        });

        it('should handle product not found', async () => {
            productService.updateProduct.mockRejectedValue(new Error('Product not found'));

            const response = await request(app)
                .put('/api/admin/products/1')
                .send({ title: 'Test', handle: 'test' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle duplicate handle error', async () => {
            productService.updateProduct.mockRejectedValue(new Error('handle already exists'));

            const response = await request(app)
                .put('/api/admin/products/1')
                .send({ title: 'Test', handle: 'existing-handle' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('handle already exists');
        });

        it('should handle other service errors', async () => {
            productService.updateProduct.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app)
                .put('/api/admin/products/1')
                .send({ title: 'Test', handle: 'test' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to update product');
            expect(consoleSpy).toHaveBeenCalledWith('Error updating product:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('DELETE /api/admin/products/:id (deleteProductEndpoint)', () => {
        it('should delete product successfully', async () => {
            const mockResult = { message: 'Product deleted successfully' };
            productService.deleteProduct.mockResolvedValue(mockResult);

            const response = await request(app).delete('/api/admin/products/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(mockResult.message);
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app).delete('/api/admin/products/invalid');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should handle product not found', async () => {
            productService.deleteProduct.mockRejectedValue(new Error('Product not found'));

            const response = await request(app).delete('/api/admin/products/1');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle other service errors', async () => {
            productService.deleteProduct.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app).delete('/api/admin/products/1');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to delete product');
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting product:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('PATCH /api/admin/products/:id/status (updateProductStatus)', () => {
        it('should update product status to ACTIVE successfully', async () => {
            const mockProduct = { id: 1, status: 'ACTIVE', publishedAt: new Date() };
            productService.updateProduct.mockResolvedValue(mockProduct);

            const response = await request(app)
                .patch('/api/admin/products/1/status')
                .send({ status: 'ACTIVE' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.id).toBe(mockProduct.id);
            expect(response.body.data.status).toBe(mockProduct.status);
            expect(new Date(response.body.data.publishedAt)).toEqual(mockProduct.publishedAt);

            expect(response.body.message).toBe('Product status updated to ACTIVE');
            expect(productService.updateProduct).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    status: 'ACTIVE',
                    publishedAt: expect.any(Date),
                })
            );
        });

        it('should update product status to DRAFT successfully', async () => {
            const mockProduct = { id: 1, status: 'DRAFT' };
            productService.updateProduct.mockResolvedValue(mockProduct);

            const response = await request(app)
                .patch('/api/admin/products/1/status')
                .send({ status: 'DRAFT' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(productService.updateProduct).toHaveBeenCalledWith({
                id: 1,
                status: 'DRAFT',
            });
        });

        it('should return 400 for invalid product ID', async () => {
            const response = await request(app)
                .patch('/api/admin/products/invalid/status')
                .send({ status: 'ACTIVE' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should return 400 for missing status', async () => {
            const response = await request(app).patch('/api/admin/products/1/status').send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Valid status is required');
            expect(response.body.allowedValues).toEqual(['DRAFT', 'ACTIVE', 'ARCHIVED']);
        });

        it('should return 400 for invalid status', async () => {
            const response = await request(app)
                .patch('/api/admin/products/1/status')
                .send({ status: 'INVALID_STATUS' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Valid status is required');
            expect(response.body.allowedValues).toEqual(['DRAFT', 'ACTIVE', 'ARCHIVED']);
        });

        it('should handle product not found', async () => {
            productService.updateProduct.mockRejectedValue(new Error('Product not found'));

            const response = await request(app)
                .patch('/api/admin/products/1/status')
                .send({ status: 'ACTIVE' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should handle other service errors', async () => {
            productService.updateProduct.mockRejectedValue(new Error('Database error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const response = await request(app)
                .patch('/api/admin/products/1/status')
                .send({ status: 'ACTIVE' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to update product status');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error updating product status:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('POST /api/admin/products/:id/images (uploadProductImage)', () => {
        it('should upload product image successfully', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            const mockImage = { id: 1, alt: 'Test image', position: 0 };
            const mockCloudinaryData = {
                public_id: 'test_id',
                secure_url: 'https://test.com/image.jpg',
            };

            const jpegBuffer = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8Ii5+EAAEjgHFINFyHwAAAABJRU5ErkJggg==',
                'base64'
            );

            productService.getProductById.mockResolvedValue(mockProduct);
            imageService.createImage.mockResolvedValue({
                image: mockImage,
                cloudinaryData: mockCloudinaryData,
            });

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', jpegBuffer, 'test.jpg')
                .field('alt', 'Test image')
                .field('position', '1');

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Image uploaded successfully');
        });

        it('should use default alt text when not provided', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            productService.getProductById.mockResolvedValue(mockProduct);
            imageService.createImage.mockResolvedValue({
                image: { id: 1 },
                cloudinaryData: {},
            });

            await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', Buffer.from('fake image data'), 'test.jpg');

            expect(imageService.createImage).toHaveBeenCalledWith(
                expect.objectContaining({
                    alt: 'Product 1 image', // default alt
                })
            );
        });

        it('should handle image service errors', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            productService.getProductById.mockResolvedValue(mockProduct);
            imageService.createImage.mockRejectedValue(new Error('Image upload failed'));

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', Buffer.from('fake'), 'test.jpg');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Image upload failed');
            expect(logger.error).toHaveBeenCalledWith('Error uploading image:', expect.any(Error));
        });

        it('should return 400 for invalid product ID', async () => {
            const response = await request(app)
                .post('/api/admin/products/invalid/images')
                .send({ file: { buffer: Buffer.from('fake') } });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should return 404 when product not found', async () => {
            productService.getProductById.mockRejectedValue(new Error('Product not found'));

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .send({ file: { buffer: Buffer.from('fake') } });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Product not found');
        });

        it('should return 400 when no image file provided', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            productService.getProductById.mockResolvedValue(mockProduct);

            const response = await request(app).post('/api/admin/products/1/images').send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('No image file provided');
        });

        it('should handle image service errors', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            productService.getProductById.mockResolvedValue(mockProduct);
            imageService.createImage.mockRejectedValue(new Error('Image upload failed'));

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', Buffer.from('fake image data'), 'test.jpg');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Image upload failed');
            expect(logger.error).toHaveBeenCalledWith('Error uploading image:', expect.any(Error));
        });

        it('should handle unexpected product service errors', async () => {
            // Make getProductById throw an unexpected error
            productService.getProductById.mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', Buffer.from('fake image data'), 'test.jpg');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Database connection failed');
            expect(logger.error).toHaveBeenCalledWith('Error uploading image:', expect.any(Error));
        });

        it('should return default error message when error.message is falsy', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            productService.getProductById.mockResolvedValue(mockProduct);

            // Throw an error without a message
            imageService.createImage.mockImplementation(() => {
                throw {}; // no message property
            });

            const jpegBuffer = Buffer.from('fake image data');

            const response = await request(app)
                .post('/api/admin/products/1/images')
                .attach('file', jpegBuffer, 'test.jpg');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to upload image'); // default used
            expect(logger.error).toHaveBeenCalledWith('Error uploading image:', expect.any(Object));
        });
    });

    describe('GET /api/admin/products/:id/images (getProductImages)', () => {
        it('should get product images successfully', async () => {
            const mockImages = [
                { id: 1, alt: 'Image 1', position: 0 },
                { id: 2, alt: 'Image 2', position: 1 },
            ];
            imageService.getImagesByProductId.mockResolvedValue(mockImages);

            const response = await request(app).get('/api/admin/products/1/images');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockImages);
            expect(response.body.meta).toEqual({
                productId: 1,
                count: 2,
            });
        });

        it('should return 400 for invalid product ID', async () => {
            const response = await request(app).get('/api/admin/products/invalid/images');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID');
        });

        it('should handle service errors', async () => {
            imageService.getImagesByProductId.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/admin/products/1/images');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Database error');
            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching product images:',
                expect.any(Error)
            );
        });

        it('should handle service errors with no message', async () => {
            const errorWithoutMessage = new Error();
            errorWithoutMessage.message = '';
            imageService.getImagesByProductId.mockRejectedValue(errorWithoutMessage);

            const response = await request(app).get('/api/admin/products/1/images');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to fetch images');
        });
    });

    describe('DELETE /api/admin/products/:productId/images/:imageId (deleteProductImage)', () => {
        it('should delete product image successfully', async () => {
            const mockResult = { message: 'Image deleted successfully' };
            imageService.deleteImage.mockResolvedValue(mockResult);

            const response = await request(app).delete('/api/admin/products/1/images/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Image deleted successfully');
        });

        it("should use default message when service doesn't provide one", async () => {
            const mockResult = {};
            imageService.deleteImage.mockResolvedValue(mockResult);

            const response = await request(app).delete('/api/admin/products/1/images/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Image deleted successfully');
        });

        it('should return 400 for invalid product ID', async () => {
            const response = await request(app).delete('/api/admin/products/invalid/images/1');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID or image ID');
        });

        it('should return 400 for invalid image ID', async () => {
            const response = await request(app).delete('/api/admin/products/1/images/invalid');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid product ID or image ID');
        });

        it('should return 400 for zero or negative IDs', async () => {
            const response1 = await request(app).delete('/api/admin/products/0/images/1');
            const response2 = await request(app).delete('/api/admin/products/1/images/0');

            expect(response1.status).toBe(400);
            expect(response2.status).toBe(400);
        });

        it('should handle image not found', async () => {
            imageService.deleteImage.mockRejectedValue(new Error('Image not found'));

            const response = await request(app).delete('/api/admin/products/1/images/1');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Image not found');
        });

        it('should handle other service errors', async () => {
            imageService.deleteImage.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/admin/products/1/images/1');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Database error');
            expect(logger.error).toHaveBeenCalledWith('Error deleting image:', expect.any(Error));
        });

        it('should handle service errors with no message', async () => {
            const errorWithoutMessage = new Error();
            errorWithoutMessage.message = '';
            imageService.deleteImage.mockRejectedValue(errorWithoutMessage);

            const response = await request(app).delete('/api/admin/products/1/images/1');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Failed to delete image');
        });
    });

    describe('Edge cases and additional coverage', () => {
        it('should handle empty query parameters gracefully', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            const response = await request(app).get('/api/products').query({});

            expect(response.status).toBe(200);
            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'ACTIVE' }),
                expect.any(Object)
            );
        });

        it('should handle invalid status in query parameters', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app).get('/api/products').query({ status: 'INVALID_STATUS' });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'ACTIVE' }), // Should force ACTIVE for public API
                expect.any(Object)
            );
        });

        it('should handle invalid sortBy and sortOrder parameters', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app)
                .get('/api/products')
                .query({ sortBy: 'invalid', sortOrder: 'invalid' });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.any(Object),
                expect.not.objectContaining({ sortBy: 'invalid', sortOrder: 'invalid' })
            );
        });

        it('should handle NaN values in price range', async () => {
            const mockResult = {
                products: [],
                pagination: { page: 1, limit: 20, total: 0 },
            };
            productService.getAllProducts.mockResolvedValue(mockResult);

            await request(app)
                .get('/api/products')
                .query({ minPrice: 'invalid', maxPrice: 'invalid' });

            expect(productService.getAllProducts).toHaveBeenCalledWith(
                expect.objectContaining({
                    priceRange: { min: NaN, max: NaN },
                }),
                expect.any(Object)
            );
        });

        it('should handle variants validation without variants array', async () => {
            const response = await request(app).post('/api/admin/products').send({
                title: 'Test Product',
                handle: 'test-product',
            });

            expect(response.status).toBe(201);
        });

        it('should handle console.error calls properly', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Test different console.error scenarios that we might have missed
            productService.getAllProducts.mockRejectedValue(new Error('Test error'));

            await request(app).get('/api/admin/products');

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
