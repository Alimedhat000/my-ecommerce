import type { Request, Response, NextFunction } from 'express';

export const authenticate = (_req: Request, _res: Response, next: NextFunction) => {
    (_req as any).user = { id: 1, role: 'USER' };
    return next();
};

export const authorizeAdmin = (_req: Request, _res: Response, next: NextFunction) => {
    (_req as any).user = { id: 1, role: 'ADMIN' };
    return next();
};
