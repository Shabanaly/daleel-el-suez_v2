'use client';

import { useState, useRef, useEffect } from 'react';
import { MarketAd } from '@/lib/types/market';
import { deleteMarketAd } from '@/lib/actions/market';
import {
    Trash2,
    Loader2,
    Plus,
    ShoppingBag,
    MoreVertical,
    Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/components/common/SafeImage';

interface MyAdsClientProps {
    initialAds: MarketAd[];
}

export default function MyAdsClient({ initialAds }: MyAdsClientProps) {
    const [ads, setAds] = useState(initialAds);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        setOpenMenuId(null);
        setIsDeleting(id);
        const result = await deleteMarketAd(id);
        setIsDeleting(null);

        if (result.success) {
            setAds(prev => prev.filter(ad => ad.id !== id));
            router.refresh();
        } else {
            alert('فشل حذف الإعلان: ' + result.error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-EG').format(price);
    };

    if (ads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted/20">
                    <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-text-primary">مفيش إعلانات حالياً</h2>
                    <p className="text-text-muted text-sm px-10">إنت لسه منشرتش أي حاجة في السوق، ابدأ دلوقتي وبيع حاجتك!</p>
                </div>
                <Link
                    href="/market/create"
                    className="bg-primary text-white px-8 h-14 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    انشر أول إعلان
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-black text-text-primary">إعلاناتي ({ads.length})</h1>
                <Link
                    href="/market/create"
                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                >
                    <Plus className="w-6 h-6" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-5">
                <AnimatePresence mode='popLayout'>
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel rounded-3xl border border-border-subtle/50 flex flex-col group hover:border-primary/30 transition-all"
                        >
                            {/* Image → links to public ad page */}
                            <Link href={`/market/${ad.slug}`} className="block w-full aspect-square relative overflow-hidden bg-surface rounded-t-3xl">
                                <SafeImage
                                    src={ad.images[0]}
                                    alt={ad.title}
                                    fill
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-tight z-10">
                                    {ad.status === 'active' ? 'نشط' : 'غير نشط'}
                                </div>
                            </Link>

                            {/* Content */}
                            <div className="p-3 flex flex-col gap-2 overflow-visible">
                                <div className="flex items-start justify-between gap-1">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-black text-primary uppercase tracking-wider truncate">
                                            {ad.category_name} · {ad.location}
                                        </div>
                                        <h3 className="text-sm font-black text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                                            {ad.title}
                                        </h3>
                                    </div>


                                </div>
                                <div className='flex justify-between'>
                                    
                                    {/* Price */}
                                    <div className="text-base font-black text-primary">
                                        {formatPrice(ad.price)} <span className="text-[10px] font-bold text-primary/60">ج.م</span>
                                    </div>


                                    {/* ⋮ Menu */}
                                    <div
                                        className="relative shrink-0"
                                        ref={openMenuId === ad.id ? menuRef : null}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenMenuId(prev => prev === ad.id ? null : ad.id);
                                            }}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary transition-all"
                                        >
                                            <MoreVertical className="w-6 h-6" />
                                        </button>

                                        <AnimatePresence>
                                            {openMenuId === ad.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute left-0 top-9 z-50 w-36 glass-panel rounded-2xl border border-border-subtle shadow-2xl overflow-hidden"
                                                >
                                                    <Link
                                                        href={`/market/edit/${ad.id}`}
                                                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => setOpenMenuId(null)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        تعديل الإعلان
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(ad.id)}
                                                        disabled={isDeleting === ad.id}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                    >
                                                        {isDeleting === ad.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                        حذف الإعلان
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
