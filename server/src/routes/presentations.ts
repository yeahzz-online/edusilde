import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/cloudinary';

const router = Router();

// GET /api/presentations
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        let presentations;

        if (user.role === 'STUDENT') {
            // Students only see their own presentations
            presentations = await prisma.presentation.findMany({
                where: { uploaderId: user.id },
                include: {
                    subject: {
                        include: { department: true },
                    },
                    uploader: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Faculty and Admin see all presentations
            presentations = await prisma.presentation.findMany({
                include: {
                    subject: {
                        include: { department: true },
                    },
                    uploader: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        res.json({ presentations });
    } catch (error) {
        console.error('Get presentations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/presentations (Student only)
router.post(
    '/',
    authenticate,
    authorize('STUDENT'),
    upload.single('file'),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { title, description, subjectId } = req.body;
            const file = req.file as any;

            if (!file) {
                res.status(400).json({ message: 'File is required' });
                return;
            }

            if (!title || !subjectId) {
                res.status(400).json({ message: 'Title and subjectId are required' });
                return;
            }

            // Verify subject exists
            const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
            if (!subject) {
                res.status(404).json({ message: 'Subject not found' });
                return;
            }

            const presentation = await prisma.presentation.create({
                data: {
                    title,
                    description: description || null,
                    fileUrl: file.path || file.secure_url,
                    publicId: file.filename || file.public_id || '',
                    subjectId,
                    uploaderId: req.user!.id,
                    status: 'PENDING',
                },
                include: {
                    subject: { include: { department: true } },
                    uploader: { select: { id: true, name: true, email: true } },
                },
            });

            // Create notifications for all faculty
            const facultyUsers = await prisma.user.findMany({
                where: { role: 'FACULTY' },
                select: { id: true },
            });

            await Promise.all(
                facultyUsers.map((faculty) =>
                    prisma.notification.create({
                        data: {
                            userId: faculty.id,
                            message: `New presentation "${title}" submitted by ${req.user!.name} for ${subject.name}`,
                            type: 'new-submission',
                        },
                    })
                )
            );

            // Emit socket event for real-time notification
            if (req.io) {
                req.io.emit('new-submission', {
                    presentation,
                    studentName: req.user!.name,
                });
            }

            res.status(201).json({
                message: 'Presentation uploaded successfully',
                presentation,
            });
        } catch (error) {
            console.error('Upload presentation error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// PATCH /api/presentations/:id/status (Faculty or Admin only)
router.patch(
    '/:id/status',
    authenticate,
    authorize('FACULTY', 'ADMIN'),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
                return;
            }

            const presentation = await prisma.presentation.findUnique({
                where: { id },
                include: {
                    uploader: { select: { id: true, name: true } },
                    subject: true,
                },
            });

            if (!presentation) {
                res.status(404).json({ message: 'Presentation not found' });
                return;
            }

            const updated = await prisma.presentation.update({
                where: { id },
                data: { status },
                include: {
                    subject: { include: { department: true } },
                    uploader: { select: { id: true, name: true, email: true } },
                },
            });

            // Notify the student
            await prisma.notification.create({
                data: {
                    userId: presentation.uploader.id,
                    message: `Your presentation "${presentation.title}" has been ${status.toLowerCase()} by the faculty.`,
                    type: 'submission-update',
                },
            });

            // Emit socket event to the student's room
            if (req.io) {
                req.io.to(presentation.uploader.id).emit('submission-update', {
                    presentationId: id,
                    status,
                    title: presentation.title,
                });
            }

            res.json({
                message: `Presentation ${status.toLowerCase()} successfully`,
                presentation: updated,
            });
        } catch (error) {
            console.error('Update presentation status error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// DELETE /api/presentations/:id (Admin only)
router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const presentation = await prisma.presentation.findUnique({ where: { id } });
            if (!presentation) {
                res.status(404).json({ message: 'Presentation not found' });
                return;
            }

            await prisma.presentation.delete({ where: { id } });

            res.json({ message: 'Presentation deleted successfully' });
        } catch (error) {
            console.error('Delete presentation error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

export default router;
