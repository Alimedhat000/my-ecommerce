import { ProductStatus } from '@prisma/client';

export interface ProductFilters {
    status?: ProductStatus;
    vendor?: string;
    tags?: string[];
    collectionId?: number;
    priceRange?: {
        min?: number;
        max?: number;
    };
    search?: string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
    title: string;
    handle: string;
    bodyHtml?: string;
    vendor?: string;
    tags?: string[];
    status?: ProductStatus;
    publishedAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
    variants?: {
        title: string;
        sku?: string;
        price: number;
        compareAtPrice?: number;
        inventoryQty?: number;
        option1?: string;
        option2?: string;
        option3?: string;
    }[];
    images?: {
        src: string;
        alt?: string;
        position?: number;
    }[];
    options?: {
        name: string;
        position: number;
        values: string[];
    }[];
    collectionIds?: number[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id: number;
}
