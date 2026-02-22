import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Download, Search, Filter, Monitor, User, Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import api from '../../lib/api';
import { Presentation } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';

const FacultyDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const queryClient = useQueryClient();
    const socket = useSocket();
    const { user } = useAuth();

    // Fetch all presentations for faculty/admin
    const { data: presentations, isLoading } = useQuery({
        queryKey: ['presentations'],
        queryFn: async () => {
            const res = await api.get('/presentations');
            return res.data.presentations as Presentation[];
        },
    });

    // Listen for new submissions in real-time
    useEffect(() => {
        if (!socket) return;

        socket.on('new-submission', (data) => {
            queryClient.invalidateQueries({ queryKey: ['presentations'] });
            // Show notification toast logic could go here
        });

        return () => {
            socket.off('new-submission');
        };
    }, [socket, queryClient]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
            const res = await api.patch(`/presentations/${id}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presentations'] });
        },
    });

    const filteredPresentations = presentations?.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.uploader?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = [
        { label: 'Pending Reviews', value: presentations?.filter(p => p.status === 'PENDING').length || 0, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Total Approved', value: presentations?.filter(p => p.status === 'APPROVED').length || 0, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Students Active', value: new Set(presentations?.map(p => p.uploaderId)).size, color: 'text-blue-600', bg: 'bg-blue-100' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-gray-900 leading-tight">Faculty Dashboard</h1>
                    <p className="text-gray-500 mt-2 font-medium">Review student submissions and manage smartboard sessions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-outline h-12 flex items-center gap-2">
                        <Monitor size={18} />
                        <span>Smartboard Logs</span>
                    </button>
                    <button className="btn-accent h-12 flex items-center gap-2 shadow-accent">
                        <Play size={18} fill="currentColor" />
                        <span>Connect Smartboard</span>
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card p-6 flex flex-col items-center text-center group"
                    >
                        <div className={`w-16 h-16 rounded-[2rem] ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-all group-hover:rounded-2xl`}>
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-4xl font-black text-gray-900 mt-2 tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Main Review Section */}
            <div className="card overflow-hidden border-none shadow-glass">
                <div className="p-6 md:p-8 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-heading font-black text-gray-900">Presentation Queue</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search students or titles..."
                                className="input min-w-[280px] h-11 pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="input h-11 min-w-[140px] bg-gray-50 appearance-none font-bold text-xs uppercase tracking-wider"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">Status: All</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <button className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:text-primary transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="table-wrapper">
                    {isLoading ? (
                        <div className="py-24 text-center space-y-4">
                            <div className="spinner mx-auto w-12 h-12"></div>
                            <p className="text-gray-400 font-medium">Loading submissions...</p>
                        </div>
                    ) : filteredPresentations?.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <Search size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No matching submissions</h3>
                            <p className="text-gray-500 mt-2">Adjust your search or filter to find what you're looking for.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="pl-8">Student Info</th>
                                    <th>Presentation Detail</th>
                                    <th>Submitted At</th>
                                    <th>Status</th>
                                    <th className="pr-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredPresentations?.map((p, i) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            layout
                                            className="group"
                                        >
                                            <td className="pl-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {p.uploader?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{p.uploader?.name}</div>
                                                        <div className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase tracking-tighter italic">{p.uploader?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">{p.title}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono font-bold">{p.subject?.code}</span>
                                                    <span className="text-[11px] text-gray-500 w-24 truncate">{p.subject?.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} className="opacity-50" />
                                                    {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    <span className="text-[10px] opacity-40">@ {new Date(p.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {p.status === 'PENDING' && <span className="badge-pending">Pending</span>}
                                                {p.status === 'APPROVED' && <span className="badge-approved">Approved</span>}
                                                {p.status === 'REJECTED' && <span className="badge-rejected">Rejected</span>}
                                            </td>
                                            <td className="pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                    <a
                                                        href={p.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-gray-50 text-gray-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                                        title="Download PPT"
                                                    >
                                                        <Download size={18} />
                                                    </a>

                                                    {p.status === 'PENDING' ? (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'APPROVED' })}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'REJECTED' })}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="p-2.5 text-gray-300 hover:text-gray-500 rounded-xl"
                                                            onClick={() => {/* Toggle status perhaps */ }}
                                                        >
                                                            <AlertCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
