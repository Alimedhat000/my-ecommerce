import { Request, Response } from 'express';
import { createImage, deleteImage } from '../services/imageService';
import { catchAsync } from '../utils/errorHandler';
import logger from '../utils/logger';

export const uploadProductImage = catchAsync(async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id, 10);

        const { alt, position } = req.body;
        const imageBuffer = req.file?.buffer;

        const { image, cloudinaryData } = await createImage({
            productId,
            alt,
            position,
            imageBuffer,
            uploadOptions: { generateSizes: true },
        });

        res.status(201).json({ image, cloudinaryData });
    } catch (error: any) {
        logger.error('Error uploading image:', error);

        res.status(500).json({ error: error.message });
    }
});

export const deleteProductImage = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await deleteImage(id);
        res.json(result);
    } catch (error: any) {
        logger.error('Error deleting image:', error);

        res.status(500).json({ error: error.message });
    }
});
