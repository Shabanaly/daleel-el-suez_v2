'use client';

import { Search, Filter } from 'lucide-react';
import { PlaceStatus } from '@/lib/actions/admin/places';
import { useState, useCallback, useEffect } from 'react';

interface PlacesFilterProps {
    onFilterChange: (search: string, status?: PlaceStatus) => void;
}

export function PlacesFilter({ onFilterChange }: PlacesFilterProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PlaceStatus | ''>('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(searchTerm, statusFilter || undefined);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, onFilterChange]);

    return (
        <div className="bg-surface p-4 rounded-xl border shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                    type="text"
                    placeholder="ابحث باسم المكان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
            </div>

            <div className="relative min-w-[200px]">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PlaceStatus | '')}
                    className="w-full pl-4 pr-10 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                    <option value="">جميع الحالات</option>
                    <option value="pending">معلق</option>
                    <option value="approved">مقبول</option>
                    <option value="rejected">مرفوض</option>
                </select>
                {/* Custom arrow for select since appearance-none hides it */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
}
