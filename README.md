# EduSlide Pro 🎓
**College PPT Management System** - A production-ready SaaS application for academic presentation management.

## 🚀 Features
- **Triple-Portal Architecture**: Dedicated interfaces for Students, Faculty, and Administrators.
- **Smartboard Node**: Immersive, full-screen display mode with auto-sync and remote controls.
- **Real-time Pipeline**: Instant notifications for submissions and approvals via Socket.io.
- **Premium Design**: Modern Glassmorphism UI with Framer Motion animations.
- **Robust Security**: JWT Access/Refresh tokens, bcrypt hashing, and OTP email verification.

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion, React Query.
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma ORM v6.
- **Cloud**: Cloudinary (Media), Nodemailer (Emails), Supabase/PostgreSQL (Database).

## 📦 Installation & Setup

### 1. Database Setup
1. Create a PostgreSQL database (Supabase/Neon recommended).
2. Set your `DATABASE_URL` in `server/.env`.
3. Generate Prisma client & Push schema:
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

### 2. Backend Config
1. Configure `server/.env` with your SMTP and Cloudinary credentials.
2. Run in development:
   ```bash
   npm run dev
   ```

### 3. Frontend Config
1. Set `VITE_API_URL` and `VITE_SOCKET_URL` in `client/.env`.
2. Run development server:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🔑 Demo Accounts
- **Admin**: `admin@eduslide.com` / `admin123`
- **Faculty**: `faculty@eduslide.com` / `faculty123`
- **Student**: `student@eduslide.com` / `student123`

---
Built with ❤️ by Antigravity
