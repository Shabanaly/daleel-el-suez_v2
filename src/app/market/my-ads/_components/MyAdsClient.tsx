'use client';

import { useState } from 'react';
import { MarketAd } from '@/lib/types/market';
import { deleteMarketAd } from '@/lib/actions/market';
import { 
    Trash2, 
    Edit3, 
    Eye, 
    MoreVertical, 
    ExternalLink, 
    AlertCircle,
    Loader2,
    Plus,
    ShoppingBag,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MyAdsClientProps {
    initialAds: MarketAd[];
}

export default function MyAdsClient({ initialAds }: MyAdsClientProps) {
    const [ads, setAds] = useState(initialAds);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black text-text-primary">إعلاناتي ({ads.length})</h1>
                <Link 
                    href="/market/create"
                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                >
                    <Plus className="w-6 h-6" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode='popLayout'>
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel p-4 md:p-6 rounded-3xl border border-border-subtle/50 flex flex-col md:flex-row gap-6 group hover:border-primary/30 transition-all"
                        >
                            {/* Image Container */}
                            <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-surface shrink-0 relative">
                                <img 
                                    src={ad.images[0]} 
                                    alt={ad.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tight">
                                    {ad.status === 'active' ? 'نشط' : 'غير نشط'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                        <span>{ad.category_name}</span>
                                        <span className="w-1 h-1 rounded-full bg-border-subtle" />
                                        <span className="text-text-muted">{ad.location}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                                        {ad.title}
                                    </h3>
                                    <p className="text-xs text-text-muted line-clamp-2 md:line-clamp-1 leading-relaxed">
                                        {ad.description}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border-subtle/30 pt-4">
                                    <div className="text-xl font-black text-primary">
                                        {formatPrice(ad.price)} <span className="text-xs font-bold text-primary/60">ج.م</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            href={`/market/${ad.slug}`}
                                            className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                                            title="عرض"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(ad.id)}
                                            disabled={isDeleting === ad.id}
                                            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            title="حذف"
                                        >
                                            {isDeleting === ad.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
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
