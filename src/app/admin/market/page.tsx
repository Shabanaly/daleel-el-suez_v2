'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminMarket } from '@/features/admin/hooks/useAdminMarket';
import { MarketFilter } from '@/features/admin/components/market/MarketFilter';
import { MarketDataTable } from '@/features/admin/components/market/MarketDataTable';
import { ShoppingBag } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminMarketPage() {
    const { ads, totalCount, isLoading, error, fetchAds, updateStatus, removeAd } = useAdminMarket();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 50;

    const handleFilterChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPage(1);
    }, []);

    useEffect(() => {
        fetchAds(searchTerm, page);
    }, [fetchAds, searchTerm, page]);

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
                    <div className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full w-fit border border-secondary/20">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        إدارة السوق والمستعمل
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter">إدارة الإعلانات</h1>
                    <p className="text-text-muted font-medium">تحكم في العروض والطلبات المنشورة في الماركت</p>
                </div>
                
                <div className="flex items-center gap-3 bg-elevated/40 p-1.5 rounded-2xl border border-border-subtle">
                    <div className="px-4 py-2 text-xs font-black text-text-primary">
                        الإجمالي: <span className="text-secondary">{totalCount}</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-6 bg-error/10 border border-error/20 rounded-3xl text-error text-center flex flex-col items-center gap-3">
                    <div className="p-3 bg-error/20 rounded-2xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="font-bold">{error}</p>
                    <button 
                        onClick={() => fetchAds(searchTerm, page)}
                        className="px-6 py-2 bg-error text-white font-black text-xs rounded-xl hover:bg-error/80 transition-colors uppercase"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Filter Section */}
            {!error && <MarketFilter onFilterChange={handleFilterChange} />}

            {/* Main Table */}
            {!error && (
                <MarketDataTable
                    ads={ads}
                    isLoading={isLoading}
                    onUpdateStatus={updateStatus}
                    onDelete={removeAd}
                    page={page}
                    totalPages={Math.ceil(totalCount / limit)}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
