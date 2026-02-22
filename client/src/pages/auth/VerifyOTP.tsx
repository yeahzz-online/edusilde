import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

const VerifyOTP: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendStatus, setResendStatus] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('verification_email');
        if (!storedEmail) {
            navigate('/register');
            return;
        }
        setEmail(storedEmail);
    }, [navigate]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus next input
        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await api.post('/auth/verify-otp', { email, otp: otpValue });
            setIsSuccess(true);
            localStorage.removeItem('verification_email');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendStatus('Sending...');
        try {
            await api.post('/auth/resend-otp', { email });
            setResendStatus('New code sent!');
            setTimeout(() => setResendStatus(null), 3000);
        } catch (err: any) {
            setResendStatus('Failed to resend');
            setTimeout(() => setResendStatus(null), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-primary/5 rounded-bl-[100%] blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-[100%] blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="bg-white rounded-[2.5rem] shadow-glass p-8 md:p-12 relative border border-gray-100">
                    <button
                        onClick={() => navigate('/register')}
                        className="absolute left-8 top-8 p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex flex-col items-center mb-10 pt-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-heading font-black text-gray-900">Verify Email</h2>
                        <p className="text-gray-500 mt-3 text-center px-4">
                            We've sent a 6-digit verification code to <br />
                            <span className="font-bold text-gray-900">{email}</span>
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <p className="text-emerald-600 font-bold text-xl">Verification Successful!</p>
                            <p className="text-gray-400">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="flex justify-between gap-2 md:gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full h-14 md:h-16 text-center text-2xl font-black bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl transition-all outline-none"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm justify-center">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full h-14 text-lg"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                    ) : 'Verify Code'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={!!resendStatus}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={16} className={resendStatus === 'Sending...' ? 'animate-spin' : ''} />
                                        {resendStatus || "Didn't receive a code? Resend"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                            EduSlide Pro • Secure verification
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
