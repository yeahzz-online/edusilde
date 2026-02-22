import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Grid,
    Maximize2,
    Clock,
    QrCode,
    LogOut,
    Monitor,
    Presentation as PresentationIcon,
    Layout
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Presentation } from '../../types';

const SmartboardInterface: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [totalSlides, setTotalSlides] = useState(32);
    const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
    const [presentations, setPresentations] = useState<Presentation[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Clock effect
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch approved presentations
    useEffect(() => {
        const fetchPresentations = async () => {
            try {
                const res = await api.get('/presentations');
                const approved = (res.data.presentations as Presentation[]).filter(p => p.status === 'APPROVED');
                setPresentations(approved);
                if (approved.length > 0) setSelectedPresentation(approved[0]);
            } catch (err) {
                console.error('Failed to fetch presentations for smartboard');
            }
        };
        fetchPresentations();
    }, []);

    // Controls auto-hide logic
    const handleMouseMove = () => {
        setShowControls(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowControls(false), 4000);
    };

    // Autoplay logic
    useEffect(() => {
        if (isPlaying) {
            autoplayRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev >= totalSlides ? 1 : prev + 1));
            }, 5000);
        } else {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        }
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [isPlaying, totalSlides]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className="fixed inset-0 bg-[#0A0F14] text-white flex flex-col font-sans overflow-hidden select-none"
            onMouseMove={handleMouseMove}
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -ml-64 -mb-64"></div>
            </div>

            {/* Auto-hiding Header */}
            <AnimatePresence>
                {showControls && (
                    <motion.header
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="h-24 px-10 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                    <Monitor size={28} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight leading-none">EduSlide Pro</h1>
                                    <p className="text-[10px] uppercase tracking-widest text-primary font-black mt-1.5 px-1 bg-white inline-block rounded">Smartboard Node</p>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-white/20 mx-2"></div>

                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Location</span>
                                <span className="text-sm font-bold">{user?.name || 'Academic Block - Hall 4A'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-black font-mono">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                                    <QrCode size={24} className="text-accent group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all group"
                                >
                                    <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Selector Panel */}
                <AnimatePresence>
                    {showControls && (
                        <motion.aside
                            initial={{ x: -400 }}
                            animate={{ x: 0 }}
                            exit={{ x: -400 }}
                            className="w-[400px] h-full p-8 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col z-40"
                        >
                            <div className="flex items-center gap-3 mb-10 text-accent">
                                <Layout size={24} />
                                <h3 className="text-xl font-black uppercase tracking-tighter">Resources Queue</h3>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
                                {presentations.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPresentation(p)}
                                        className={`block w-full p-5 rounded-3xl text-left transition-all relative overflow-hidden group ${selectedPresentation?.id === p.id
                                                ? 'bg-primary shadow-2xl ring-2 ring-white/20'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {selectedPresentation?.id === p.id && (
                                            <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-2 bg-accent shadow-accent shadow-lg" />
                                        )}
                                        <h4 className={`font-black uppercase tracking-tight line-clamp-2 ${selectedPresentation?.id === p.id ? 'text-white' : 'text-gray-200'}`}>
                                            {p.title}
                                        </h4>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                                    {p.uploader?.name.charAt(0)}
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">By {p.uploader?.name}</span>
                                            </div>
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${selectedPresentation?.id === p.id ? 'bg-white/20' : 'bg-black/20'}`}>
                                                {p.subject?.code}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto p-4 bg-accent/20 border border-accent/30 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary-dark">
                                    <Grid size={24} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-accent opacity-80">Grid Mode</p>
                                    <p className="text-sm font-bold">Show all available</p>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Viewing Area */}
                <main className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
                    {selectedPresentation ? (
                        <div className="w-full h-full p-12 flex flex-col items-center justify-center">
                            <div className="w-full h-full max-w-7xl bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden flex flex-col relative group/viewer">
                                {/* PDF/PPT Content Simulation */}
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-neutral-900 border-b border-gray-100">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        className="text-center space-y-12"
                                    >
                                        <div className="space-y-4">
                                            <h2 className="text-5xl font-black tracking-tight leading-tight">{selectedPresentation.title}</h2>
                                            <p className="text-xl font-medium text-gray-400 italic">Exploring {selectedPresentation.subject?.name}</p>
                                        </div>

                                        <div className="flex items-center justify-center gap-10">
                                            <div className="w-48 h-48 bg-gray-50 rounded-[4rem] flex flex-col items-center justify-center border-4 border-primary/5">
                                                <span className="text-6xl font-black text-primary">{currentSlide}</span>
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-300 mt-2">Page</span>
                                            </div>
                                            <div className="w-24 h-px bg-gray-100"></div>
                                            <div className="flex flex-col items-start gap-3">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle className="text-emerald-500" size={24} />
                                                    <span className="text-lg font-bold">Verified Content</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <PresentationIcon className="text-primary" size={24} />
                                                    <span className="text-lg font-bold">HD Resolution</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Meta info bottom */}
                                <div className="h-24 px-12 bg-neutral-900 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Presentation Resource</span>
                                        <span className="font-bold text-accent">{selectedPresentation.title}</span>
                                    </div>
                                    <div className="flex items-center gap-8 font-mono font-bold text-lg">
                                        <span>{currentSlide} <span className="opacity-20 mx-2">/</span> {totalSlides}</span>
                                        <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary"
                                                animate={{ width: `${(currentSlide / totalSlides) * 100}%` }}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Monitor size={48} className="text-gray-500" />
                            </div>
                            <h2 className="text-4xl font-black opacity-30 uppercase tracking-[0.5em]">System Idle</h2>
                        </div>
                    )}

                    {/* Floating Controls */}
                    <AnimatePresence>
                        {showControls && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 z-50 shadow-2xl"
                            >
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                                        className="p-4 hover:bg-white/10 rounded-full transition-all active:scale-90"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-20 h-20 bg-primary hover:bg-primary-light rounded-full flex items-center justify-center transition-all shadow-primary-lg active:scale-95 group"
                                    >
                                        {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" className="ml-1" />}
                                    </button>
                                    <button
                                        onClick={() => setCurrentSlide(prev => Math.min(totalSlides, prev + 1))}
                                        className="p-4 hover:bg-white/10 rounded-full transition-all active:scale-90"
                                    >
                                        <ChevronRight size={32} />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-white/10 mx-2"></div>

                                <div className="flex items-center gap-1 pr-2">
                                    <button className="p-4 hover:bg-white/10 rounded-full transition-all group">
                                        <Grid size={28} className="group-hover:text-accent transition-colors" />
                                    </button>
                                    <button className="p-4 hover:bg-white/10 rounded-full transition-all group">
                                        <Maximize2 size={28} className="group-hover:text-accent transition-colors" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SmartboardInterface;
