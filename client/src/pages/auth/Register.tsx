import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building2, BookOpen, ArrowRight, GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { Department } from '../../types';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'FACULTY']),
    departmentId: z.string().min(1, 'Please select a department'),
    semester: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'STUDENT',
        }
    });

    const selectedRole = watch('role');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/departments/public');
                setDepartments(response.data.departments);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                ...data,
                semester: data.semester ? parseInt(data.semester) : undefined,
            };
            await api.post('/auth/register', payload);
            setIsSuccess(true);
            // Store email for OTP verification
            localStorage.setItem('verification_email', data.email);
            setTimeout(() => navigate('/verify-otp'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-[100%] blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-tr-[100%] blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white rounded-[2.5rem] shadow-glass p-8 md:p-12 relative border border-gray-100">
                    {isSuccess ? (
                        <div className="py-20 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <h2 className="text-3xl font-heading font-black text-gray-900">Account Created!</h2>
                            <p className="text-gray-500 text-lg max-w-sm mx-auto">
                                Registration successful. Redirecting you to verify your email address...
                            </p>
                            <div className="w-12 h-1.5 bg-emerald-100 rounded-full mx-auto overflow-hidden">
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="w-full h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 transform rotate-6">
                                    <User size={28} />
                                </div>
                                <h2 className="text-3xl font-heading font-black text-gray-900">Create Account</h2>
                                <p className="text-gray-500 mt-2">Join the academic presentation network</p>
                            </div>

                            {error && (
                                <div className="mb-8 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={18} className="rotate-45" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="space-y-1.5">
                                    <label className="label">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                                        <input
                                            {...register('name')}
                                            placeholder="John Doe"
                                            className={`input pl-12 ${errors.name ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">University Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
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
                                    <label className="label">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                                        <input
                                            {...register('password')}
                                            type="password"
                                            placeholder="••••••••"
                                            className={`input pl-12 ${errors.password ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">Account Role</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                                        <select
                                            {...register('role')}
                                            className={`input pl-12 bg-white appearance-none ${errors.role ? 'input-error' : ''}`}
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="FACULTY">Faculty Member</option>
                                        </select>
                                    </div>
                                    {errors.role && <p className="text-red-500 text-xs mt-1 ml-1">{errors.role.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">Department</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                                        <select
                                            {...register('departmentId')}
                                            className={`input pl-12 bg-white appearance-none ${errors.departmentId ? 'input-error' : ''}`}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.departmentId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.departmentId.message}</p>}
                                </div>

                                {selectedRole === 'STUDENT' && (
                                    <div className="space-y-1.5">
                                        <label className="label">Current Semester</label>
                                        <div className="relative group">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                                            <select
                                                {...register('semester')}
                                                className={`input pl-12 bg-white appearance-none ${errors.semester ? 'input-error' : ''}`}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                    <option key={s} value={s.toString()}>Semester {s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.semester && <p className="text-red-500 text-xs mt-1 ml-1">{errors.semester.message}</p>}
                                    </div>
                                )}

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg group"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Register Now</span>
                                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-bold text-primary hover:underline">
                                        Log in here
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
