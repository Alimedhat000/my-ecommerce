import request from 'supertest';
import path from 'path';
import app from '../app'; // Adjust path to your Express app
import { vi } from 'vitest';

vi.mock('cloudinary', () => import('./__mocks__/cloudinary'));
vi.mock('../middleware/authMiddleware', () => import('./__mocks__/authorizeAdmin'));

describe('Product Creation Flow with Images', () => {
    let productId;
    let imageId;

    // Sample product data
    const sampleProduct = {
        title: 'Premium Wireless Headphones',
        handle: 'premium-wireless-headphones',
        bodyHtml: '<p>Experience superior sound quality with our premium wireless headphones.</p>',
        vendor: 'AudioTech',
        tags: ['electronics', 'audio', 'wireless'],
        status: 'ACTIVE',
        variants: [
            {
                title: 'Black',
                price: 199.99,
                compareAtPrice: 249.99,
                sku: 'PWH-BLK-001',
                inventoryQty: 50,
                weight: 0.3,
                position: 2,
            },
            {
                title: 'White',
                price: 199.99,
                compareAtPrice: 249.99,
                sku: 'PWH-WHT-001',
                inventoryQty: 30,
                weight: 0.3,
                position: 1,
            },
        ],
    };

    // Mock image buffer for testing
    const mockImageBuffer = Buffer.from('mock-image-data');

    describe('1. Product Creation', () => {
        test('should create a new product successfully', async () => {
            const response = await request(app)
                .post('/api/admin/products')
                .send(sampleProduct)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(sampleProduct.title);
            expect(response.body.data.handle).toBe(sampleProduct.handle);
            expect(response.body.data.variants).toHaveLength(2);

            productId = response.body.data.id;
        });

        test('should fail with duplicate handle', async () => {
            const duplicateProduct = { ...sampleProduct };

            await request(app).post('/api/admin/products').send(duplicateProduct).expect(400);
        });

        test('should validate required fields', async () => {
            const invalidProduct = {
                description: 'Missing title and handle',
            };

            const response = await request(app)
                .post('/api/admin/products')
                .send(invalidProduct)
                .expect(400);

            expect(response.body.details).toContain('Product title is required');
            expect(response.body.details).toContain('Product handle is required');
        });
    });

    describe('2. Image Management', () => {
        test('should upload product image successfully', async () => {
            // Create a test image file
            const testImagePath = path.join(__dirname, 'test-image.jpg');

            // Create a minimal JPEG buffer for testing
            const jpegBuffer = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8Ii5+EAAEjgHFINFyHwAAAABJRU5ErkJggg==',
                'base64'
            );

            const response = await request(app)
                .post(`/api/admin/products/${productId}/images`)
                .attach('image', jpegBuffer, 'test-image.jpg')
                .field('alt', 'Product main image')
                .field('position', '0')
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.image).toBeDefined();
            expect(response.body.data.image.alt).toBe('Product main image');

            imageId = response.body.data.image.id;
        });

        test('should get all product images', async () => {
            const response = await request(app)
                .get(`/api/admin/products/${productId}/images`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.meta.count).toBeGreaterThan(0);
        });

        test('should fail to upload image for non-existent product', async () => {
            const jpegBuffer = Buffer.from('mock-image');

            await request(app)
                .post('/api/admin/products/99999/images')
                .attach('image', jpegBuffer, 'test.jpg')
                .expect(404);
        });

        test('should delete product image successfully', async () => {
            const response = await request(app)
                .delete(`/api/admin/products/${productId}/images/${imageId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('3. Product Retrieval', () => {
        test('should get product by ID (admin)', async () => {
            const response = await request(app).get(`/api/admin/products/${productId}`).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(productId);
        });

        test('should get product by handle (public)', async () => {
            const response = await request(app)
                .get(`/api/products/handle/${sampleProduct.handle}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.handle).toBe(sampleProduct.handle);
        });

        test('should not return draft products in public API', async () => {
            // Update product to draft status
            await request(app)
                .patch(`/api/admin/products/${productId}/status`)
                .send({ status: 'DRAFT' })
                .expect(200);

            // Should not be accessible via public API
            await request(app).get(`/api/products/${productId}`).expect(404);

            // But should be accessible via admin API
            await request(app).get(`/api/admin/products/${productId}`).expect(200);
        });
    });

    describe('4. Product Updates', () => {
        test('should update product successfully', async () => {
            const updateData = {
                title: 'Updated Premium Wireless Headphones',
                bodyHtml: 'Updated description',
                handle: 'updated-premium-wireless-headphones',
            };

            const response = await request(app)
                .put(`/api/admin/products/${productId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updateData.title);
        });

        test('should update product status', async () => {
            const response = await request(app)
                .patch(`/api/admin/products/${productId}/status`)
                .send({ status: 'ACTIVE' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('ACTIVE');
            expect(response.body.data.publishedAt).toBeDefined();
        });
    });

    describe('5. Product Filtering and Pagination', () => {
        test('should filter products by status', async () => {
            const response = await request(app)
                .get('/api/admin/products?status=ACTIVE')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        test('should paginate products', async () => {
            const response = await request(app)
                .get('/api/admin/products?page=1&limit=5')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });

        test('should search products', async () => {
            const response = await request(app)
                .get('/api/admin/products?search=headphones')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });

    describe('6. Product Deletion', () => {
        test('should delete product successfully', async () => {
            const response = await request(app)
                .delete(`/api/admin/products/${productId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should return 404 for deleted product', async () => {
            await request(app).get(`/api/admin/products/${productId}`).expect(404);
        });
    });
});

