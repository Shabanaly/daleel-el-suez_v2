'use client';

import { useState } from 'react';
import { MarketAd } from '@/lib/types/market';
import { 
    ChevronRight, 
    ChevronLeft, 
    MapPin, 
    Calendar, 
    Eye, 
    Share2, 
    MessageCircle, 
    Phone, 
    ShieldCheck,
    Info,
    ArrowRight,
    Tag,
    Clock
} from 'lucide-react';
import FavoriteButton from '@/components/market/ui/FavoriteButton';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface AdDetailsClientProps {
    ad: MarketAd;
}

export default function AdDetailsClient({ ad }: AdDetailsClientProps) {
    const [activeImage, setActiveImage] = useState(0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-EG').format(price);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('ar-EG', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: ad.title,
                text: ad.description,
                url: window.location.href
            });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* ─── Breadcrumbs & Actions ─── */}
            <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted text-xs font-bold">
                    <Link href="/market" className="hover:text-primary">السوق</Link>
                    <ChevronLeft className="w-3 h-3" />
                    <span>{ad.category_name || 'قسم آخر'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <FavoriteButton adId={ad.id} />
                    <button 
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ─── Left Column: Gallery & Description (8 cols) ─── */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Gallery */}
                        <div className="relative aspect-video bg-surface rounded-[40px] overflow-hidden border border-border-subtle group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={ad.images[activeImage]}
                                    alt={ad.title}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {ad.images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setActiveImage(prev => (prev === 0 ? ad.images.length - 1 : prev - 1))}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => setActiveImage(prev => (prev === ad.images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                            
                            {/* Thumbnails */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
                                {ad.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                            activeImage === i ? 'border-primary' : 'border-transparent opacity-60'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    {ad.condition === 'new' ? 'جديد' : ad.condition === 'used' ? 'مستعمل' : 'عقار'}
                                </span>
                                <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>نشر في {formatDate(ad.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-bold">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{ad.views_count} مشاهدة</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-text-primary leading-tight">
                                {ad.title}
                            </h1>

                            <div className="flex items-center gap-2 text-text-muted">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-bold">{ad.location}</span>
                            </div>

                            <div className="h-px bg-border-subtle/50" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    التفاصيل
                                </h3>
                                <p className="text-text-secondary leading-loose text-lg whitespace-pre-line font-medium">
                                    {ad.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Column: Sidebar (4 cols) ─── */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Price Card */}
                        <div className="glass-panel p-8 rounded-[40px] border-2 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 space-y-6">
                            <div className="space-y-1">
                                <p className="text-text-muted text-xs font-bold">السعر المطلوب</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-primary">{formatPrice(ad.price)}</span>
                                    <span className="text-lg font-bold text-primary/60">ج.م</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a 
                                    href={`tel:${ad.seller_phone}`}
                                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    <Phone className="w-6 h-6" />
                                    اتصال دلوقتي
                                </a>
                                <a 
                                    href={`https://wa.me/2${ad.seller_phone}`}
                                    target="_blank"
                                    className="w-full h-16 rounded-2xl bg-[#25D366] text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    واتساب
                                </a>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="glass-panel p-8 rounded-[40px] border border-border-subtle/50 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center text-2xl border border-border-subtle">
                                    👤
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-text-primary">{ad.seller_name}</h4>
                                    <p className="text-text-muted text-xs font-bold italic">عضو من {new Date(ad.created_at).getFullYear()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <p className="text-[10px] font-bold text-text-muted leading-relaxed">
                                    البائع موثق برقم الهاتف. خليك حذر واتقابل في مكان عام وتمم المعاينة قبل الدفع.
                                </p>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="p-6 rounded-[32px] bg-elevated/50 border border-border-subtle/30 space-y-4">
                            <h4 className="text-sm font-black text-text-primary flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                نصائح للمشتري
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    'لا ترسل عربون إلا بعد المعاينة',
                                    'قابل البائع في مكان عام وآمن',
                                    'افحص السلعة جيداً قبل الشراء'
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-text-muted">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
