// tests/imageService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import cloudinary from '../config/cloudinary';
import prisma from '../config/database';
import {
    uploadToCloudinary,
    generateImageSizes,
    extractPublicIdFromUrl,
    createImage,
    updateImage,
    deleteImage,
    getImagesByProductId,
} from '../services/imageService';

// Mock cloudinary
vi.mock('../config/cloudinary', () => ({
    default: {
        uploader: {
            upload: vi.fn(),
            destroy: vi.fn(),
        },
        url: vi.fn(),
    },
}));

// Mock prisma
vi.mock('../config/database', () => ({
    default: {
        productImage: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe('Image Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('uploadToCloudinary', () => {
        const mockCloudinaryResult = {
            public_id: 'products/test-image',
            url: 'http://res.cloudinary.com/test/image/upload/v123/products/test-image.jpg',
            secure_url: 'https://res.cloudinary.com/test/image/upload/v123/products/test-image.jpg',
            width: 800,
            height: 600,
            format: 'jpg',
            bytes: 50000,
        };

        it('uploads buffer successfully with default options', async () => {
            (cloudinary.uploader.upload as any).mockResolvedValue(mockCloudinaryResult);

            const buffer = Buffer.from('test image data');
            const result = await uploadToCloudinary(buffer);

            expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
                `data:image/jpeg;base64,${buffer.toString('base64')}`,
                {
                    folder: 'products',
                    quality: 'auto',
                    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
                }
            );

            expect(result).toEqual({
                publicId: 'products/test-image',
                url: 'http://res.cloudinary.com/test/image/upload/v123/products/test-image.jpg',
                secureUrl:
                    'https://res.cloudinary.com/test/image/upload/v123/products/test-image.jpg',
                width: 800,
                height: 600,
                format: 'jpg',
                bytes: 50000,
            });
        });

        it('uploads string (base64) successfully', async () => {
            (cloudinary.uploader.upload as any).mockResolvedValue(mockCloudinaryResult);

            const base64String =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            const result = await uploadToCloudinary(base64String);

            expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
                base64String,
                expect.any(Object)
            );
            expect(result.publicId).toBe('products/test-image');
        });

        it('uploads with custom options', async () => {
            (cloudinary.uploader.upload as any).mockResolvedValue(mockCloudinaryResult);

            const buffer = Buffer.from('test image data');
            const options = {
                folder: 'custom-folder',
                quality: 80,
                format: 'webp' as const,
            };

            await uploadToCloudinary(buffer, options);

            expect(cloudinary.uploader.upload).toHaveBeenCalledWith(expect.any(String), {
                folder: 'custom-folder',
                quality: 80,
                transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
            });
        });

        it('uploads with generateSizes option and adds sizes', async () => {
            (cloudinary.uploader.upload as any).mockResolvedValue(mockCloudinaryResult);
            (cloudinary.url as any)
                .mockReturnValueOnce('https://cloudinary.com/thumbnail.jpg')
                .mockReturnValueOnce('https://cloudinary.com/small.jpg')
                .mockReturnValueOnce('https://cloudinary.com/medium.jpg')
                .mockReturnValueOnce('https://cloudinary.com/large.jpg');

            const buffer = Buffer.from('test image data');
            const result = await uploadToCloudinary(buffer, { generateSizes: true });

            expect(result.sizes).toEqual({
                thumbnail: 'https://cloudinary.com/thumbnail.jpg',
                small: 'https://cloudinary.com/small.jpg',
                medium: 'https://cloudinary.com/medium.jpg',
                large: 'https://cloudinary.com/large.jpg',
            });
        });

        it('throws error when cloudinary upload fails', async () => {
            const cloudinaryError = new Error('Cloudinary upload failed');
            (cloudinary.uploader.upload as any).mockRejectedValue(cloudinaryError);

            const buffer = Buffer.from('test image data');

            await expect(uploadToCloudinary(buffer)).rejects.toThrow(
                'Failed to upload image: Cloudinary upload failed'
            );
        });
    });

    describe('generateImageSizes', () => {
        it('generates all image sizes with correct transformations', () => {
            (cloudinary.url as any)
                .mockReturnValueOnce('https://cloudinary.com/thumbnail.jpg')
                .mockReturnValueOnce('https://cloudinary.com/small.jpg')
                .mockReturnValueOnce('https://cloudinary.com/medium.jpg')
                .mockReturnValueOnce('https://cloudinary.com/large.jpg');

            const publicId = 'products/test-image';
            const sizes = generateImageSizes(publicId);

            expect(cloudinary.url).toHaveBeenCalledWith(publicId, {
                width: 150,
                height: 150,
                crop: 'fill',
                gravity: 'center',
                quality: 'auto',
                format: 'auto',
            });

            expect(cloudinary.url).toHaveBeenCalledWith(publicId, {
                width: 300,
                height: 300,
                crop: 'limit',
                quality: 'auto',
                format: 'auto',
            });

            expect(cloudinary.url).toHaveBeenCalledWith(publicId, {
                width: 600,
                height: 600,
                crop: 'limit',
                quality: 'auto',
                format: 'auto',
            });

            expect(cloudinary.url).toHaveBeenCalledWith(publicId, {
                width: 1200,
                height: 1200,
                crop: 'limit',
                quality: 'auto',
                format: 'auto',
            });

            expect(sizes).toEqual({
                thumbnail: 'https://cloudinary.com/thumbnail.jpg',
                small: 'https://cloudinary.com/small.jpg',
                medium: 'https://cloudinary.com/medium.jpg',
                large: 'https://cloudinary.com/large.jpg',
            });
        });
    });

    describe('extractPublicIdFromUrl', () => {
        it('extracts public ID from cloudinary URL with version', () => {
            const url =
                'https://res.cloudinary.com/demo/image/upload/v1234567890/products/test-image.jpg';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBe('products/test-image');
        });

        it('extracts public ID from cloudinary URL without version', () => {
            const url = 'https://res.cloudinary.com/demo/image/upload/products/test-image.jpg';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBe('products/test-image');
        });

        it('extracts public ID from nested folder structure', () => {
            const url =
                'https://res.cloudinary.com/demo/image/upload/v1234567890/products/category/subcategory/image.png';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBe('products/category/subcategory/image');
        });

        it('returns null for non-cloudinary URLs', () => {
            const url = 'https://example.com/images/test.jpg';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBeNull();
        });

        it('returns null when URL parsing throws error', () => {
            const url = 'invalid-url';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBeNull();
        });

        it('returns null for URLs without upload segment', () => {
            const url = 'https://res.cloudinary.com/demo/image/transform/test-image.jpg';
            const publicId = extractPublicIdFromUrl(url);
            expect(publicId).toBeNull();
        });

        it('returns null on invalid input', () => {
            // @ts-expect-error we intentionally pass a non-string
            expect(extractPublicIdFromUrl(undefined)).toBeNull();

            // another case: passing an object
            // @ts-expect-error invalid input
            expect(extractPublicIdFromUrl({})).toBeNull();
        });
    });

    describe('createImage', () => {
        const mockCloudinaryResult = {
            publicId: 'products/1/test-image',
            url: 'http://cloudinary.com/test.jpg',
            secureUrl: 'https://cloudinary.com/test.jpg',
            width: 800,
            height: 600,
            format: 'jpg',
            bytes: 50000,
        };

        const mockCreatedImage = {
            id: 1,
            productId: 1,
            src: 'https://cloudinary.com/test.jpg',
            alt: 'Test image',
            width: 800,
            height: 600,
            position: 1,
            product: {
                id: 1,
                title: 'Test Product',
                handle: 'test-product',
            },
            variants: [],
        };

        beforeEach(() => {
            (prisma.productImage.create as any).mockResolvedValue(mockCreatedImage);
        });

        it('creates image with buffer upload', async () => {
            (cloudinary.uploader.upload as any).mockResolvedValue({
                public_id: 'products/1/test-image',
                url: 'http://cloudinary.com/test.jpg',
                secure_url: 'https://cloudinary.com/test.jpg',
                width: 800,
                height: 600,
                format: 'jpg',
                bytes: 50000,
            });

            const buffer = Buffer.from('test image data');
            const createData = {
                productId: 1,
                alt: 'Test image',
                position: 1,
                imageBuffer: buffer,
                uploadOptions: {
                    generateSizes: true,
                    quality: 80 as const,
                },
            };

            const result = await createImage(createData);

            expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
                expect.stringContaining('data:image/jpeg;base64,'),
                expect.objectContaining({
                    folder: 'products/1',
                    quality: 80,
                    transformation: expect.any(Array),
                })
            );

            expect(prisma.productImage.create).toHaveBeenCalledWith({
                data: {
                    productId: 1,
                    alt: 'Test image',
                    position: 1,
                    src: 'https://cloudinary.com/test.jpg',
                    width: 800,
                    height: 600,
                },
                include: expect.any(Object),
            });

            expect(result.image).toEqual(mockCreatedImage);
            expect(result.cloudinaryData).toBeDefined();
        });

        it('creates image with src URL (no buffer)', async () => {
            const createData = {
                productId: 1,
                src: 'https://example.com/external-image.jpg',
                alt: 'External image',
                width: 400,
                height: 300,
                position: 2,
            };

            const result = await createImage(createData);

            expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
            expect(prisma.productImage.create).toHaveBeenCalledWith({
                data: {
                    productId: 1,
                    src: 'https://example.com/external-image.jpg',
                    alt: 'External image',
                    width: 400,
                    height: 300,
                    position: 2,
                },
                include: expect.any(Object),
            });

            expect(result.image).toEqual(mockCreatedImage);
            expect(result.cloudinaryData).toBeNull();
        });

        it('creates image with auto-generated alt text when not provided', async () => {
            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
            };

            await createImage(createData);

            expect(prisma.productImage.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    alt: 'Image for product 1',
                }),
                include: expect.any(Object),
            });
        });

        it('creates image with position converted from string to number', async () => {
            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
                position: '3' as any, // Simulating string input
            };

            await createImage(createData);

            expect(prisma.productImage.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    position: 3,
                }),
                include: expect.any(Object),
            });
        });

        it('creates image without position when not provided', async () => {
            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
            };

            await createImage(createData);

            expect(prisma.productImage.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    position: undefined,
                }),
                include: expect.any(Object),
            });
        });

        it('throws error when neither imageBuffer nor src is provided', async () => {
            const createData = {
                productId: 1,
                alt: 'Test image',
            };

            await expect(createImage(createData)).rejects.toThrow(
                'Either imageBuffer or src must be provided'
            );
        });

        it('throws error for P2002 (duplicate Shopify ID)', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';

            (prisma.productImage.create as any).mockRejectedValue(prismaError);

            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
                shopifyId: 'duplicate-id',
            };

            await expect(createImage(createData)).rejects.toThrow(
                'Image with this Shopify ID already exists'
            );
        });

        it('rethrows non-Prisma errors', async () => {
            const genericError = new Error('Database connection failed');
            (prisma.productImage.create as any).mockRejectedValue(genericError);

            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
            };

            await expect(createImage(createData)).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2002', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';

            (prisma.productImage.create as any).mockRejectedValue(prismaError);

            const createData = {
                productId: 1,
                src: 'https://example.com/image.jpg',
            };

            await expect(createImage(createData)).rejects.toThrow(prismaError);
        });
    });

    describe('updateImage', () => {
        const mockUpdatedImage = {
            id: 1,
            productId: 1,
            src: 'https://example.com/updated-image.jpg',
            alt: 'Updated image',
            width: 800,
            height: 600,
            position: 2,
            product: {
                id: 1,
                title: 'Test Product',
                handle: 'test-product',
            },
            variants: [],
        };

        it('updates image successfully', async () => {
            (prisma.productImage.update as any).mockResolvedValue(mockUpdatedImage);

            const updateData = {
                id: 1,
                alt: 'Updated image',
                position: 2,
                width: 800,
                height: 600,
            };

            const result = await updateImage(updateData);

            expect(prisma.productImage.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    alt: 'Updated image',
                    position: 2,
                    width: 800,
                    height: 600,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            handle: true,
                        },
                    },
                    variants: true,
                },
            });

            expect(result).toEqual(mockUpdatedImage);
        });

        it('throws error for P2025 (image not found)', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2025';

            (prisma.productImage.update as any).mockRejectedValue(prismaError);

            const updateData = {
                id: 999,
                alt: 'Non-existent image',
            };

            await expect(updateImage(updateData)).rejects.toThrow('Image not found');
        });

        it('rethrows non-Prisma errors', async () => {
            const genericError = new Error('Database connection failed');
            (prisma.productImage.update as any).mockRejectedValue(genericError);

            const updateData = {
                id: 1,
                alt: 'Test update',
            };

            await expect(updateImage(updateData)).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2025', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';

            (prisma.productImage.update as any).mockRejectedValue(prismaError);

            const updateData = {
                id: 1,
                alt: 'Test update',
            };

            await expect(updateImage(updateData)).rejects.toThrow(prismaError);
        });
    });

    describe('deleteImage', () => {
        const mockExistingImage = {
            id: 1,
            src: 'https://res.cloudinary.com/demo/image/upload/v123/products/test-image.jpg',
            alt: 'Test image',
            product: {
                title: 'Test Product',
            },
        };

        it('deletes image successfully with Cloudinary cleanup', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(mockExistingImage);
            (cloudinary.uploader.destroy as any).mockResolvedValue({ result: 'ok' });
            (prisma.productImage.delete as any).mockResolvedValue({});

            const result = await deleteImage(1);

            expect(prisma.productImage.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    src: true,
                    alt: true,
                    product: {
                        select: {
                            title: true,
                        },
                    },
                },
            });

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('products/test-image');
            expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 1 } });

            expect(result.message).toBe(
                'Image "Test image" deleted successfully from product "Test Product"'
            );
        });

        it('deletes image with unnamed alt text', async () => {
            const imageWithoutAlt = {
                ...mockExistingImage,
                alt: null,
            };
            (prisma.productImage.findUnique as any).mockResolvedValue(imageWithoutAlt);
            (cloudinary.uploader.destroy as any).mockResolvedValue({ result: 'ok' });
            (prisma.productImage.delete as any).mockResolvedValue({});

            const result = await deleteImage(1);

            expect(result.message).toBe(
                'Image "Unnamed" deleted successfully from product "Test Product"'
            );
        });

        it('deletes image with non-Cloudinary URL (no cleanup)', async () => {
            const imageWithExternalUrl = {
                ...mockExistingImage,
                src: 'https://example.com/external-image.jpg',
            };
            (prisma.productImage.findUnique as any).mockResolvedValue(imageWithExternalUrl);
            (prisma.productImage.delete as any).mockResolvedValue({});

            await deleteImage(1);

            expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
            expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('continues deletion even when Cloudinary cleanup fails', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(mockExistingImage);
            (cloudinary.uploader.destroy as any).mockRejectedValue(new Error('Cloudinary error'));
            (prisma.productImage.delete as any).mockResolvedValue({});

            // Mock console.warn to avoid noise in test output
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const result = await deleteImage(1);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to delete from Cloudinary:',
                'Cloudinary error'
            );
            expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result.message).toContain('deleted successfully');

            consoleSpy.mockRestore();
        });

        it('throws error when image not found initially', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(null);

            await expect(deleteImage(1)).rejects.toThrow('Image not found');
            expect(prisma.productImage.delete).not.toHaveBeenCalled();
        });

        it('throws error for P2025 during database deletion', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(mockExistingImage);
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2025';
            (prisma.productImage.delete as any).mockRejectedValue(prismaError);

            await expect(deleteImage(1)).rejects.toThrow('Image not found');
        });

        it('rethrows non-Prisma errors', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(mockExistingImage);
            const genericError = new Error('Database connection failed');
            (prisma.productImage.delete as any).mockRejectedValue(genericError);

            await expect(deleteImage(1)).rejects.toThrow('Database connection failed');
        });

        it('rethrows Prisma errors that are not P2025', async () => {
            (prisma.productImage.findUnique as any).mockResolvedValue(mockExistingImage);
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2001';
            prismaError.message = 'Some other Prisma error';
            (prisma.productImage.delete as any).mockRejectedValue(prismaError);

            await expect(deleteImage(1)).rejects.toThrow(prismaError);
        });
    });

    describe('getImagesByProductId', () => {
        it('returns images for a product ordered by position', async () => {
            const mockImages = [
                {
                    id: 1,
                    productId: 1,
                    src: 'https://example.com/image1.jpg',
                    position: 1,
                    variants: [],
                },
                {
                    id: 2,
                    productId: 1,
                    src: 'https://example.com/image2.jpg',
                    position: 2,
                    variants: [],
                },
            ];

            (prisma.productImage.findMany as any).mockResolvedValue(mockImages);

            const images = await getImagesByProductId(1);

            expect(prisma.productImage.findMany).toHaveBeenCalledWith({
                where: { productId: 1 },
                include: {
                    variants: true,
                },
                orderBy: {
                    position: 'asc',
                },
            });

            expect(images).toEqual(mockImages);
        });

        it('returns empty array when no images found', async () => {
            (prisma.productImage.findMany as any).mockResolvedValue([]);

            const images = await getImagesByProductId(999);

            expect(images).toEqual([]);
        });
    });
});
