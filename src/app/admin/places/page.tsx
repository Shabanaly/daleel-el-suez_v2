'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminPlaces } from '@/hooks/admin/useAdminPlaces';
import { PlacesFilter } from '@/components/admin/places/PlacesFilter';
import { PlacesDataTable } from '@/components/admin/places/PlacesDataTable';
import { PlaceStatus } from '@/lib/actions/admin/places';

export default function AdminPlacesPage() {
    const { places, totalCount, isLoading, error, fetchPlaces, updateStatus, deletePlace } = useAdminPlaces();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PlaceStatus | undefined>();
    const [page, setPage] = useState(1);
    const limit = 100;

    const handleFilterChange = useCallback((search: string, status?: PlaceStatus) => {
        setSearchTerm(search);
        setStatusFilter(status);
        setPage(1); // Reset to first page on filter change
    }, []);

    // Fetch places effect
    useEffect(() => {
        fetchPlaces(searchTerm, statusFilter, page);
    }, [fetchPlaces, searchTerm, statusFilter, page]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-primary">إدارة الأماكن</h1>
                <div className="text-sm text-text-muted bg-surface px-4 py-2 rounded-lg border">
                    إجمالي الأماكن: <span className="font-bold text-text-primary">{totalCount}</span>
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

            <PlacesFilter onFilterChange={handleFilterChange} />

            <PlacesDataTable
                places={places}
                isLoading={isLoading}
                onUpdateStatus={updateStatus}
                onDelete={deletePlace}
                page={page}
                totalPages={Math.ceil(totalCount / limit)}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
