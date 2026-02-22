import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users (Admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            include: {
                department: { select: { id: true, name: true } },
                _count: { select: { presentations: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Remove passwords from response
        const safeUsers = users.map(({ password, otp, otpExpires, ...user }) => user);
        res.json({ users: safeUsers });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/users/me (Current user)
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: { department: true },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { password, otp, otpExpires, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/users (Admin: create any user including ADMIN)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, departmentId, semester } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password || 'changeme123', 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                departmentId: departmentId || null,
                semester: semester || null,
                isVerified: true,
            },
            include: { department: true },
        });

        const { password: pw, otp, otpExpires, ...safeUser } = user;
        res.status(201).json({ message: 'User created', user: safeUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/users/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, role, departmentId, semester } = req.body;

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                name,
                email,
                role,
                departmentId: departmentId || null,
                semester: semester || null,
            },
            include: { department: true },
        });

        const { password, otp, otpExpires, ...safeUser } = user;
        res.json({ message: 'User updated', user: safeUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/users/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Don't allow deleting yourself
        if (req.params.id === req.user!.id) {
            res.status(400).json({ message: 'Cannot delete your own account' });
            return;
        }

        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
