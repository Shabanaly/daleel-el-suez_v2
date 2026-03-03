import { useState, useCallback } from 'react';
import { getAdminPlaces, updatePlaceStatusAction, deletePlaceAction, PlaceStatus } from '@/lib/actions/admin/places';

export function useAdminPlaces() {
    const [places, setPlaces] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlaces = useCallback(async (search?: string, status?: PlaceStatus) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAdminPlaces({ search, status });
            setPlaces(data || []);
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
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    return {
        places,
        isLoading,
        error,
        fetchPlaces,
        updateStatus,
        deletePlace
    };
}
