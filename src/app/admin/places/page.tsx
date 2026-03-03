'use client';

import { useEffect } from 'react';
import { useAdminPlaces } from '@/hooks/admin/useAdminPlaces';
import { PlacesFilter } from '@/components/admin/places/PlacesFilter';
import { PlacesDataTable } from '@/components/admin/places/PlacesDataTable';

export default function AdminPlacesPage() {
    const { places, isLoading, error, fetchPlaces, updateStatus, deletePlace } = useAdminPlaces();

    // Initial fetch
    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-primary">إدارة الأماكن</h1>
                <div className="text-sm text-text-muted bg-surface px-4 py-2 rounded-lg border">
                    إجمالي الأماكن: <span className="font-bold text-text-primary">{places.length}</span>
                </div>
            </div>

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <PlacesFilter onFilterChange={fetchPlaces} />

            <PlacesDataTable
                places={places}
                isLoading={isLoading}
                onUpdateStatus={updateStatus}
                onDelete={deletePlace}
            />
        </div>
    );
}
