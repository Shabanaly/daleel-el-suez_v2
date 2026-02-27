'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star, MapPin, Share2, Phone, ArrowRight, Heart, Clock,
    Globe, User, MessageSquare, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { Place } from '@/lib/types/places';
import { PlaceCard } from './PlaceCard';
import { Lightbox } from './Lightbox';

interface PlaceDetailsClientProps {
    place: Place;
    relatedPlaces: Place[];
}

export function PlaceDetailsClient({ place, relatedPlaces }: PlaceDetailsClientProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Mock gallery images (since we only have one main imageUrl)
    const galleryImages = [
        place.imageUrl || '',
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop"
    ].filter(img => img !== '');

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorite_places') || '[]');
        setIsFavorite(favorites.includes(place.id));
    }, [place.id]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorite_places') || '[]');
        let newFavorites;
        if (favorites.includes(place.id)) {
            newFavorites = favorites.filter((id: string) => id !== place.id);
            setIsFavorite(false);
        } else {
            newFavorites = [...favorites, place.id];
            setIsFavorite(true);
        }
        localStorage.setItem('favorite_places', JSON.stringify(newFavorites));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: place.name,
                    text: `شوف المكان ده في السويس: ${place.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('تم نسخ الرابط!');
        }
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.area + ' السويس')}`;

    return (
        <div className="w-full min-h-screen bg-base pb-24 md:pb-32">
            {/* ── Top Navigation Bar (Mobile Only) ────────────────────────── */}
            <header className="fixed top-0 w-full z-50 px-4 py-4 flex justify-between items-center bg-base/60 backdrop-blur-xl border-b border-border-subtle/50 md:hidden">
                <Link
                    href="/places"
                    className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated transition-colors"
                >
                    <ArrowRight className="w-6 h-6" />
                </Link>
                <h2 className="text-lg font-bold text-text-primary">تفاصيل المكان</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="pt-24 md:pt-32 max-w-4xl mx-auto px-4">

                {/* ── Desktop Breadcrumbs ───────────────────────────────────── */}
                <nav className="hidden md:flex items-center gap-2 mb-10 text-sm font-bold">
                    <Link href="/" className="text-text-muted hover:text-primary-500 transition-colors">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30" />
                    <Link href="/places" className="text-text-muted hover:text-primary-500 transition-colors">أماكن</Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30" />
                    <span className="text-text-muted/50">{place.category}</span>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30" />
                    <span className="text-primary-500">{place.name}</span>
                </nav>

                {/* ── 1. Image Gallery ──────────────────────────────────────── */}
                <div className="flex gap-4 overflow-x-auto pb-6 mb-8 snap-x no-scrollbar scroll-smooth">
                    {galleryImages.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => { setActiveImageIndex(idx); setIsLightboxOpen(true); }}
                            className={`relative shrink-0 cursor-zoom-in ${idx === 0 ? 'w-[320px] md:w-[500px]' : 'w-[240px] md:w-[300px]'} h-[320px] md:h-[400px] rounded-[44px] overflow-hidden snap-center shadow-2xl border border-border-subtle/30 group`}
                        >
                            <Image
                                src={img}
                                alt={place.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 text-white">
                                    <ChevronLeft className="w-6 h-6 rotate-180" />
                                </span>
                            </div>
                            {idx === 0 && <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase">الصورة الأساسية</div>}
                        </div>
                    ))}
                </div>

                {/* ── 2. Header Info ────────────────────────────────────────── */}
                <section className="mb-8 relative">
                    {/* Floating Favorite Button (Desktop) */}
                    <button
                        onClick={toggleFavorite}
                        className={`hidden md:flex absolute top-0 left-0 w-14 h-14 rounded-2xl items-center justify-center border transition-all duration-500 ${isFavorite
                            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                            : 'bg-surface text-text-muted border-border-subtle hover:border-rose-500/50 hover:text-rose-500'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-full text-xs font-black shadow-sm border border-primary-500/20">
                            <Star className="w-3.5 h-3.5 fill-primary-500" />
                            <span>{place.rating}</span>
                        </div>
                        <span className="text-text-muted text-xs font-bold">({place.reviews} تقييم)</span>
                        {place.isVerified && (
                            <div className="flex items-center gap-1.5 bg-secondary-500/10 text-secondary-500 px-3 py-1.5 rounded-full text-xs font-black border border-secondary-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>موثوق</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-3 tracking-tight">
                        {place.name}
                    </h1>

                    <div className="flex items-center gap-2 text-text-muted font-bold mb-6">
                        <span className="text-primary-500 font-black">{place.category}</span>
                        <span className="opacity-30">•</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {place.area}، السويس
                        </span>
                    </div>

                    <p className="text-text-muted text-lg leading-relaxed max-w-2xl font-medium opacity-90">
                        {place.description || 'اكتشف أفضل الخدمات والمنتجات المتاحة في مدينة السويس بأسعار تنافسية وجودة عالية.'}
                    </p>
                </section>

                {/* ── 3. Primary Actions ────────────────────────────────────── */}
                <div className="flex gap-4 mb-16">
                    <a
                        href={`tel:${place.phoneNumber}`}
                        className="flex-1 h-16 rounded-[28px] bg-linear-to-r from-primary-600 to-primary-400 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Phone className="w-6 h-6" />
                        <span className="text-lg">اتصال الآن</span>
                    </a>
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-16 rounded-[28px] bg-surface border border-border-subtle text-text-primary font-black flex items-center justify-center gap-3 shadow-lg hover:bg-elevated transition-all border-b-4 border-b-border-subtle active:border-b-0 active:translate-y-1"
                    >
                        <MapPin className="w-6 h-6 text-primary-500" />
                        <span className="text-lg">الموقع</span>
                    </a>

                    {/* Share Button (Desktop) */}
                    <button
                        onClick={handleShare}
                        className="hidden md:flex w-16 h-16 rounded-[28px] bg-surface border border-border-subtle text-text-muted items-center justify-center hover:bg-elevated transition-all shadow-lg"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>

                    {/* Favorite Button (Mobile) */}
                    <button
                        onClick={toggleFavorite}
                        className={`md:hidden w-16 h-16 rounded-[28px] flex items-center justify-center border transition-all duration-500 ${isFavorite
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-surface text-text-muted border-border-subtle'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* ── 4. Place Information ───────────────────────────────────── */}
                <section className="mb-16">
                    <div className="p-8 rounded-[44px] glass-panel border border-border-subtle/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <h3 className="text-2xl font-black text-text-primary mb-8 tracking-tight">معلومات التواصل</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center gap-5 group">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary mb-0.5">ساعات العمل</h4>
                                    <p className="text-text-muted text-sm font-bold opacity-70">{place.openHours}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary mb-0.5">العنوان بالتفصيل</h4>
                                    <p className="text-text-muted text-sm font-bold opacity-70">{place.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-14 h-14 rounded-2xl bg-secondary-500/10 flex items-center justify-center text-secondary-500 shrink-0 border border-secondary-500/20 group-hover:bg-secondary-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary mb-0.5">رقم الهاتف</h4>
                                    <p className="text-text-muted text-sm font-bold opacity-70" dir="ltr">{place.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary mb-0.5">الموقع الإلكتروني</h4>
                                    <Link href="#" className="text-primary-500 text-sm font-black hover:underline tracking-tight">www.suezguide.com</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 5. User Reviews ────────────────────────────────────────── */}
                <section className="mb-16 border-t border-border-subtle pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-text-primary">آراء الزوار</h3>
                        <button className="text-primary-500 font-black text-sm hover:underline hover:text-primary-400">عرض الكل</button>
                    </div>

                    <div className="space-y-6 mb-12">
                        {/* Review Content */}
                        <div className="glass-panel p-6 rounded-3xl border border-border-subtle/40 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-elevated flex items-center justify-center border border-border-subtle text-text-muted shadow-inner">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-text-primary">أحمد محمد</h4>
                                </div>
                                <div className="flex text-accent drop-shadow-sm">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent" />)}
                                </div>
                            </div>
                            <p className="text-text-muted text-[15px] leading-relaxed font-medium">
                                مطعم ممتاز جداً والأكل نظيف والخدمة سريعة، أنصح بتجربة طاجن السبيط المشوي بالخلطة السويسية الأصلية.
                            </p>
                        </div>
                    </div>

                    <button className="w-full h-16 rounded-[28px] border-2 border-dashed border-primary-500/40 text-primary-500 font-black flex items-center justify-center gap-3 hover:bg-primary-500/5 hover:border-primary-500/60 transition-all text-lg tracking-wide group">
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span>أكتب تقييماً للمكان</span>
                    </button>
                </section>

                {/* ── 6. Related Places ─────────────────────────────────────── */}
                {relatedPlaces.length > 0 && (
                    <section className="border-t border-border-subtle pt-12">
                        <h3 className="text-xl font-black text-text-primary mb-10">أماكن قد تعجبك أيضاً</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPlaces.map((relatedPlace, idx) => (
                                <PlaceCard key={relatedPlace.id} place={relatedPlace} index={idx} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ── Lightbox Component ─────────────────────────────────────── */}
            <Lightbox
                images={galleryImages}
                index={activeImageIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />
        </div>
    );
}
