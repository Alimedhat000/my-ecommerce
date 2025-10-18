import bcrypt from 'bcrypt';
import prisma from '../config/database';
import type { AuthRequest } from '../middleware/authMiddleware';
import { catchAsync } from '../utils/errorHandler';

export const getMe = catchAsync(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return res.status(200).json({ success: true, user });
});

interface UpdateMeBody {
    name?: string;
    email?: string;
}

export const updateMe = catchAsync(
    async (req: AuthRequest<unknown, unknown, UpdateMeBody>, res) => {
        const { name, email } = req.body;

        if (email && email !== req.user?.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use',
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    }
);

interface updatePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const updatePassword = catchAsync(
    async (req: AuthRequest<unknown, unknown, updatePassword>, res) => {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match',
            });
        }

        if (newPassword.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 10 characters long',
            });
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const isValidPass = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPass) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        const isSamePass = await bcrypt.compare(newPassword, user.password);

        if (isSamePass) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 14);

        await prisma.user.update({
            where: { id: req.userId },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }
);

export const getAddresses = catchAsync(async (req: AuthRequest, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.userId },
    });

    return res.status(200).json({
        success: true,
        addresses,
    });
});

interface createAddresses {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export const createAddresses = catchAsync(
    async (req: AuthRequest<unknown, unknown, createAddresses>, res) => {
        const { street, city, state, postalCode, country, isDefault } = req.body;

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                userId: req.userId!,
                street,
                city,
                state,
                postalCode,
                country,
                isDefault: isDefault || false,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Address created successfully',
            address,
        });
    }
);

interface addressParams {
    addressId?: string;
}

export const updateAddress = catchAsync(
    async (req: AuthRequest<addressParams, unknown, createAddresses>, res) => {
        const { addressId } = req.params;
        const { street, city, state, postalCode, country, isDefault } = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID is required',
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: parseInt(addressId),
                userId: req.userId,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found',
            });
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.userId,
                    isDefault: true,
                    id: { not: parseInt(addressId) },
                },
                data: { isDefault: false },
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: parseInt(addressId) },
            data: {
                ...(street && { street }),
                ...(city && { city }),
                ...(state && { state }),
                ...(postalCode && { postalCode }),
                ...(country && { country }),
                ...(isDefault !== undefined && { isDefault }),
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address: updatedAddress,
        });
    }
);

export const deleteAddress = catchAsync(
    async (req: AuthRequest<addressParams, unknown, unknown>, res) => {
        const { addressId } = req.params;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID is required',
            });
        }

        const address = await prisma.address.findFirst({
            where: {
                id: parseInt(addressId),
                userId: req.userId,
            },
        });

        if (!address) {
            return res.status(404).json({
                message: 'Address not found',
                success: false,
            });
        }

        await prisma.address.delete({
            where: { id: parseInt(addressId) },
        });

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    }
);

interface OrderQuery {
    page?: string;
    limit?: string;
    status?: string;
}

interface OrderParams {
    orderId?: string;
}

export const getOrders = catchAsync(
    async (req: AuthRequest<unknown, unknown, unknown, OrderQuery>, res) => {
        const { page = '1', limit = '10', status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const where: {
            userId?: number;
            status?: string;
        } = { userId: req.userId };

        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    orderItems: {
                        include: {
                            ProductVariant: {
                                include: {
                                    product: {
                                        select: {
                                            id: true,
                                            title: true,
                                            images: {
                                                take: 2,
                                                orderBy: { position: 'asc' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    address: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.order.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
);

export const getOrder = catchAsync(async (req: AuthRequest<OrderParams, unknown, unknown>, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: 'Order ID is required',
        });
    }

    const order = await prisma.order.findFirst({
        where: {
            id: parseInt(orderId),
            userId: req.userId,
        },
        include: {
            orderItems: {
                include: {
                    ProductVariant: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    handle: true,
                                    images: true,
                                },
                            },
                            image: true,
                        },
                    },
                },
            },
            address: true,
            paymentMethod: {
                select: {
                    id: true,
                    type: true,
                    provider: true,
                    accountNo: true,
                },
            },
        },
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    return res.status(200).json({
        success: true,
        order,
    });
});
