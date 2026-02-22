import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/smartboards
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const smartboards = await prisma.smartboard.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({ smartboards });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/smartboards/:code (by code for smartboard login)
router.get('/code/:code', async (req, res): Promise<void> => {
    try {
        const smartboard = await prisma.smartboard.findUnique({
            where: { code: req.params.code },
        });
        if (!smartboard) {
            res.status(404).json({ message: 'Smartboard not found' });
            return;
        }
        res.json({ smartboard });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/smartboards (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, location, code } = req.body;
        if (!name || !location || !code) {
            res.status(400).json({ message: 'Name, location, and code are required' });
            return;
        }

        const smartboard = await prisma.smartboard.create({
            data: { name, location, code },
        });
        res.status(201).json({ message: 'Smartboard registered', smartboard });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Smartboard code already exists' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/smartboards/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, location, isActive } = req.body;
        const smartboard = await prisma.smartboard.update({
            where: { id: req.params.id },
            data: { name, location, isActive },
        });
        res.json({ message: 'Smartboard updated', smartboard });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/smartboards/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.smartboard.delete({ where: { id: req.params.id } });
        res.json({ message: 'Smartboard removed' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
