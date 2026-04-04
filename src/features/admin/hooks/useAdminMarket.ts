import { useState, useCallback } from 'react';
import { getAdminMarketAds, deleteMarketAdAdmin, updateMarketAdStatusAdmin } from '@/features/admin/actions/market';
import { MarketAd } from '@/features/market/types';
import { toast } from 'react-hot-toast';

export function useAdminMarket() {
    const [ads, setAds] = useState<MarketAd[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAds = useCallback(async (search?: string, page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAdminMarketAds(page, 50, search);
            setAds(result.ads);
            setTotalCount(result.total);
        } catch (err) {
            console.error('fetchAds error:', err);
            setError('تعذر جلب الإعلانات. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const result = await updateMarketAdStatusAdmin(id, status);
            if (result.success) {
                setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: status as any } : ad));
                toast.success('تم تحديث حالة الإعلان');
                return { success: true };
            }
            toast.error(result.error || 'فشل تحديث الحالة');
            return { success: false, error: result.error };
        } catch (err) {
            toast.error('حدث خطأ أثناء التحديث');
            return { success: false, error: 'Internal Error' };
        }
    };

    const removeAd = async (id: string) => {
        try {
            const result = await deleteMarketAdAdmin(id);
            if (result.success) {
                setAds(prev => prev.filter(ad => ad.id !== id));
                setTotalCount(prev => prev - 1);
                toast.success('تم حذف الإعلان بنجاح');
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
        ads,
        totalCount,
        isLoading,
        error,
        fetchAds,
        updateStatus,
        removeAd
    };
}
