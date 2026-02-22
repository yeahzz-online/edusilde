import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    FileUp,
    CheckSquare,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    BookOpen,
    Users,
    Monitor,
    Database,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user?.role) {
            case 'STUDENT':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
                    { icon: BookOpen, label: 'Subjects', path: '/student/subjects' },
                    { icon: FileUp, label: 'Upload PPT', path: '/student/upload' },
                    { icon: Settings, label: 'Settings', path: '/student/settings' },
                ];
            case 'FACULTY':
                return [
                    { icon: LayoutDashboard, label: 'Overview', path: '/faculty' },
                    { icon: CheckSquare, label: 'Submissions', path: '/faculty/submissions' },
                    { icon: Monitor, label: 'Connect Smartboard', path: '/faculty/connect' },
                    { icon: Settings, label: 'Settings', path: '/faculty/settings' },
                ];
            case 'ADMIN':
                return [
                    { icon: LayoutDashboard, label: 'Statistics', path: '/admin' },
                    { icon: Users, label: 'Users & Depts', path: '/admin/users' },
                    { icon: Database, label: 'System', path: '/admin/system' },
                    { icon: Settings, label: 'Settings', path: '/admin/settings' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -256 }}
                        animate={{ x: 0 }}
                        exit={{ x: -256 }}
                        className="w-64 bg-primary text-white flex-shrink-0 z-50 fixed lg:static h-full"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Monitor strokeWidth={2.5} size={24} />
                                </div>
                                <div>
                                    <h1 className="font-heading font-black text-xl tracking-tight leading-none">
                                        EduSlide <span className="text-accent underline decoration-2 underline-offset-4 decoration-accent/50">Pro</span>
                                    </h1>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'nav-link-active' : ''}`
                                        }
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto p-6">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 lg:static"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 max-w-xl mx-8 hidden sm:block">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search presentations, subjects..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-100 mx-2"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-sm">
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
