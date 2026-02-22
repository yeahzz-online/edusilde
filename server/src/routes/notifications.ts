import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications (current user's notifications)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id, userId: req.user!.id },
            data: { isRead: true },
        });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
