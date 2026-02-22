import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/classes
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                department: { select: { id: true, name: true } },
                _count: { select: { subjects: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json({ classes });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/classes (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, departmentId } = req.body;
        if (!name || !departmentId) {
            res.status(400).json({ message: 'Name and departmentId are required' });
            return;
        }
        const cls = await prisma.class.create({
            data: { name, departmentId },
            include: { department: true },
        });
        res.status(201).json({ message: 'Class created', class: cls });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/classes/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, departmentId } = req.body;
        const cls = await prisma.class.update({
            where: { id: req.params.id },
            data: { name, departmentId },
            include: { department: true },
        });
        res.json({ message: 'Class updated', class: cls });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/classes/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.class.delete({ where: { id: req.params.id } });
        res.json({ message: 'Class deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
