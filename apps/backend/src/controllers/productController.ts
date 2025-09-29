import { Request, Response } from 'express';
import {
    getAllProducts,
    getProductById,
    getProductByHandle,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCollection,
} from '../services/productService';
import { catchAsync } from '../utils/errorHandler';
import logger from '../utils/logger';
import { createImage, deleteImage, getImagesByProductId } from '../services/imageService';
import { getCategoryByHandle } from '../services/collectionService';

const ProductStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
};
const parseQueryParams = (query: any) => {
    const filters: any = {};
    const pagination: any = {};

    // Filtering
    if (query.status && Object.values(ProductStatus).includes(query.status)) {
        filters.status = query.status;
    }
    if (query.vendor) filters.vendor = query.vendor;
    if (query.tags) {
        filters.tags = Array.isArray(query.tags) ? query.tags : query.tags.split(',');
    }
    if (query.collectionId) filters.collectionId = parseInt(query.collectionId);
    if (query.search) filters.search = query.search;

    // Price range
    if (query.minPrice || query.maxPrice) {
        filters.priceRange = {};
        if (query.minPrice) filters.priceRange.min = parseFloat(query.minPrice);
        if (query.maxPrice) filters.priceRange.max = parseFloat(query.maxPrice);
    }

    // Pagination
    if (query.page) pagination.page = Math.max(1, parseInt(query.page));
    if (query.limit) pagination.limit = Math.min(100, Math.max(1, parseInt(query.limit)));
    if (query.sortBy && ['title', 'createdAt', 'updatedAt', 'publishedAt'].includes(query.sortBy)) {
        pagination.sortBy = query.sortBy;
    }
    if (query.sortOrder && ['asc', 'desc'].includes(query.sortOrder)) {
        pagination.sortOrder = query.sortOrder;
    }

    return { filters, pagination };
};

const validateProductData = (data: any) => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
        errors.push('Product title is required');
    }

    if (!data.handle?.trim()) {
        errors.push('Product handle is required');
    }

    // Validate handle format (URL-friendly)
    if (data.handle && !/^[a-z0-9-]+$/.test(data.handle)) {
        errors.push('Handle must contain only lowercase letters, numbers, and hyphens');
    }

    if (data.variants && Array.isArray(data.variants)) {
        data.variants.forEach((variant: any, index: number) => {
            if (!variant.title?.trim()) {
                errors.push(`Variant ${index + 1}: title is required`);
            }
            if (!variant.price || variant.price <= 0) {
                errors.push(`Variant ${index + 1}: valid price is required`);
            }
        });
    }

    return errors;
};

// Get all products with filtering, pagination, and sorting (public)
export const getProducts = catchAsync(async (req: Request, res: Response) => {
    try {
        const { filters, pagination } = parseQueryParams(req.query);

        // Force only published products for public API
        filters.status = ProductStatus.ACTIVE;

        const result = await getAllProducts(filters, pagination);

        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination,
        });
    } catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
        });
        throw error;
    }
});

// Get a single product by ID (public)
export const getProduct = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        const product = await getProductById(id);

        // For public API, only return published products
        if (product.status !== ProductStatus.ACTIVE) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        logger.error('Error fetching product:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
        });
        throw error;
    }
});

// Get a single product by Handle (public)
export const getProductByHandleEndpoint = catchAsync(async (req: Request, res: Response) => {
    try {
        const { handle } = req.params;

        if (!handle || handle.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Product handle is required',
            });
        }

        const product = await getProductByHandle(handle);

        // For public API, only return published products
        if (product.status !== ProductStatus.ACTIVE) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        logger.error('Error fetching product by handle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
        });
        throw error;
    }
});

// Get all products in a collection (public)
export const getProductsByCollectionEndpoint = catchAsync(async (req: Request, res: Response) => {
    try {
        const collectionId = parseInt(req.params.id);
        const { page, limit } = req.query;

        if (isNaN(collectionId) || collectionId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid collection ID',
            });
        }

        const pagination = {
            page: page ? Math.max(1, parseInt(page as string)) : 1,
            limit: limit ? Math.min(100, Math.max(1, parseInt(limit as string))) : 20,
        };

        const { products, totalCount } = await getProductsByCollection(collectionId, pagination);

        res.json({
            success: true,
            data: products,
            meta: {
                collectionId,
                productsCount: products.length,
                totalCount,
                totalPages: Math.ceil(totalCount / pagination.limit),
                currentPage: pagination.page,
            },
        });
    } catch (error) {
        console.error('Error fetching products by collection:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
        });
        throw error;
    }
});

