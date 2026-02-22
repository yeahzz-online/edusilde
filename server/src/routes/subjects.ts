import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subjects
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const subjects = await prisma.subject.findMany({
            include: {
                department: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
                _count: { select: { presentations: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/subjects (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, code, departmentId, classId } = req.body;

        if (!name || !departmentId || !classId) {
            res.status(400).json({ message: 'Name, departmentId, and classId are required' });
            return;
        }

        const subject = await prisma.subject.create({
            data: { name, code: code || '', departmentId, classId },
            include: { department: true, class: true },
        });
        res.status(201).json({ message: 'Subject created', subject });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/subjects/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, code, departmentId, classId } = req.body;
        const subject = await prisma.subject.update({
            where: { id: req.params.id },
            data: { name, code, departmentId, classId },
            include: { department: true, class: true },
        });
        res.json({ message: 'Subject updated', subject });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/subjects/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.subject.delete({ where: { id: req.params.id } });
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
