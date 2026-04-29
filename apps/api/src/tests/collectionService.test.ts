import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import prisma from '../config/database';
import * as collectionService from '../services/collectionService';
import { Prisma } from '@prisma/client';

vi.mock('../config/database', () => ({
    default: {
        collection: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('Category Service', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('getAllCollections', () => {
        it('should return paginated categories', async () => {
            (prisma.collection.findMany as any).mockResolvedValue([
                {
                    id: 1,
                    title: 'Cat1',
                    handle: 'cat1',
                    description: null,
                    published: true,
                    sortOrder: 'manual',
                    seoTitle: null,
                    seoDescription: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { products: 0 },
                },
            ]);
            (prisma.collection.count as any).mockResolvedValue(1);

            const result = await collectionService.getAllCollections({}, {});
            expect(result.categories.length).toBe(1);
            expect(result.pagination.totalCount).toBe(1);
        });

        it('should apply filters and pagination', async () => {
            (prisma.collection.findMany as any).mockResolvedValue([]);
            (prisma.collection.count as any).mockResolvedValue(0);

            const result = await collectionService.getAllCollections(
                { published: true, search: 'test' },
                { page: 2, limit: 5 }
            );
            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(5);
        });
    });

    describe('getCategoryById', () => {
        it('should return a category', async () => {
            const mockCategory = { id: 1, title: 'Cat1', _count: { products: 0 }, products: [] };
            (prisma.collection.findUnique as any).mockResolvedValue(mockCategory);
            const result = await collectionService.getCategoryById(1);
            expect(result.id).toBe(1);
        });

        it('should throw if category not found', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue(null);
            await expect(collectionService.getCategoryById(99)).rejects.toThrow(
                'Category not found'
            );
        });
    });

    describe('getCategoryByHandle', () => {
        it('should return a category', async () => {
            const mockCategory = { id: 1, handle: 'cat1', products: [] };
            (prisma.collection.findUnique as any).mockResolvedValue(mockCategory);
            const result = await collectionService.getCategoryByHandle('cat1');
            expect(result.handle).toBe('cat1');
        });

        it('should throw if category not found', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue(null);
            await expect(collectionService.getCategoryByHandle('unknown')).rejects.toThrow(
                'Category not found'
            );
        });
    });

    describe('createCategory', () => {
        it('should create a category', async () => {
            const data = { title: 'Cat1', handle: 'cat1' };
            (prisma.collection.create as any).mockResolvedValue({
                id: 1,
                ...data,
                _count: { products: 0 },
            });
            const result = await collectionService.createCategory(data);
            expect(result.id).toBe(1);
        });

        it('should throw if handle exists', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';
            prismaError.meta = { target: ['handle'] };
            (prisma.collection.create as any).mockRejectedValue(prismaError);

            await expect(
                collectionService.createCategory({ title: 'Cat1', handle: 'cat1' })
            ).rejects.toThrow('Category with this handle already exists');
        });

        it('should throw if P2002 occurs on non-handle field', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';
            prismaError.meta = { target: ['title'] };

            (prisma.collection.create as any).mockRejectedValue(prismaError);

            await expect(
                collectionService.createCategory({ title: 'Test', handle: 'test' })
            ).rejects.toThrow('Category with these details already exists');
        });
    });

    describe('updateCategory', () => {
        it('should update a category', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.collection.update as any).mockResolvedValue({
                id: 1,
                title: 'Updated',
                _count: { products: 0 },
            });
            const result = await collectionService.updateCategory({ id: 1, title: 'Updated' });
            expect(result.title).toBe('Updated');
        });

        it('should throw if category not found', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue(null);
            await expect(collectionService.updateCategory({ id: 99, title: 'X' })).rejects.toThrow(
                'Category not found'
            );
        });

        it('should throw if handle conflicts', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';
            prismaError.meta = { target: ['handle'] };
            (prisma.collection.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.collection.update as any).mockRejectedValue(prismaError);

            await expect(
                collectionService.updateCategory({ id: 1, handle: 'existing' })
            ).rejects.toThrow('Category with this handle already exists');
        });

        it('should rethrow unknown Prisma errors', async () => {
            const unknownError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            unknownError.code = 'P9999'; // unknown code
            unknownError.meta = {};
            (prisma.collection.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.collection.update as any).mockRejectedValue(unknownError);

            await expect(collectionService.updateCategory({ id: 1, title: 'Test' })).rejects.toBe(
                unknownError
            ); // ensures the original error is rethrown
        });

        it('should throw if P2002 occurs on non-handle field', async () => {
            const prismaError = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
            prismaError.code = 'P2002';
            prismaError.meta = { target: ['title'] };

            (prisma.collection.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.collection.update as any).mockRejectedValue(prismaError);

            await expect(
                collectionService.updateCategory({ id: 1, title: 'Test', handle: 'test' })
            ).rejects.toThrow('Category with these details already exists');
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category without products', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue({
                id: 1,
                title: 'Cat1',
                handle: 'cat1',
                _count: { products: 0 },
            });
            (prisma.collection.delete as any).mockResolvedValue({});
            const result = await collectionService.deleteCategory(1);
            expect(result.deletedCategory.id).toBe(1);
        });

        it('should throw if category has products', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue({
                id: 1,
                title: 'Cat1',
                handle: 'cat1',
                _count: { products: 2 },
            });
            await expect(collectionService.deleteCategory(1)).rejects.toThrow(
                /Cannot delete category/
            );
        });

        it('should throw if category not found', async () => {
            (prisma.collection.findUnique as any).mockResolvedValue(null);
            await expect(collectionService.deleteCategory(99)).rejects.toThrow(
                'Category not found'
            );
        });
    });
});
