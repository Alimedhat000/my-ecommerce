import type { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from './logger';

// Define the type of async route handlers
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((error: Error) => {
            logger.error(`Caught async error: ${error.message}`, { stack: error.stack });
            next(error);
        });
    };
};
