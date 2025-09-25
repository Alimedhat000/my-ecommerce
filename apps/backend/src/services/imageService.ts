import cloudinary from '../config/cloudinary';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

interface ImageUploadOptions {
    folder?: string;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    generateSizes?: boolean;
}
interface ProcessedImageData {
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    sizes?: {
        thumbnail: string;
        small: string;
        medium: string;
        large: string;
    };
}

// Upload image to Cloudinary and return processed data
export async function uploadToCloudinary(
    imageBuffer: Buffer | string,
    options: ImageUploadOptions = {}
): Promise<ProcessedImageData> {
    try {
        const uploadOptions: any = {
            folder: options.folder || 'products',
            quality: options.quality || 'auto',
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        };

        const fileStr: string =
            imageBuffer instanceof Buffer
                ? `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                : (imageBuffer as string);

        const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

        const processedImage: ProcessedImageData = {
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };

        // Generate multiple sizes if requested
        if (options.generateSizes) {
            processedImage.sizes = generateImageSizes(result.public_id);
        }

        return processedImage;
    } catch (error: any) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

export function generateImageSizes(publicId: string) {
    return {
        thumbnail: cloudinary.url(publicId, {
            width: 150,
            height: 150,
            crop: 'fill',
            gravity: 'center',
            quality: 'auto',
            format: 'auto',
        }),
        small: cloudinary.url(publicId, {
            width: 300,
            height: 300,
            crop: 'limit',
            quality: 'auto',
            format: 'auto',
        }),
        medium: cloudinary.url(publicId, {
            width: 600,
            height: 600,
            crop: 'limit',
            quality: 'auto',
            format: 'auto',
        }),
        large: cloudinary.url(publicId, {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto',
            format: 'auto',
        }),
    };
}

export function extractPublicIdFromUrl(url: string): string | null {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) return null;

        const startIndex = parts[uploadIndex + 1].startsWith('v')
            ? uploadIndex + 2
            : uploadIndex + 1;

        const pathWithExtension = parts.slice(startIndex).join('/');
        const publicId = pathWithExtension.replace(/\.[^/.]+$/, '');

        return publicId;
    } catch (error: any) {
        return null;
    }
}

export interface CreateImageData {
    productId: number;
    shopifyId?: string;
    src?: string; // URL if not uploading buffer
    alt?: string;
    width?: number;
    height?: number;
    position?: number;
    variantIds?: string[];
    imageBuffer?: Buffer; // For new uploads
    uploadOptions?: {
        folder?: string;
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
        generateSizes?: boolean;
    };
}

//!Admin Only
export async function createImage(data: CreateImageData) {
    const { imageBuffer, uploadOptions, ...imageData } = data;

    try {
        let processedImageData: ProcessedImageData | null = null;

        if (imageBuffer) {
            // Upload to Cloudinary if buffer is provided
            processedImageData = await uploadToCloudinary(imageBuffer, {
                folder: `products/${imageData.productId}`,
                generateSizes: uploadOptions?.generateSizes,
                ...uploadOptions,
            });
        } else if (!imageData.src) {
            throw new Error('Either imageBuffer or src must be provided');
        }

        const position = imageData.position ? Number(imageData.position) : undefined;

        const image = await prisma.productImage.create({
            data: {
                ...imageData,
                position,
                alt: imageData.alt || `Image for product ${imageData.productId}`,
                src: processedImageData?.secureUrl || imageData.src || '', // it won't be empty if imageBuffer is provided
                width: processedImageData?.width || imageData.width,
                height: processedImageData?.height || imageData.height,
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

        return {
            image,
            cloudinaryData: processedImageData,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error('Image with this Shopify ID already exists');
            }
        }
        throw error;
    }
}

export interface UpdateImageData {
    id: number;
    shopifyId?: string;
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    position?: number;
    variantIds?: string[];
}
export async function updateImage(data: UpdateImageData) {
    const { id, ...imageData } = data;

    try {
        const image = await prisma.productImage.update({
            where: { id },
            data: imageData,
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

        return image;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Image not found');
            }
        }
        throw error;
    }
}

export async function deleteImage(id: number) {
    try {
        // Get image data first
        const existingImage = await prisma.productImage.findUnique({
            where: { id },
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

        if (!existingImage) {
            throw new Error('Image not found');
        }

        // Delete from Cloudinary if it's a Cloudinary URL
        const publicId = extractPublicIdFromUrl(existingImage.src);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError: any) {
                console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await prisma.productImage.delete({
            where: { id },
        });

        return {
            message: `Image "${existingImage.alt || 'Unnamed'}" deleted successfully from product "${existingImage.product.title}"`,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Image not found');
            }
        }
        throw error;
    }
}

export async function getImagesByProductId(productId: number) {
    const images = await prisma.productImage.findMany({
        where: { productId },
        include: {
            variants: true,
        },
        orderBy: {
            position: 'asc',
        },
    });
    return images;
}
