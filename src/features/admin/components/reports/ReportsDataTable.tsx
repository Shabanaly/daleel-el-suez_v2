'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { AlertTriangle, Trash2, CheckCircle, Eye, User, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';

interface ReportsDataTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reports: any[];
    isLoading: boolean;
    onUpdateStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export function ReportsDataTable({ reports, isLoading, onUpdateStatus, onDelete, page, totalPages, onPageChange }: ReportsDataTableProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showConfirm } = useDialog();

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        await onUpdateStatus(id, status);
        setActionLoading(null);
    };

    const handleDelete = (id: string) => {
        showConfirm({
            title: 'حذف البلاغ',
            message: 'هل أنت متأكد من حذف هذا السجل نهائياً؟',
            type: 'confirm',
            confirmLabel: 'حذف',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setActionLoading(id);
                await onDelete(id);
                setActionLoading(null);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="glass-card rounded-3xl shadow-xl p-12 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary"></div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="glass-card rounded-3xl shadow-xl p-16 text-center text-text-muted border-border-subtle/50">
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 opacity-20" />
                <p className="text-xl font-black text-text-primary tracking-tight">لا توجد بلاغات حالياً</p>
                <p className="text-sm mt-2 font-medium">كل شيء يبدو نظيفاً! لم نصل أية بلاغات بخصوص المحتوى.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border-border-subtle/50 bg-surface/50 backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-elevated/40 text-text-secondary border-b border-border-subtle/50">
                        <tr>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">البلاغ</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden md:table-cell">المبلغ</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden lg:table-cell">النوع والمحتوى</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] hidden sm:table-cell">التاريخ</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">الحالة</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-primary/5 transition-all duration-300 group">
                                {/* Reason & Severity */}
                                <td className="px-6 py-5">
                                    <div className="font-bold text-text-primary group-hover:text-primary transition-colors text-sm line-clamp-1">{report.reason}</div>
                                    {report.details && (
                                        <div className="text-[10px] text-text-muted mt-1 leading-relaxed line-clamp-2 max-w-[200px]">{report.details}</div>
                                    )}
                                </td>

                                {/* Reporter */}
                                <td className="px-6 py-5 hidden md:table-cell">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-muted">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-text-secondary truncate">{report.reporter?.full_name || 'زائر'}</div>
                                            <div className="text-[10px] text-text-muted mt-0.5">@{report.reporter?.username || 'anon'}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Target Type & ID */}
                                <td className="px-6 py-5 hidden lg:table-cell">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-background border border-border-subtle text-[10px] font-black text-text-primary uppercase w-fit">
                                            {report.target_type === 'place' ? 'مكان' : 
                                             report.target_type === 'listing' ? 'ماركت' : 
                                             report.target_type === 'post' ? 'منشور' : report.target_type}
                                        </span>
                                        <div className="text-[9px] text-text-muted font-mono flex items-center gap-1">
                                            ID: {report.target_id.substring(0, 13)}...
                                            <Eye className="w-2.5 h-2.5 cursor-pointer hover:text-primary" />
                                        </div>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-5 hidden sm:table-cell text-text-muted text-[11px] font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(report.created_at), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-5 border-0">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter",
                                        report.status === 'pending' ? 'bg-warning/5 text-warning border-warning/20' : 
                                        report.status === 'resolved' ? 'bg-success/5 text-success border-success/20' : 
                                        'bg-text-muted/5 text-text-muted border-text-muted/20'
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                                            report.status === 'pending' ? 'bg-warning' : 
                                            report.status === 'resolved' ? 'bg-success' : 'bg-text-muted'
                                        )} />
                                        {report.status === 'pending' ? 'قيد المراجعة' : 
                                         report.status === 'resolved' ? 'تم الحل' : 'متجاهل'}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {actionLoading === report.id ? (
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {report.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusChange(report.id, 'resolved')}
                                                        className="p-2 text-success hover:bg-success/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-success/20"
                                                        title="تحديد كمحلول"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(report.id)}
                                                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-error/20"
                                                    title="حذف البلاغ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination placeholder */}
            {totalPages !== undefined && totalPages > 1 && onPageChange && page !== undefined && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border-subtle/30 bg-elevated/10 gap-4">
                    <div className="text-xs font-black text-text-muted uppercase tracking-widest">
                        صفحة <span className="text-primary">{page}</span> من <span className="text-text-primary">{totalPages}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
