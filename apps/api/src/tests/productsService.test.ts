// tests/productService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma, ProductStatus } from '@prisma/client';
import prisma from '../config/database';
import {
    getAllProducts,
    getProductById,
    getProductByHandle,
    getProductsByCollection,
    createProduct,
    deleteProduct,
    updateProduct,
} from '../services/productService';

vi.mock('../config/database', () => ({
    default: {
        product: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        },
        productVariant: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
        productImage: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
        productOption: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
        productCollection: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

describe('Product Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('returns products with pagination and all filters', async () => {
            (prisma.product.findMany as any).mockResolvedValue([{ id: 1, title: 'Test Product' }]);
            (prisma.product.count as any).mockResolvedValue(25);

            const result = await getAllProducts(
                {
                    status: ProductStatus.ACTIVE,
                    vendor: 'Nike',
                    tags: ['shoes', 'sneakers'],
                    collectionId: 1,
                    priceRange: { min: 10, max: 50 },
                    search: 'sneaker',
                },
                { page: 2, limit: 10, sortBy: 'title', sortOrder: 'asc' }
            );

            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: {
                    status: ProductStatus.ACTIVE,
                    vendor: { contains: 'Nike', mode: 'insensitive' },
                    tags: { hasSome: ['shoes', 'sneakers'] },
                    collections: {
                        some: {
                            collectionId: 1,
                        },
                    },
                    variants: {
                        some: {
                            price: {
                                gte: 10,
                                lte: 50,
                            },
                        },
                    },
                    OR: [
                        { title: { contains: 'sneaker', mode: 'insensitive' } },
                        { bodyHtml: { contains: 'sneaker', mode: 'insensitive' } },
                        { vendor: { contains: 'sneaker', mode: 'insensitive' } },
                        { tags: { hasSome: ['sneaker'] } },
                    ],
                },
                include: expect.any(Object),
                orderBy: { title: 'asc' },
                skip: 10,
                take: 10,
            });

            expect(result.products).toEqual([{ id: 1, title: 'Test Product' }]);
            expect(result.pagination).toEqual({
                page: 2,
                limit: 10,
                totalCount: 25,
                totalPages: 3,
                hasNextPage: true,
                hasPrevPage: true,
            });
        });

        it('returns products with default pagination when no options provided', async () => {
            (prisma.product.findMany as any).mockResolvedValue([]);
            (prisma.product.count as any).mockResolvedValue(0);

            const result = await getAllProducts();

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                    skip: 0,
                    take: 20,
                })
            );

            expect(result.pagination).toEqual({
                page: 1,
                limit: 20,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            });
        });

        it('returns products with only price range min filter', async () => {
            (prisma.product.findMany as any).mockResolvedValue([]);
            (prisma.product.count as any).mockResolvedValue(0);

            await getAllProducts({
                priceRange: { min: 10 },
            });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        variants: {
                            some: {
                                price: {
                                    gte: 10,
                                },
                            },
                        },
                    },
                })
            );
        });

        it('returns products with only price range max filter', async () => {
            (prisma.product.findMany as any).mockResolvedValue([]);
            (prisma.product.count as any).mockResolvedValue(0);

            await getAllProducts({
                priceRange: { max: 50 },
            });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        variants: {
                            some: {
                                price: {
                                    lte: 50,
                                },
                            },
                        },
                    },
                })
            );
        });

        it('returns products with empty tags array (should not apply tags filter)', async () => {
            (prisma.product.findMany as any).mockResolvedValue([]);
            (prisma.product.count as any).mockResolvedValue(0);

            await getAllProducts({
                tags: [],
            });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });
    });

    describe('getProductById', () => {
        it('returns product when found', async () => {
            const mockProduct = { id: 1, title: 'Test Product' };
            (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

            const product = await getProductById(1);

            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expect.objectContaining({
                    variants: expect.any(Object),
                    images: expect.any(Object),
                    options: expect.any(Object),
                    collections: expect.any(Object),
                }),
            });
            expect(product).toEqual(mockProduct);
        });

        it('throws when product not found', async () => {
            (prisma.product.findUnique as any).mockResolvedValue(null);

            await expect(getProductById(1)).rejects.toThrow('Product not found');
        });
    });

    describe('getProductByHandle', () => {
        it('returns product when found', async () => {
            const mockProduct = { handle: 'test-product', title: 'Test Product' };
            (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

            const product = await getProductByHandle('test-product');

            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { handle: 'test-product' },
                include: expect.objectContaining({
                    variants: expect.any(Object),
                    images: expect.any(Object),
                    options: expect.any(Object),
                    collections: expect.any(Object),
                }),
            });
            expect(product).toEqual(mockProduct);
        });

        it('throws when product not found', async () => {
            (prisma.product.findUnique as any).mockResolvedValue(null);

            await expect(getProductByHandle('non-existent')).rejects.toThrow('Product not found');
        });
    });

    describe('getProductsByCollection', () => {
        it('returns products from collection with default pagination', async () => {
            const mockProducts = [{ id: 1, title: 'Product 1' }];
            (prisma.product.findMany as any).mockResolvedValue(mockProducts);

            const products = await getProductsByCollection(1);

            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: {
                    collections: {
                        some: {
                            collectionId: 1,
                        },
                    },
                    status: ProductStatus.ACTIVE,
                },
                include: expect.any(Object),
                skip: 0,
                take: 20,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            expect(products).toEqual(mockProducts);
        });

        it('returns products from collection with custom pagination', async () => {
            const mockProducts = [{ id: 1, title: 'Product 1' }];
            (prisma.product.findMany as any).mockResolvedValue(mockProducts);

            const products = await getProductsByCollection(1, { page: 2, limit: 5 });

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 5,
                    take: 5,
                })
            );
            expect(products).toEqual(mockProducts);
        });
    });

    describe('createProduct', () => {
        it('creates product successfully with all relations', async () => {
            const mockProduct = { id: 1, title: 'New Product' };
            (prisma.product.create as any).mockResolvedValue(mockProduct);

            const productData = {
                title: 'New Product',
                handle: 'new-product',
                bodyHtml: 'Description',
                vendor: 'Test Vendor',
                variants: [{ title: 'Default', price: 10 }],
                images: [{ src: 'image1.jpg' }, { src: 'image2.jpg', position: 5 }],
                options: [{ name: 'Size', values: ['S', 'M', 'L'] }],
                collectionIds: [1, 2],
            };

            const product = await createProduct(productData as any);

            expect(prisma.product.create).toHaveBeenCalledWith({
                data: {
                    title: 'New Product',
                    handle: 'new-product',
                    bodyHtml: 'Description',
                    vendor: 'Test Vendor',
                    variants: {
                        create: [{ title: 'Default', price: 10, position: 1 }],
                    },
                    images: {
                        create: [
                            { src: 'image1.jpg', position: 1 },
                            { src: 'image2.jpg', position: 5 },
                        ],
                    },
                    options: {
                        create: [{ name: 'Size', values: ['S', 'M', 'L'] }],
                    },
                    collections: {
                        create: [
                            { collectionId: 1, position: 1 },
                            { collectionId: 2, position: 2 },
                        ],
                    },
                },
                include: expect.any(Object),
            });
            expect(product).toEqual(mockProduct);
        });

        it('creates product with minimal data (empty arrays)', async () => {
            const mockProduct = { id: 1, title: 'Minimal Product' };
            (prisma.product.create as any).mockResolvedValue(mockProduct);

            const productData = {
                title: 'Minimal Product',
                handle: 'minimal-product',
            };

            const product = await createProduct(productData);

            expect(prisma.product.create).toHaveBeenCalledWith({
                data: {
                    title: 'Minimal Product',
                    handle: 'minimal-product',
                    variants: { create: [] },
                    images: { create: [] },
                    options: { create: [] },
                    collections: { create: [] },
                },
                include: expect.any(Object),
            });
            expect(product).toEqual(mockProduct);
        });

        it('throws for duplicate handle (P2002 error)', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';

            (prisma.product.create as any).mockRejectedValue(prismaError);

            await expect(
                createProduct({
                    title: 'Duplicate',
                    handle: 'duplicate',
                } as any)
            ).rejects.toThrow('Product with this handle already exists');
        });

        it('rethrows non-Prisma errors', async () => {
            const genericError = new Error('Database connection failed');
            (prisma.product.create as any).mockRejectedValue(genericError);

            await expect(
                createProduct({
                    title: 'Test',
                    handle: 'test',
                } as any)
            ).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2002', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';

            (prisma.product.create as any).mockRejectedValue(prismaError);

            await expect(
                createProduct({
                    title: 'Test',
                    handle: 'test',
                } as any)
            ).rejects.toThrow(prismaError);
        });
    });

    describe('deleteProduct', () => {
        it('deletes product successfully', async () => {
            (prisma.product.findUnique as any).mockResolvedValue({ id: 1, title: 'Test Product' });
            (prisma.product.delete as any).mockResolvedValue({});

            const result = await deleteProduct(1);

            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { id: true, title: true },
            });
            expect(prisma.product.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result.message).toBe('Product "Test Product" deleted successfully');
        });

        it('throws when product not found before delete', async () => {
            (prisma.product.findUnique as any).mockResolvedValue(null);

            await expect(deleteProduct(1)).rejects.toThrow('Product not found');
            expect(prisma.product.delete).not.toHaveBeenCalled();
        });

        it('throws P2025 error during delete operation', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2025';

            (prisma.product.findUnique as any).mockResolvedValue({ id: 1, title: 'Test' });
            (prisma.product.delete as any).mockRejectedValue(prismaError);

            await expect(deleteProduct(1)).rejects.toThrow('Product not found');
        });

        it('rethrows non-Prisma errors', async () => {
            const genericError = new Error('Database connection failed');
            (prisma.product.findUnique as any).mockResolvedValue({ id: 1, title: 'Test' });
            (prisma.product.delete as any).mockRejectedValue(genericError);

            await expect(deleteProduct(1)).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2025', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';

            (prisma.product.findUnique as any).mockResolvedValue({ id: 1, title: 'Test' });
            (prisma.product.delete as any).mockRejectedValue(prismaError);

            await expect(deleteProduct(1)).rejects.toThrow(prismaError);
        });
    });

    describe('updateProduct', () => {
        const mockTransactionProduct = { id: 1, title: 'Updated Product' };

        beforeEach(() => {
            (prisma.$transaction as any).mockImplementation(async (cb: any) => {
                return cb({
                    product: {
                        update: vi.fn().mockResolvedValue({ id: 1 }),
                        findUnique: vi.fn().mockResolvedValue(mockTransactionProduct),
                    },
                    productVariant: { deleteMany: vi.fn(), createMany: vi.fn() },
                    productImage: { deleteMany: vi.fn(), createMany: vi.fn() },
                    productOption: { deleteMany: vi.fn(), createMany: vi.fn() },
                    productCollection: { deleteMany: vi.fn(), createMany: vi.fn() },
                });
            });
        });

        it('updates product with all relations', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                handle: 'updated-product',
                variants: [{ title: 'Variant 1', price: 20 }],
                images: [{ src: 'new-image.jpg' }, { src: 'image2.jpg', position: 3 }],
                options: [{ name: 'Color', values: ['Red', 'Blue'] }],
                collectionIds: [2, 3],
            };

            const result = await updateProduct(updateData as any);

            expect(prisma.$transaction).toHaveBeenCalled();
            expect(result).toEqual(mockTransactionProduct);
        });

        it('updates product without variants (variants is undefined)', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                // variants is undefined
            };

            await updateProduct(updateData);

            // Verify transaction was called but variants operations were not
            expect(prisma.$transaction).toHaveBeenCalled();
            const transactionCallback = (prisma.$transaction as any).mock.calls[0][0];
            const mockTx = {
                product: {
                    update: vi.fn().mockResolvedValue({ id: 1 }),
                    findUnique: vi.fn().mockResolvedValue(mockTransactionProduct),
                },
                productVariant: { deleteMany: vi.fn(), createMany: vi.fn() },
                productImage: { deleteMany: vi.fn(), createMany: vi.fn() },
                productOption: { deleteMany: vi.fn(), createMany: vi.fn() },
                productCollection: { deleteMany: vi.fn(), createMany: vi.fn() },
            };

            await transactionCallback(mockTx);
            expect(mockTx.productVariant.deleteMany).not.toHaveBeenCalled();
        });

        it('updates product with empty variants array', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                variants: [], // empty array
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
            const transactionCallback = (prisma.$transaction as any).mock.calls[0][0];
            const mockTx = {
                product: {
                    update: vi.fn().mockResolvedValue({ id: 1 }),
                    findUnique: vi.fn().mockResolvedValue(mockTransactionProduct),
                },
                productVariant: { deleteMany: vi.fn(), createMany: vi.fn() },
                productImage: { deleteMany: vi.fn(), createMany: vi.fn() },
                productOption: { deleteMany: vi.fn(), createMany: vi.fn() },
                productCollection: { deleteMany: vi.fn(), createMany: vi.fn() },
            };

            await transactionCallback(mockTx);
            expect(mockTx.productVariant.deleteMany).toHaveBeenCalled();
            expect(mockTx.productVariant.createMany).not.toHaveBeenCalled();
        });

        it('updates product without images (images is undefined)', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('updates product with empty images array', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                images: [],
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('updates product without options (options is undefined)', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('updates product with empty options array', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                options: [],
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('updates product without collectionIds (collectionIds is undefined)', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('updates product with empty collectionIds array', async () => {
            const updateData = {
                id: 1,
                title: 'Updated Product',
                collectionIds: [],
            };

            await updateProduct(updateData);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('throws P2002 duplicate handle error', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';

            (prisma.$transaction as any).mockRejectedValue(prismaError);

            await expect(
                updateProduct({
                    id: 1,
                    handle: 'duplicate',
                } as any)
            ).rejects.toThrow('Product with this handle already exists');
        });

        it('throws P2025 product not found error', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2025';

            (prisma.$transaction as any).mockRejectedValue(prismaError);

            await expect(
                updateProduct({
                    id: 999,
                    title: 'Non-existent',
                } as any)
            ).rejects.toThrow('Product not found');
        });

        it('rethrows non-Prisma errors', async () => {
            const genericError = new Error('Database connection failed');
            (prisma.$transaction as any).mockRejectedValue(genericError);

            await expect(
                updateProduct({
                    id: 1,
                    title: 'Test',
                } as any)
            ).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2002 or P2025', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';

            (prisma.$transaction as any).mockRejectedValue(prismaError);

            await expect(
                updateProduct({
                    id: 1,
                    title: 'Test',
                } as any)
            ).rejects.toThrow(prismaError);
        });
    });
});
