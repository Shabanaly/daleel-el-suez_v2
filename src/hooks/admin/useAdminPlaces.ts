import { useState, useCallback } from 'react';
import { getAdminPlaces, updatePlaceStatusAction, deletePlaceAction, PlaceStatus } from '@/lib/actions/admin/places';

export function useAdminPlaces() {
    const [places, setPlaces] = useState<Record<string, unknown>[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlaces = useCallback(async (search?: string, status?: PlaceStatus, page: number = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const limit = 100;
            const result = await getAdminPlaces({ search, status, page, limit });
            setPlaces(result.places || []);
            setTotalCount(result.totalCount || 0);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateStatus = async (placeId: string, status: PlaceStatus) => {
        try {
            await updatePlaceStatusAction(placeId, status);
            // Optimistic update
            setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, status } : p));
            return { success: true };
        } catch (err: unknown) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    };

    const deletePlace = async (placeId: string) => {
        try {
            await deletePlaceAction(placeId);
            // Optimistic update
            setPlaces(prev => prev.filter(p => p.id !== placeId));
            setTotalCount(prev => Math.max(0, prev - 1));
            return { success: true };
        } catch (err: unknown) {
            return { success: false, error: err instanceof Error ? err.message : 'فشل الحذف. يرجى المحاولة مرة أخرى.' };
        }
    };

    return {
        places,
        totalCount,
        isLoading,
        error,
        fetchPlaces,
        updateStatus,
        deletePlace
    };
}
