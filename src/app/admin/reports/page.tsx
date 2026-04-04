'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminReports } from '@/features/admin/hooks/useAdminReports';
import { ReportsFilter } from '@/features/admin/components/reports/ReportsFilter';
import { ReportsDataTable } from '@/features/admin/components/reports/ReportsDataTable';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminReportsPage() {
    const { reports, totalCount, isLoading, error, fetchReports, updateStatus, removeReport } = useAdminReports();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 50;

    const handleFilterChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPage(1);
    }, []);

    useEffect(() => {
        fetchReports(searchTerm, page);
    }, [fetchReports, searchTerm, page]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <Toaster position="top-right" />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border-subtle/50">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-error font-black text-[10px] uppercase tracking-widest bg-error/10 px-3 py-1 rounded-full w-fit border border-error/20">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        نظام إدارة البلاغات والمحتوى
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter">مركز المراجعة</h1>
                    <p className="text-text-muted font-medium">مراجعة البلاغات المقدمة من المستخدمين والتعامل مع المحتوى المخالف</p>
                </div>
                
                <div className="flex items-center gap-3 bg-elevated/40 p-1.5 rounded-2xl border border-border-subtle">
                    <div className="px-4 py-2 text-xs font-black text-text-primary">
                        قيد المعالجة: <span className="text-error">{reports.filter(r => r.status === 'pending').length}</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-10 bg-error/10 border border-error/20 rounded-[40px] text-error text-center flex flex-col items-center gap-4">
                    <div className="p-4 bg-error/20 rounded-3xl">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-black tracking-tight">{error}</p>
                        <p className="text-sm font-medium opacity-70">على الأغلب جدول البلاغات غير متاح حالياً في قاعدة البيانات.</p>
                    </div>
                    <button 
                        onClick={() => fetchReports(searchTerm, page)}
                        className="px-8 py-3 bg-error text-white font-black text-xs rounded-2xl hover:bg-error/80 transition-all active:scale-95 uppercase shadow-lg shadow-error/20"
                    >
                        إعادة المحاولة
                    </button>
                    
                    <div className="mt-6 p-4 bg-background/50 rounded-2xl border border-border-subtle text-right text-[10px] font-mono text-text-muted max-w-md">
                        <p className="mb-2 font-bold text-text-secondary">💡 تلميح للمطور:</p>
                        يرجى التأكد من تشغيل التهجير (Migration) الخاص بجدول <code className="text-primary">reports</code> ونظام الـ Row Level Security ليعمل هذا القسم بشكل كامل.
                    </div>
                </div>
            )}

            {/* Filter Section */}
            {!error && <ReportsFilter onFilterChange={handleFilterChange} />}

            {/* Main Table */}
            {!error && (
                <ReportsDataTable
                    reports={reports}
                    isLoading={isLoading}
                    onUpdateStatus={updateStatus}
                    onDelete={removeReport}
                    page={page}
                    totalPages={Math.ceil(totalCount / limit)}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
