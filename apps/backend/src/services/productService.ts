import { ProductStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import type {
    ProductFilters,
    PaginationOptions,
    CreateProductData,
    UpdateProductData,
} from '../types/productTypes';

export async function getAllProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions = {}
) {
    const { status, vendor, tags, collectionId, priceRange, search } = filters;

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
        ...(status && { status }),
        ...(vendor && { vendor: { contains: vendor, mode: 'insensitive' } }),
        ...(tags &&
            tags.length > 0 && {
                tags: { hasSome: tags },
            }),
        ...(collectionId && {
            collections: {
                some: {
                    collectionId,
                },
            },
        }),
        ...(priceRange && {
            variants: {
                some: {
                    price: {
                        ...(priceRange.min && { gte: priceRange.min }),
                        ...(priceRange.max && { lte: priceRange.max }),
                    },
                },
            },
        }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { bodyHtml: { contains: search, mode: 'insensitive' } },
                { vendor: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } },
            ],
        }),
    };

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                variants: {
                    orderBy: { position: 'asc' },
                    include: {
                        image: true,
                    },
                },
                images: {
                    orderBy: { position: 'asc' },
                },
                options: {
                    orderBy: { position: 'asc' },
                },
                collections: {
                    include: {
                        collection: {
                            select: {
                                id: true,
                                title: true,
                                handle: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
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

export async function getProductById(id: number) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: {
                orderBy: { position: 'asc' },
                include: {
                    image: true,
                },
            },
            images: {
                orderBy: { position: 'asc' },
            },
            options: {
                orderBy: { position: 'asc' },
            },
            collections: {
                include: {
                    collection: {
                        select: {
                            id: true,
                            title: true,
                            handle: true,
                            description: true,
                        },
                    },
                },
            },
        },
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
}

export async function getProductByHandle(handle: string) {
    const product = await prisma.product.findUnique({
        where: { handle },
        include: {
            variants: {
                orderBy: { position: 'asc' },
                include: {
                    image: true,
                },
            },
            images: {
                orderBy: { position: 'asc' },
            },
            options: {
                orderBy: { position: 'asc' },
            },
            collections: {
                include: {
                    collection: {
                        select: {
                            id: true,
                            title: true,
                            handle: true,
                        },
                    },
                },
            },
        },
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
}

export async function getProductsByCollection(
    collectionId: number,
    pagination: PaginationOptions = {},
    filters: ProductFilters = {}
) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
        collections: {
            some: {
                collectionId,
            },
        },
        status: filters.status ?? ProductStatus.ACTIVE,
    };

    if (filters.vendor) {
        where.vendor = filters.vendor;
    }

    if (filters.tags && filters.tags.length > 0) {
        where.tags = {
            hasSome: filters.tags, // Prisma array operator
        };
    }

    if (filters.priceRange) {
        where.variants = {
            some: {
                price: {
                    gte: filters.priceRange.min ?? undefined,
                    lte: filters.priceRange.max ?? undefined,
                },
            },
        };
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                variants: { orderBy: { position: 'asc' } },
                images: { orderBy: { position: 'asc' } },
            },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        totalCount,
    };
}

//! Admin only services
export async function createProduct(data: CreateProductData) {
    const { variants = [], images = [], options = [], collectionIds = [], ...productData } = data;

    try {
        const product = await prisma.product.create({
            data: {
                ...productData,
                variants: {
                    create: variants.map((variant, index) => ({
                        ...variant,
                        position: index + 1,
                    })),
                },
                images: {
                    create: images.map((image, index) => ({
                        ...image,
                        position: image.position || index + 1,
                    })),
                },
                options: {
                    create: options,
                },
                collections: {
                    create: collectionIds.map((collectionId, index) => ({
                        collectionId,
                        position: index + 1,
                    })),
                },
            },
            include: {
                variants: {
                    orderBy: { position: 'asc' },
                },
                images: {
                    orderBy: { position: 'asc' },
                },
                options: {
                    orderBy: { position: 'asc' },
                },
                collections: {
                    include: {
                        collection: true,
                    },
                },
            },
        });

        return product;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error('Product with this handle already exists');
            }
        }
        throw error;
    }
}

export async function deleteProduct(id: number) {
    try {
        // Check if product exists and get its data first
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            select: { id: true, title: true },
        });

        if (!existingProduct) {
            throw new Error('Product not found');
        }

        // Delete the product (cascading deletes will handle related records)
        await prisma.product.delete({
            where: { id },
        });

        return { message: `Product "${existingProduct.title}" deleted successfully` };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Product not found');
            }
        }
        throw error;
    }
}

export async function updateProduct(data: UpdateProductData) {
    const { id, variants, images, options, collectionIds, ...productData } = data;

    try {
        // Start a transaction for complex updates
        const product = await prisma.$transaction(async (tx) => {
            // Update basic product data
            const updatedProduct = await tx.product.update({
                where: { id },
                data: productData,
            });

            // Handle variants update if provided
            if (variants) {
                // Delete existing variants and create new ones
                await tx.productVariant.deleteMany({
                    where: { productId: id },
                });

                if (variants.length > 0) {
                    await tx.productVariant.createMany({
                        data: variants.map((variant, index) => ({
                            ...variant,
                            productId: id,
                            position: index + 1,
                        })),
                    });
                }
            }

            // Handle images update if provided
            if (images) {
                await tx.productImage.deleteMany({
                    where: { productId: id },
                });

                if (images.length > 0) {
                    await tx.productImage.createMany({
                        data: images.map((image, index) => ({
                            ...image,
                            productId: id,
                            position: image.position || index + 1,
                        })),
                    });
                }
            }

            // Handle options update if provided
            if (options) {
                await tx.productOption.deleteMany({
                    where: { productId: id },
                });

                if (options.length > 0) {
                    await tx.productOption.createMany({
                        data: options.map((option) => ({
                            ...option,
                            productId: id,
                        })),
                    });
                }
            }

            // Handle collections update if provided
            if (collectionIds) {
                await tx.productCollection.deleteMany({
                    where: { productId: id },
                });

                if (collectionIds.length > 0) {
                    await tx.productCollection.createMany({
                        data: collectionIds.map((collectionId, index) => ({
                            productId: id,
                            collectionId,
                            position: index + 1,
                        })),
                    });
                }
            }

            // Return updated product with all relations
            return tx.product.findUnique({
                where: { id },
                include: {
                    variants: {
                        orderBy: { position: 'asc' },
                    },
                    images: {
                        orderBy: { position: 'asc' },
                    },
                    options: {
                        orderBy: { position: 'asc' },
                    },
                    collections: {
                        include: {
                            collection: true,
                        },
                    },
                },
            });
        });

        return product;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error('Product with this handle already exists');
            }
            if (error.code === 'P2025') {
                throw new Error('Product not found');
            }
        }
        throw error;
    }
}
