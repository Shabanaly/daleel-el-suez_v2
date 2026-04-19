'use client';

import { useState } from 'react';
import { MarketAd } from '@/features/market/types';
import { deleteMarketAd, updateMarketAdStatus } from '@/features/market/actions/market.server';
import {
    Plus,
    ShoppingBag,
    Filter,
    Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomLink from '@/components/customLink/customLink';
import { useRouter } from 'next/navigation';
import { AppBar } from '@/components/ui/AppBar';
import { ROUTES } from '@/constants';
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu';
import { useDialog } from '@/components/providers/DialogProvider';
import { MyAdCard } from './MyAdCard';

interface MyAdsClientProps {
    initialAds: MarketAd[];
}

type FilterType = 'all' | 'active' | 'sold' | 'inactive';

// ── Sub-components moved outside render ──────────────────
const FilterTrigger = ({ 
    activeFilter, 
    isMobile = false 
}: { 
    activeFilter: FilterType, 
    isMobile?: boolean 
}) => {
    const getFilterLabel = (filter: FilterType) => {
        switch (filter) {
            case 'active': return 'نشط';
            case 'sold': return 'تم بيعه';
            case 'inactive': return 'غير نشط';
            default: return 'الكل';
        }
    };

    return (
        <button
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                isMobile 
                    ? 'border-border-subtle bg-surface' 
                    : 'bg-surface border-border-subtle hover:border-primary/50'
            }`}
        >
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-black">{getFilterLabel(activeFilter)}</span>
        </button>
    );
};

export default function MyAdsClient({ initialAds }: MyAdsClientProps) {
    const [ads, setAds] = useState(initialAds);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const router = useRouter();
    const { showConfirm, showAlert } = useDialog();

    const handleDelete = (id: string) => {
        showConfirm({
            title: 'حذف الإعلان',
            message: 'هل أنت متأكد من حذف هذا الإعلان نهائياً؟',
            type: 'confirm',
            confirmLabel: 'حذف',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setIsProcessing(id);
                const result = await deleteMarketAd(id);
                setIsProcessing(null);

                if (result.success) {
                    setAds(prev => prev.filter(ad => ad.id !== id));
                    router.refresh();
                } else {
                    showAlert({
                        title: 'خطأ',
                        message: 'فشل حذف الإعلان: ' + result.error,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsProcessing(id);
        const result = await updateMarketAdStatus(id, newStatus);
        setIsProcessing(null);

        if (result.success) {
            setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: newStatus as MarketAd['status'] } : ad));
            router.refresh();
        } else {
            showAlert({
                title: 'خطأ',
                message: 'فشل تحديث حالة الإعلان: ' + result.error,
                type: 'error'
            });
        }
    };

    const filteredAds = ads.filter(ad => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'inactive') return ad.status !== 'active' && ad.status !== 'sold';
        return ad.status === activeFilter;
    });

    const filterItems: ContextMenuItem[] = (['all', 'active', 'sold', 'inactive'] as FilterType[]).map(f => ({
        label: (f === 'active' ? 'نشط' : f === 'sold' ? 'تم بيعه' : f === 'inactive' ? 'غير نشط' : 'الكل'),
        variant: activeFilter === f ? 'active' : 'default',
        onClick: () => setActiveFilter(f)
    }));

    return (
        <div className="min-h-screen bg-background pb-20">
            <AppBar 
                title="إعلاناتي" 
                backHref={ROUTES.PROFILE} 
                actions={
                    <ContextMenu 
                        trigger={<FilterTrigger isMobile activeFilter={activeFilter} />} 
                        items={filterItems} 
                        align="left"
                    />
                }
            />

            <div className="max-w-4xl mx-auto px-4 md:px-12 pt-14 md:pt-24 space-y-6 md:space-y-8">
                {/* Header Section (Unified Mobile/Desktop) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">إعلاناتي</h1>
                        <p className="text-sm md:text-base text-text-muted font-bold opacity-70 mt-1">إدارة وتحرير إعلاناتك في سوق السويس</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
                        <div className="flex-1 md:flex-none">
                            <ContextMenu
                                trigger={<FilterTrigger activeFilter={activeFilter} />}
                                items={filterItems}
                                align="left"
                            />
                        </div>
                        <CustomLink
                            href={ROUTES.MARKET_CREATE}
                            className="bg-primary text-white px-6 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex-1 md:flex-none"
                        >
                            <Plus className="w-5 h-5" />
                            إعلان جديد
                        </CustomLink>
                    </div>
                </div>

                {/* Grid */}
                {filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredAds.map((ad, index) => (
                                <MyAdCard 
                                    key={ad.id} 
                                    ad={ad} 
                                    onDelete={handleDelete} 
                                    onUpdateStatus={handleUpdateStatus}
                                    isProcessing={isProcessing === ad.id} 
                                    index={index} 
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-center"
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface border-2 border-dashed border-border-subtle flex items-center justify-center text-primary/20 mb-8">
                            {activeFilter === 'all' ? <ShoppingBag className="w-12 h-12 md:w-16 md:h-16" /> : <Package className="w-12 h-12 md:w-16 md:h-16" />}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-3">
                            {activeFilter === 'all' ? 'مفيش إعلانات لسه' :
                                activeFilter === 'active' ? 'لا توجد إعلانات نشطة' : 'لا توجد إعلانات قيد المراجعة'}
                        </h2>

                        <p className="text-text-muted text-sm md:text-base max-w-sm font-medium opacity-80 mb-10 leading-relaxed">
                            {activeFilter === 'all'
                                ? 'إنت لسه مأضفتش أي إعلانات في السوق، ممكن تبدأ دلوقتي وتوصل لآلاف المشترين في السويس.'
                                : 'حاول تغيير الفلتر لعرض جميع إعلاناتك أو قم بإضافة إعلان جديد.'}
                        </p>

                        <CustomLink
                            href={ROUTES.MARKET_CREATE}
                            className="bg-primary text-white px-10 h-16 rounded-xl flex items-center gap-3 font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6 outline-none" />
                            نزل إعلان جديد
                        </CustomLink>
                    </motion.div>
                )}

                {/* Mobile FAB for adding new ad (Floating Action Button) */}
                <div className="md:hidden fixed bottom-5 left-6 z-40">
                    <CustomLink
                        href={ROUTES.MARKET_CREATE}
                        className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50 active:scale-90 transition-all border-2 border-white/20"
                    >
                        <Plus className="w-8 h-8" />
                    </CustomLink>
                </div>
            </div>
        </div>
    );
}
