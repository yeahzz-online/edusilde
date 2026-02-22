import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/departments
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: { select: { users: true, classes: true, subjects: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json({ departments });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/departments (public - for registration)
router.get('/public', async (req, res): Promise<void> => {
    try {
        const departments = await prisma.department.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
        res.json({ departments });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/departments (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        const department = await prisma.department.create({ data: { name } });
        res.status(201).json({ message: 'Department created', department });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Department already exists' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/departments/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: { name },
        });
        res.json({ message: 'Department updated', department });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/departments/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.department.delete({ where: { id: req.params.id } });
        res.json({ message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
