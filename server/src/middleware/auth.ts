import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
    io?: any;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
            role: string;
            name: string;
        };

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, name: true, isVerified: true },
        });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Authentication error' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Required roles: ${roles.join(', ')}`,
            });
            return;
        }

        next();
    };
};
