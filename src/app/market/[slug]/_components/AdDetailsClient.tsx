'use client';

import { useState } from 'react';
import { MarketAd } from '@/lib/types/market';
import {
    ChevronLeft,
    MapPin,
    Eye,
    Share2,
    ShieldCheck,
    Info,
    ArrowRight,
    Tag,
    Clock
} from 'lucide-react';
import FavoriteButton from '@/components/market/ui/FavoriteButton';
import ShareButton from '@/components/ui/ShareButton';
import { useDialog } from "@/components/providers/DialogProvider";
import Link from 'next/link';
import { ImageGallery } from '@/components/common/ImageGallery';
import { Lightbox } from '@/components/common/Lightbox';
import { AdStickyActionsBar } from './AdStickyActionsBar';
import { useEffect } from 'react';
import { incrementMarketAdView } from '@/lib/actions/market';
import { AppBar } from '@/components/ui/AppBar';
interface AdDetailsClientProps {
    ad: MarketAd;
}

export default function AdDetailsClient({ ad }: AdDetailsClientProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Throttled View Increment (1 per ad per 24h)
    useEffect(() => {
        const checkAndView = async () => {
            const lastViewKey = `last_view_${ad.id}`;
            const lastView = localStorage.getItem(lastViewKey);
            const now = Date.now();
            const dayInMs = 24 * 60 * 60 * 1000;

            if (!lastView || now - parseInt(lastView) > dayInMs) {
                await incrementMarketAdView(ad.id);
                localStorage.setItem(lastViewKey, now.toString());
            }
        };

        checkAndView();
    }, [ad.id]);

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

    const { showAlert } = useDialog();

    const handleImageClick = (index: number) => {
        setActiveImageIndex(index);
        setIsLightboxOpen(true);
    };

    const galleryImages = ad.images && ad.images.length > 0 ? ad.images : [];

    return (
        <div className="w-full min-h-screen bg-background pb-24 md:pb-32 text-right" dir="rtl">
            {/* ── Top Navigation Bar (Mobile Only) ────────────────────────── */}
            <AppBar
                title={ad.title}
                transparent={false}
                backHref={`/market?category=${encodeURIComponent(ad.category_slug || 'all')}`}
                actions={
                    <ShareButton
                        title={ad.title}
                        text={`شوف الإعلان ده في سوق السويس: ${ad.title}`}
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated transition-colors"
                        onSuccess={() => showAlert({
                            title: 'تم النسخ!',
                            message: 'تم نسخ رابط الإعلان بنجاح! ✨',
                            type: 'success'
                        })}
                    >
                        <Share2 className="w-5 h-5" />
                    </ShareButton>
                }
            />

            <main className="pt-14 md:pt-32 max-w-4xl mx-auto px-4">
                {/* ── Desktop Breadcrumbs ───────────────────────────────────── */}
                <nav className="hidden md:flex items-center gap-2 mb-10 text-sm font-bold whitespace-nowrap overflow-hidden">
                    <Link href="/market" className="text-text-muted hover:text-primary transition-colors">السوق</Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30 shrink-0" />
                    <Link href={`/market?category=${encodeURIComponent(ad.category_slug || 'all')}`} className="text-text-muted hover:text-primary transition-colors">
                        {ad.category_name || 'قسم آخر'}
                    </Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30 shrink-0" />
                    <span className="text-primary truncate max-w-[200px]" title={ad.title}>{ad.title}</span>
                </nav>

                {/* ── 1. Image Gallery (Full width on mobile) ────────────────────────── */}
                {galleryImages.length > 0 && (
                    <div className="-mx-4 md:mx-0 mb-8 md:mb-12">
                        <ImageGallery
                            images={galleryImages}
                            placeName={ad.title}
                            onImageClick={handleImageClick}
                        />
                    </div>
                )}

                {/* ── 2. Header Info ────────────────────────────────────────── */}
                <section className="mb-8 relative">
                    <div className="flex items-center gap-3 mb-4 justify-end">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {ad.condition === 'new' ? 'جديد' : ad.condition === 'used' ? 'مستعمل' : 'عقار'}
                        </span>
                        <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full text-[10px] font-black border border-border-subtle/50 text-text-muted">
                            <Clock className="w-3 h-3" />
                            <span>نشر في {formatDate(ad.created_at)}</span>
                        </div>
                        <span className="text-text-muted text-[10px] font-black opacity-30">•</span>
                        <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full text-[10px] font-black border border-border-subtle/50 text-text-muted">
                            <Eye className="w-3 h-3" />
                            <span>{ad.views_count} مشاهدة</span>
                        </div>
                    </div>


                    <div className="flex items-start justify-between gap-4 mb-4">
                        {/* Favorite Button (Left side in RTL) */}
                        <div className="mt-1">
                            <FavoriteButton adId={ad.id} />
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight text-right flex-1 leading-tight">
                            {ad.title}
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-text-muted font-bold mb-6 justify-start bg-surface p-4 sm:p-2 rounded-xl border border-border-subtle/30">
                        <div className="flex items-center gap-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-primary">{formatPrice(ad.price)}</span>
                                <span className="text-sm font-bold text-primary/60">ج.م</span>
                            </div>
                            {ad.is_negotiable && (
                                <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black border border-green-500/20">
                                    قابل للتفاوض
                                </span>
                            )}
                        </div>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {ad.location}
                        </span>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <span className="text-primary font-black">{ad.category_name}</span>
                    </div>

                    <div className="space-y-4 mb-10">
                        <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            التفاصيل
                        </h3>
                        <p className="text-text-secondary leading-loose text-lg whitespace-pre-line font-medium p-6 rounded-3xl bg-elevated/30 border border-border-subtle/30">
                            {ad.description}
                        </p>
                    </div>
                </section>

                {/* ── 3. Primary Actions (Share only) ── */}
                <div className="hidden md:flex justify-end mb-10">
                    <ShareButton
                        title={ad.title}
                        text={`شوف الإعلان ده في سوق السويس: ${ad.title}`}
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        className="w-full md:w-auto px-8 h-16 rounded-[28px] bg-surface border border-border-subtle text-text-muted flex items-center justify-center gap-3 hover:bg-elevated transition-all shadow-lg group"
                        onSuccess={() => showAlert({
                            title: 'تم النسخ!',
                            message: 'تم نسخ رابط الإعلان بنجاح! ✨',
                            type: 'success'
                        })}
                    >
                        <Share2 className="w-6 h-6 transition-transform group-hover:scale-110 " />
                        <span className="font-black text-lg">مشاركة الإعلان</span>
                    </ShareButton>
                </div>

                {/* ── 4. Seller Card ─────────────────────────────────────── */}
                <section className="border-t border-border-subtle pt-10 space-y-6">
                    <h3 className="text-xl font-black text-text-primary text-right">معلومات البائع</h3>

                    <div className="glass-panel p-6 rounded-[32px] border border-border-subtle/50 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
                                👤
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-text-primary">{ad.seller_name}</h4>
                                <p className="text-text-muted text-xs font-bold italic mt-1">عضو في سوق السويس</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <ShieldCheck className="w-5 h-5 shrink-0 text-green-500" />
                            <p className="text-[11px] font-bold text-text-muted leading-relaxed">
                                البائع مسجل برقم هاتف. خليك حذر واتقابل في عمارات السكنية المأهولة أو الأماكن العامة وتأكد من السلعة قبل الدفع.
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-text-primary flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                نصائح أمان لك
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    'لا تحول عربون مهما كان المبلغ صغيراً قبل المعاينة',
                                    'يفضل تجربة الجهاز بالكامل قبل مغادرة المكان',
                                    'اطلب الكرتونة الأصلية والضمان إن وجد'
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-text-muted">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Lightbox Component ─────────────────────────────────────── */}
            <Lightbox
                images={galleryImages}
                index={activeImageIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />

            <AdStickyActionsBar phoneNumber={ad.seller_phone} />
        </div>
    );
}
