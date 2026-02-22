import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Users,
    Building2,
    Monitor,
    Database,
    ShieldCheck,
    Activity,
    Cpu,
    Globe,
    Mail,
    Plus,
    ArrowUpRight,
    Settings
} from 'lucide-react';
import api from '../../lib/api';
import { User, Department, Smartboard, Subject } from '../../types';

const AdminDashboard: React.FC = () => {
    // Fetch overview data
    const { data: usersData } = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/users')).data });
    const { data: deptsData } = useQuery({ queryKey: ['admin-depts'], queryFn: async () => (await api.get('/departments')).data });
    const { data: smartboardsData } = useQuery({ queryKey: ['admin-smartboards'], queryFn: async () => (await api.get('/smartboards')).data });

    const stats = [
        { label: 'Total Users', value: usersData?.users?.length || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Departments', value: deptsData?.departments?.length || 0, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Active Boards', value: smartboardsData?.smartboards?.length || 0, icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'System Health', value: '98%', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    ];

    return (
        <div className="space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-gray-900">System Control</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">EduSlide Pro Administrative Oversight Panel</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-bold">
                        <ShieldCheck size={18} />
                        <span>Secure Mode: Active</span>
                    </div>
                    <button className="btn-primary h-12">
                        <Activity size={18} className="mr-2" />
                        Live Logs
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="card p-6 border-none shadow-glass group hover:translate-y-[-4px] transition-all bg-white"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:rotate-6`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                                <ArrowUpRight size={12} />
                                <span>+12%</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* System Monitoring */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 bg-[#1B262C] text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-heading font-black flex items-center gap-3">
                                    <Cpu className="text-primary" />
                                    Service Health
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Real-time monitoring
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: 'Database Cluster', value: 92, color: 'bg-primary' },
                                    { label: 'Storage (Cloudinary)', value: 45, color: 'bg-accent' },
                                    { label: 'Email Gateway (SMTP)', value: 100, color: 'bg-emerald-500' },
                                    { label: 'Socket Cluster', value: 78, color: 'bg-purple-500' },
                                ].map((service, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="opacity-60">{service.label}</span>
                                            <span>{service.value}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${service.value}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={`h-full ${service.color} shadow-lg shadow-${service.color}/20`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-heading font-black text-gray-900">Recent Users</h2>
                        <button className="text-sm font-bold text-primary hover:underline">View All Users</button>
                    </div>

                    <div className="table-wrapper bg-white backdrop-blur-sm shadow-sm">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersData?.users?.slice(0, 5).map((user: User, i: number) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-[10px] text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-500">{user.department?.name || 'N/A'}</td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Active
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                    <div className="card p-6 bg-white shadow-glass border-none">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="text-primary" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button className="flex items-center justify-between p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl transition-all group">
                                <div className="flex items-center gap-3 font-bold text-sm">
                                    <Users size={18} className="text-primary group-hover:text-white" />
                                    Add New User
                                </div>
                                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button className="flex items-center justify-between p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl transition-all group">
                                <div className="flex items-center gap-3 font-bold text-sm">
                                    <Building2 size={18} className="text-primary group-hover:text-white" />
                                    Create Department
                                </div>
                                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button className="flex items-center justify-between p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl transition-all group">
                                <div className="flex items-center gap-3 font-bold text-sm">
                                    <Monitor size={18} className="text-primary group-hover:text-white" />
                                    Register Smartboard
                                </div>
                                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>

                    <div className="card p-6 bg-gradient-to-br from-[#1B262C] to-[#0A0F14] text-white border-none relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Settings className="text-accent" />
                                Global Config
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">SMTP Access</span>
                                    </div>
                                    <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end p-1">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Database size={16} className="text-gray-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Auto Backup</span>
                                    </div>
                                    <div className="w-10 h-5 bg-white/10 rounded-full flex items-center justify-start p-1">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Update Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
