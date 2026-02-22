import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sendOTPEmail } from '../utils/email';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'FACULTY']),
    departmentId: z.string().optional(),
    semester: z.number().int().min(1).max(8).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(['ADMIN', 'FACULTY', 'STUDENT', 'SMARTBOARD']),
});

const verifyOTPSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

const refreshTokenSchema = z.object({
    refreshToken: z.string(),
});

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTokens = (userId: string, email: string, role: string, name: string) => {
    const jwtSecret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.REFRESH_SECRET!;

    const accessToken = jwt.sign(
        { id: userId, email, role, name },
        jwtSecret,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: userId, email, role, name },
        refreshSecret,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Validation error', errors: parsed.error.errors });
            return;
        }

        const { name, email, password, role, departmentId, semester } = parsed.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: 'Email already registered. Please login.' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as any,
                departmentId: departmentId || null,
                semester: semester || null,
                otp,
                otpExpires,
                isVerified: false,
            },
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Don't fail registration if email fails in development
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email for the OTP verification code.',
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = verifyOTPSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Validation error', errors: parsed.error.errors });
            return;
        }

        const { email, otp } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.isVerified) {
            res.status(200).json({ message: 'Email already verified. You can login.' });
            return;
        }

        if (!user.otp || !user.otpExpires) {
            res.status(400).json({ message: 'No OTP found. Please register again.' });
            return;
        }

        if (new Date() > user.otpExpires) {
            res.status(400).json({ message: 'OTP has expired. Please register again.' });
            return;
        }

        if (user.otp !== otp) {
            res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            return;
        }

        // Verify user
        await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                otp: null,
                otpExpires: null,
            },
        });

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Validation error', errors: parsed.error.errors });
            return;
        }

        const { email, password, role } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { department: true },
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check role mismatch
        if (user.role !== role) {
            res.status(403).json({
                message: `Access denied. You are registered as ${user.role}, not ${role}.`,
            });
            return;
        }

        // Check email verification (skip for admin seeded users)
        if (!user.isVerified && user.role !== 'ADMIN') {
            res.status(403).json({
                message: 'Email not verified. Please check your email for the OTP.',
            });
            return;
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, user.name);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                departmentId: user.departmentId,
                semester: user.semester,
                department: user.department,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Refresh token required' });
            return;
        }

        const { refreshToken } = parsed.data;
        const refreshSecret = process.env.REFRESH_SECRET!;

        const decoded = jwt.verify(refreshToken, refreshSecret) as {
            id: string;
            email: string;
            role: string;
            name: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        const tokens = generateTokens(user.id, user.email, user.role, user.name);

        res.json({
            message: 'Token refreshed',
            ...tokens,
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Refresh token expired. Please login again.' });
            return;
        }
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({ message: 'Email already verified' });
            return;
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpires },
        });

        await sendOTPEmail(email, otp, user.name);

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
