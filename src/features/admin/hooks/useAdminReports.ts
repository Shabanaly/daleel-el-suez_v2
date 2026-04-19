/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import { useState, useCallback } from 'react';
import { getAdminReports, updateReportStatusAdmin, deleteReportAdmin } from '@/features/admin/actions/reports';
import { toast } from 'react-hot-toast';

export function useAdminReports() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async (search?: string, page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAdminReports(page, 50, search);
            setReports(result.reports);
            setTotalCount(result.total);
        } catch (err) {
            console.error('fetchReports error:', err);
            setError('تعذر جلب البلاغات. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const result = await updateReportStatusAdmin(id, status);
            if (result.success) {
                setReports(prev => prev.map(rep => rep.id === id ? { ...rep, status } : rep));
                toast.success('تم تحديث حالة البلاغ');
                return { success: true };
            }
            toast.error(result.error || 'فشل تحديث الحالة');
            return { success: false, error: result.error };
        } catch (err) {
            toast.error('حدث خطأ أثناء التحديث');
            return { success: false, error: 'Internal Error' };
        }
    };

    const removeReport = async (id: string) => {
        try {
            const result = await deleteReportAdmin(id);
            if (result.success) {
                setReports(prev => prev.filter(rep => rep.id !== id));
                setTotalCount(prev => prev - 1);
                toast.success('تم حذف سجل البلاغ');
                return { success: true };
            }
            toast.error(result.error || 'فشل الحذف');
            return { success: false, error: result.error };
        } catch (err) {
            toast.error('حدث خطأ أثناء الحذف');
            return { success: false, error: 'Internal Error' };
        }
    };

    return {
        reports,
        totalCount,
        isLoading,
        error,
        fetchReports,
        updateStatus,
        removeReport
    };
}
