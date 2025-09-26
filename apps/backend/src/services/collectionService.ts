import prisma from '../config/database';
import { Prisma } from '@prisma/client';

interface CategoryFilters {
    published?: boolean;
    search?: string;
}

interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

interface CreateCategoryData {
    title: string;
    handle: string;
    description?: string;
    published?: boolean;
    sortOrder?: string;
    seoTitle?: string;
    seoDescription?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: number;
}

interface CategoryWithProductCount {
    id: number;
    title: string;
    handle: string;
    description: string | null;
    published: boolean;
    sortOrder: string;
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        products: number;
    };
}

export async function getAllCollections(filters: CategoryFilters, pagination: PaginationOptions) {
    const { published, search } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {
        ...(published !== undefined && { published }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { handle: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [categories, totalCount] = await Promise.all([
        prisma.collection.findMany({
            where,
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: limit,
        }),
        prisma.collection.count({ where }),
    ]);

    return {
        categories: categories as CategoryWithProductCount[],
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1,
        },
    };
}

export async function getCategoryById(id: number) {
    const category = await prisma.collection.findUnique({
        where: { id },
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            variants: {
                                orderBy: { position: 'asc' },
                                take: 1, // Just get the first variant for pricing info
                            },
                            images: {
                                orderBy: { position: 'asc' },
                                take: 1, // Just get the first image
                            },
                        },
                    },
                },
                orderBy: { position: 'asc' },
            },
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
}

export async function getCategoryByHandle(handle: string) {
    const category = await prisma.collection.findUnique({
        where: { handle },
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            variants: {
                                orderBy: { position: 'asc' },
                                take: 1,
                            },
                            images: {
                                orderBy: { position: 'asc' },
                                take: 1,
                            },
                        },
                    },
                },
                orderBy: { position: 'asc' },
            },
        },
    });

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
}

//! Admin only

export async function createCategory(data: CreateCategoryData) {
    try {
        const category = await prisma.collection.create({
            data: {
                title: data.title,
                handle: data.handle,
                description: data.description,
                published: data.published ?? false,
                sortOrder: data.sortOrder ?? 'manual',
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        return category as CategoryWithProductCount;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Check which field caused the unique constraint violation
                const target = error.meta?.target as string[];
                if (target?.includes('handle')) {
                    throw new Error('Category with this handle already exists');
                }
                throw new Error('Category with these details already exists');
            }
            /* c8 ignore start */
        }
        throw error;
        /* c8 ignore end */
    }
}

export async function updateCategory(data: UpdateCategoryData) {
    const { id, ...updateData } = data;

    try {
        // Check if category exists
        const existingCategory = await prisma.collection.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existingCategory) {
            throw new Error('Category not found');
        }

        const category = await prisma.collection.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        return category as CategoryWithProductCount;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const target = error.meta?.target as string[];
                if (target?.includes('handle')) {
                    throw new Error('Category with this handle already exists');
                }
                throw new Error('Category with these details already exists');
            }
            if (error.code === 'P2025') {
                throw new Error('Category not found');
            }
        }
        throw error;
    }
}

export async function deleteCategory(id: number) {
    try {
        // Check if category exists and get its data first
        const existingCategory = await prisma.collection.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!existingCategory) {
            throw new Error('Category not found');
        }

        // Check if category has products
        if (existingCategory._count.products > 0) {
            throw new Error(
                `Cannot delete category "${existingCategory.title}" because it contains ${existingCategory._count.products} product(s). Please remove all products from this category first.`
            );
        }

        // Delete the category
        await prisma.collection.delete({
            where: { id },
        });

        return {
            message: `Category "${existingCategory.title}" deleted successfully`,
            deletedCategory: {
                id: existingCategory.id,
                title: existingCategory.title,
                handle: existingCategory.handle,
            },
        };
    } catch (error) {
        throw error;
    }
}
