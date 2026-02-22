import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Monitor, Users, GraduationCap, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN' | 'SMARTBOARD'>('STUDENT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { ...data, role });
            const { user, accessToken, refreshToken } = response.data;

            login(user, accessToken, refreshToken);

            const dashboardMap = {
                ADMIN: '/admin',
                FACULTY: '/faculty',
                STUDENT: '/student',
                SMARTBOARD: '/smartboard',
            };

            navigate(dashboardMap[role]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const roleConfigs = [
        { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'text-primary', border: 'border-primary' },
        { id: 'FACULTY', label: 'Faculty', icon: Users, color: 'text-accent', border: 'border-accent' },
        { id: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: 'text-adminDark', border: 'border-adminDark' },
        { id: 'SMARTBOARD', label: 'Smartboard', icon: Monitor, color: 'text-gray-700', border: 'border-gray-700' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-bl-full -z-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/5 rounded-tr-full -z-10 blur-3xl"></div>

            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: Illustration & Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:block space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-primary transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Monitor className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-heading font-black tracking-tight text-primary">
                                EduSlide <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30">Pro</span>
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">Smart PPT Management System</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-5xl font-heading font-extrabold text-gray-900 leading-[1.1]">
                            Elevate Your <br />
                            <span className="text-gradient">Academic Workflow</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Seamlessly manage, review, and display academic presentations across your entire campus in real-time.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { title: 'Real-time Sync', desc: 'Instant updates on smartboards' },
                                { title: 'Secure Storage', desc: 'Cloud-backed presentation files' },
                                { title: 'Role Access', desc: 'Custom portals for all users' },
                                { title: 'Notifications', desc: 'Stay updated on submission status' },
                            ].map((feature, i) => (
                                <div key={i} className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="bg-white rounded-[2.5rem] shadow-glass p-8 md:p-12 border border-gray-100 relative overflow-hidden group">
                        {/* Form Header */}
                        <div className="mb-10 text-center">
                            <h3 className="text-2xl font-heading font-bold text-gray-900">Welcome Back</h3>
                            <p className="text-gray-500 mt-2">Login to your EduSlide Pro account</p>
                        </div>

                        {/* Role Manager */}
                        <div className="grid grid-cols-4 gap-2 mb-8 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                            {roleConfigs.map((config) => (
                                <button
                                    key={config.id}
                                    type="button"
                                    onClick={() => setRole(config.id as any)}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-300 ${role === config.id
                                            ? `bg-white shadow-sm ring-1 ring-gray-100 ${config.color}`
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                        }`}
                                >
                                    <config.icon size={18} strokeWidth={role === config.id ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-8"
                                >
                                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="label">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" size={18} />
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="name@university.edu"
                                        className={`input pl-12 ${errors.email ? 'input-error' : ''}`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="label">Password</label>
                                    <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" size={18} />
                                    <input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`input pl-12 ${errors.password ? 'input-error' : ''}`}
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full h-14 flex items-center justify-center gap-3 mt-4 text-lg"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-bold text-primary hover:underline">
                                    Join for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
