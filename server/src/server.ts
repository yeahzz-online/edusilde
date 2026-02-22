import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import presentationRoutes from './routes/presentations';
import departmentRoutes from './routes/departments';
import userRoutes from './routes/users';
import subjectRoutes from './routes/subjects';
import classRoutes from './routes/classes';
import smartboardRoutes from './routes/smartboards';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: [CLIENT_URL, 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: [CLIENT_URL, 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/smartboards', smartboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`📌 Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`📤 Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

server.listen(PORT, () => {
    console.log(`🚀 EduSlide Pro Server running on port ${PORT}`);
    console.log(`📡 Socket.io enabled`);
    console.log(`🌐 CORS origin: ${CLIENT_URL}`);
});

export { io };
export default app;
