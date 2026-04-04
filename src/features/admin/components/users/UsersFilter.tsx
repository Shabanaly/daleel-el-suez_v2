'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminUserRole } from '@/features/admin/actions/users';

interface UsersFilterProps {
    onFilterChange: (searchTerm: string, role?: AdminUserRole) => void;
}

export function UsersFilter({ onFilterChange }: UsersFilterProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState<AdminUserRole | 'all'>('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(searchTerm, role === 'all' ? undefined : role);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, role, onFilterChange]);

    const clearFilters = () => {
        setSearchTerm('');
        setRole('all');
    };

    return (
        <div className="glass-card p-4 rounded-xl shadow-sm mb-6 border-border-subtle backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Search */}
                <div className="flex-1 w-full">
                    <label className="text-sm font-bold text-text-secondary mb-2 block mr-1">بحث عن مستخدم</label>
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="الاسم، اسم المستخدم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-elevated/50 border border-border-subtle rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Role Filter */}
                <div className="w-full md:w-48">
                    <label className="text-sm font-bold text-text-secondary mb-2 block mr-1">نوع المستخدم</label>
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as AdminUserRole | 'all')}
                            className="w-full bg-elevated/50 border border-border-subtle rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">كل الرتب</option>
                            <option value="admin">مدير نظام</option>
                            <option value="moderator">مشرف</option>
                            <option value="user">مستخدم عادي</option>
                        </select>
                    </div>
                </div>

                {/* Clear */}
                {(searchTerm || role !== 'all') && (
                    <button
                        onClick={clearFilters}
                        className="p-2.5 text-text-muted hover:text-error hover:bg-error/10 rounded-xl border border-transparent hover:border-error/20 transition-all duration-300 group flex items-center gap-2"
                        title="مسح الفلاتر"
                    >
                        <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span className="text-sm font-bold md:hidden">مسح الفلاتر</span>
                    </button>
                )}
            </div>
        </div>
    );
}