// Integration test for complete workflow
describe('Complete Product Workflow Integration', () => {
    let workflowProductId;

    test('should complete full product lifecycle', async () => {
        // 1. Create product in draft status

        const newProduct = {
            title: 'Test Workflow Product',
            handle: 'test-workflow-product',
            bodyHtml: '<p>Product for testing complete workflow</p>',
            vendor: 'AudioTech',
            status: 'DRAFT',
            variants: [
                {
                    title: 'Default',
                    price: 49.99,
                    sku: 'TWP-001',
                    inventoryQty: 10,
                },
            ],
        };

        const createResponse = await request(app)
            .post('/api/admin/products')
            .send(newProduct)
            .expect(201);

        workflowProductId = createResponse.body.data.id;

        // 2. Upload images
        const base64 =
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8Ii5+EAAEjgHFINFyHwAAAABJRU5ErkJggg==';

        const image1 = Buffer.from(base64, 'base64');
        const image2 = Buffer.from(base64, 'base64');

        await request(app)
            .post(`/api/admin/products/${workflowProductId}/images`)
            .attach('image', image1, 'image1.jpg')
            .field('alt', 'Main product image')
            .field('position', '0')
            .expect(201);

        await request(app)
            .post(`/api/admin/products/${workflowProductId}/images`)
            .attach('image', image2, 'image2.jpg')
            .field('alt', 'Secondary product image')
            .field('position', '1')
            .expect(201);

        // 3. Verify images were uploaded
        const imagesResponse = await request(app)
            .get(`/api/admin/products/${workflowProductId}/images`)
            .expect(200);

        expect(imagesResponse.body.data).toHaveLength(2);

        // 4. Update product details
        await request(app)
            .put(`/api/admin/products/${workflowProductId}`)
            .send({
                title: 'Updated Workflow Product',
                handle: 'updated-test-workflow-product',
                bodyHtml: '<p>Updated Product for testing complete workflow</p>',
            })
            .expect(200);

        // 5. Publish the product
        await request(app)
            .patch(`/api/admin/products/${workflowProductId}/status`)
            .send({ status: 'ACTIVE' })
            .expect(200);

        // 6. Verify product is now public
        const publicResponse = await request(app)
            .get(`/api/products/${workflowProductId}`)
            .expect(200);

        expect(publicResponse.body.data.status).toBe('ACTIVE');
        expect(publicResponse.body.data.publishedAt).toBeDefined();

        // 7. Archive the product
        await request(app)
            .patch(`/api/admin/products/${workflowProductId}/status`)
            .send({ status: 'ARCHIVED' })
            .expect(200);

        // 8. Verify product is no longer public
        await request(app).get(`/api/products/${workflowProductId}`).expect(404);

        // 9. Clean up - delete the product
        await request(app).delete(`/api/admin/products/${workflowProductId}`).expect(200);
    });
});

// Performance and edge case tests
describe('Product API Edge Cases and Performance', () => {
    test('should handle invalid product IDs gracefully', async () => {
        await request(app).get('/api/admin/products/invalid-id').expect(400);

        await request(app).get('/api/admin/products/-1').expect(400);
    });

    test('should handle large product queries', async () => {
        const response = await request(app).get('/api/admin/products?limit=100').expect(200);

        expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    test('should validate handle format strictly', async () => {
        const invalidHandles = [
            'Handle With Spaces',
            'handle_with_underscores',
            'Handle-With-CAPS',
            'handle@with@symbols',
        ];

        for (const handle of invalidHandles) {
            const product = {
                title: 'Test Product',
                handle,
                variants: [{ title: 'Default', price: 10 }],
            };

            const response = await request(app)
                .post('/api/admin/products')
                .send(product)
                .expect(400);

            expect(response.body.details).toContain(
                'Handle must contain only lowercase letters, numbers, and hyphens'
            );
        }
    });

    test('should handle concurrent image uploads', async () => {
        // Create a test product first
        const product = {
            title: 'Concurrent Upload Test',
            handle: 'concurrent-upload-test',
            variants: [{ title: 'Default', price: 15 }],
        };

        const createResponse = await request(app)
            .post('/api/admin/products')
            .send(product)
            .expect(201);

        const productId = createResponse.body.data.id;

        // Upload multiple images concurrently
        const uploadPromises = [];
        for (let i = 0; i < 3; i++) {
            const base64 =
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8Ii5+EAAEjgHFINFyHwAAAABJRU5ErkJggg==';
            const imageBuffer = Buffer.from(base64, 'base64');
            uploadPromises.push(
                request(app)
                    .post(`/api/admin/products/${productId}/images`)
                    .attach('image', imageBuffer, `image${i}.jpg`)
                    .field('alt', `Concurrent image ${i}`)
                    .field('position', i.toString())
            );
        }

        const responses = await Promise.all(uploadPromises);
        responses.forEach((response) => {
            expect(response.status).toBe(201);
        });

        // Verify all images were uploaded
        const imagesResponse = await request(app)
            .get(`/api/admin/products/${productId}/images`)
            .expect(200);

        expect(imagesResponse.body.data).toHaveLength(3);

        // Cleanup
        await request(app).delete(`/api/admin/products/${productId}`).expect(200);
    });
});
