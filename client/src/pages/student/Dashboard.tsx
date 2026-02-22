import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, BookOpen, Clock, CheckCircle, XCircle, Download, Plus, Search, Filter, AlertCircle, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Presentation, Subject } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch presentations
    const { data: presentationsData, isLoading: isLoadingPresentations } = useQuery({
        queryKey: ['presentations'],
        queryFn: async () => {
            const res = await api.get('/presentations');
            return res.data.presentations as Presentation[];
        },
    });

    // Fetch subjects
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const res = await api.get('/subjects');
            return res.data.subjects as Subject[];
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.post('/presentations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presentations'] });
            setIsUploadModalOpen(false);
            setUploadError(null);
        },
        onError: (error: any) => {
            setUploadError(error.response?.data?.message || 'File upload failed');
        }
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onUploadSubmit = (data: any) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('subjectId', data.subjectId);
        if (data.file[0]) {
            formData.append('file', data.file[0]);
        } else {
            setUploadError('Please select a file to upload');
            return;
        }
        uploadMutation.mutate(formData);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="badge-approved"><CheckCircle size={14} /> Approved</span>;
            case 'REJECTED': return <span className="badge-rejected"><XCircle size={14} /> Rejected</span>;
            default: return <span className="badge-pending"><Clock size={14} /> Pending</span>;
        }
    };

    const stats = [
        { label: 'Total Submitted', value: presentationsData?.length || 0, icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending Review', value: presentationsData?.filter(p => p.status === 'PENDING').length || 0, icon: Clock, color: 'bg-amber-100 text-amber-600' },
        { label: 'Approved PPTs', value: presentationsData?.filter(p => p.status === 'APPROVED').length || 0, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
        { label: 'Total Subjects', value: subjectsData?.length || 0, icon: Plus, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-gray-900">Student Portal</h1>
                    <p className="text-gray-500 mt-2 font-medium">Welcome back, {user?.name}! Manage your academic presentations here.</p>
                </div>
                <button
                    onClick={() => { setIsUploadModalOpen(true); reset(); }}
                    className="btn-primary h-14 px-8 flex items-center gap-3 shadow-primary"
                >
                    <Plus size={22} strokeWidth={3} />
                    <span>Upload Presentation</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card group hover:scale-[1.02] transition-all cursor-default"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Submissions Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-heading font-black text-gray-900">Recent Submissions</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10" />
                            </div>
                            <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-primary transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="table-wrapper bg-white backdrop-blur-sm border-gray-50">
                        {isLoadingPresentations ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="spinner mx-auto w-10 h-10 border-4"></div>
                                <p className="text-gray-400 text-sm font-medium animate-pulse">Fetching your presentations...</p>
                            </div>
                        ) : presentationsData?.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileUp size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No PPTs Uploaded Yet</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto">Get started by uploading your first presentation for review.</p>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="mt-6 font-bold text-primary hover:underline underline-offset-4"
                                >
                                    Quick Upload →
                                </button>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Presentation Title</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {presentationsData?.map((p, i) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <td>
                                                <div className="font-bold text-gray-900">{p.title}</div>
                                                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">ID: {p.id.slice(-8)}</div>
                                            </td>
                                            <td>
                                                <div className="bg-gray-50 px-2 py-1 rounded text-xs inline-block font-mono font-bold text-gray-600">
                                                    {p.subject?.code}
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-1 truncate max-w-[120px]">{p.subject?.name}</div>
                                            </td>
                                            <td className="text-gray-500 text-xs">
                                                {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td>{getStatusBadge(p.status)}</td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={p.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                        title="Download/View"
                                                    >
                                                        <Download size={18} />
                                                    </a>
                                                    {p.status === 'PENDING' && (
                                                        <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="space-y-8">
                    {/* Calendar/Today Panel */}
                    <div className="card p-6 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <h3 className="text-lg font-bold mb-4 opacity-80">Quick Tips</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">1</div>
                                <p className="text-sm text-white/90">Ensure your PPT/PDF size is under <span className="font-bold">20MB</span>.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">2</div>
                                <p className="text-sm text-white/90">Faculty review usually takes <span className="font-bold">24-48 hours</span>.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">3</div>
                                <p className="text-sm text-white/90">Keep notifications <span className="font-bold">ON</span> to stay updated.</p>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-primary" />
                            Upload Guidelines
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                Only .pdf, .ppt, and .pptx formats are accepted.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                Include your Roll No. in the PPT title if required.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                Check your internet connection before hitting upload.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-xl p-8 md:p-10 shadow-2xl relative z-10 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-heading font-black text-gray-900">Upload Presentation</h3>
                                    <p className="text-gray-500 text-sm mt-1">Submit your work for faculty review</p>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XCircle size={24} className="text-gray-400" />
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                                    <AlertCircle size={18} />
                                    <span>{uploadError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="label">Presentation Title</label>
                                    <input
                                        {...register('title', { required: 'Title is required' })}
                                        type="text"
                                        placeholder="e.g., Analysis of Neural Networks"
                                        className={`input ${errors.title ? 'input-error' : ''}`}
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="label">Select Subject</label>
                                        <select
                                            {...register('subjectId', { required: 'Subject is required' })}
                                            className={`input bg-white ${errors.subjectId ? 'input-error' : ''}`}
                                        >
                                            <option value="">Select a subject</option>
                                            {subjectsData?.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="label">Display File (.pdf, .ppt)</label>
                                        <input
                                            {...register('file', { required: 'File is required' })}
                                            type="file"
                                            accept=".pdf,.ppt,.pptx"
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label">Short Description (Optional)</label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        placeholder="Briefly explain what this presentation covers..."
                                        className="input resize-none py-4"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="btn-outline flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadMutation.isPending}
                                        className="btn-primary flex-1 h-14"
                                    >
                                        {uploadMutation.isPending ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                        ) : 'Submit Presentation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