// Get all products in a collection (by handle, public)
export const getProductsByCollectionHandleEndpoint = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const { handle } = req.params;
            const { page, limit } = req.query;

            if (!handle || typeof handle !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid collection handle',
                });
            }

            // Look up the collection by handle
            const collection = await getCategoryByHandle(handle);
            if (!collection) {
                return res.status(404).json({
                    success: false,
                    error: 'Collection not found',
                });
            }

            const pagination = {
                page: page ? Math.max(1, parseInt(page as string)) : 1,
                limit: limit ? Math.min(100, Math.max(1, parseInt(limit as string))) : 20,
            };

            const { products, totalCount } = await getProductsByCollection(
                collection.id,
                pagination
            );

            res.json({
                success: true,
                data: products,
                meta: {
                    collectionId: collection.id,
                    collectionHandle: collection.handle,
                    productsCount: products.length,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pagination.limit),
                    currentPage: pagination.page,
                },
            });
        } catch (error) {
            console.error('Error fetching products by collection handle:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch products',
            });
            throw error;
        }
    }
);

//! ---------- Admin Controllers ----------

// GET /api/admin/products - Get all products (including drafts)
export const getAdminProducts = catchAsync(async (req: Request, res: Response) => {
    try {
        const { filters, pagination } = parseQueryParams(req.query);
        const result = await getAllProducts(filters, pagination);

        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
        });
        throw error;
    }
});

// GET /api/admin/products/:id - Get product by ID (admin view)
export const getAdminProduct = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        const product = await getProductById(id);

        res.json({
            success: true,
            data: product,
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        console.error('Error fetching admin product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product',
        });

        throw error;
    }
});

// POST /api/admin/products - Create new product
//? with optional images
export const createProductEndpoint = catchAsync(async (req: Request, res: Response) => {
    try {
        const errors = validateProductData(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
            });
        }

        const { images, ...productData } = req.body;

        const product = await createProduct(productData);

        let createdImages = [];
        if (images && Array.isArray(images) && images.length > 0) {
            try {
                for (const imageData of images) {
                    const image = await createImage({
                        productId: product.id,
                        alt: imageData.alt || product.title,
                        position: imageData.position || 0,
                        imageBuffer: imageData.buffer,
                        uploadOptions: { generateSizes: true },
                    });
                    createdImages.push(image);
                }
            } catch (imageError) {
                logger.warn(`Failed to upload some images for product ${product.id}:`, imageError);
                // Continue with product creation even if images fail
            }
        }

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully',
        });
    } catch (error: any) {
        if (error.message.includes('handle already exists')) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
        });
        throw error;
    }
});

// PUT /api/admin/products/:id - Update product
export const updateProductEndpoint = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        const updateData = { ...req.body, id };
        const errors = validateProductData(updateData);

        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
            });
        }

        const product = await updateProduct(updateData);

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully',
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        if (error.message.includes('handle already exists')) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product',
        });

        throw error;
    }
});

// DELETE /api/admin/products/:id - Delete product
export const deleteProductEndpoint = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        const result = await deleteProduct(id);

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product',
        });

        throw error;
    }
});

// PATCH /api/admin/products/:id/status - Update product status
export const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        if (!status || !Object.values(ProductStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status is required',
                allowedValues: Object.values(ProductStatus),
            });
        }

        const updateData: any = { id, status };

        // Set publishedAt when status changes to ACTIVE
        if (status === ProductStatus.ACTIVE) {
            updateData.publishedAt = new Date();
        }

        const product = await updateProduct(updateData);

        res.json({
            success: true,
            data: product,
            message: `Product status updated to ${status}`,
        });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        console.error('Error updating product status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product status',
        });
    }
});

// POST /api/admin/products/:id/images - Upload product image
export const uploadProductImage = catchAsync(async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id, 10);

        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        // Verify product exists
        try {
            await getProductById(productId);
        } catch (error: any) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found',
                });
            }
            throw error;
        }

        const { alt, position } = req.body;
        const imageBuffer = req.file?.buffer;

        if (!imageBuffer) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided',
            });
        }

        const { image, cloudinaryData } = await createImage({
            productId,
            alt: alt || `Product ${productId} image`,
            position: position ? parseInt(position) : 0,
            imageBuffer,
            uploadOptions: { generateSizes: true },
        });

        res.status(201).json({
            success: true,
            data: { image, cloudinaryData },
            message: 'Image uploaded successfully',
        });
    } catch (error: any) {
        logger.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload image',
        });
    }
});

// GET /api/admin/products/:id/images - Get all images for a product
export const getProductImages = catchAsync(async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id, 10);

        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID',
            });
        }

        const images = await getImagesByProductId(productId);

        res.json({
            success: true,
            data: images,
            meta: {
                productId,
                count: images.length,
            },
        });
    } catch (error: any) {
        logger.error('Error fetching product images:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch images',
        });
    }
});

// DELETE /api/admin/products/:productId/images/:imageId - Delete product image
export const deleteProductImage = catchAsync(async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        const imageId = parseInt(req.params.imageId, 10);

        if (isNaN(productId) || isNaN(imageId) || productId <= 0 || imageId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID or image ID',
            });
        }

        const result = await deleteImage(imageId);

        res.json({
            success: true,
            message: result.message || 'Image deleted successfully',
        });
    } catch (error: any) {
        if (error.message === 'Image not found') {
            return res.status(404).json({
                success: false,
                error: 'Image not found',
            });
        }

        logger.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete image',
        });
    }
});
