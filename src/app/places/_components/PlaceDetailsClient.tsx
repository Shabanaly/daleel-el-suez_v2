'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ShareButton from '@/components/ui/ShareButton';
import { useDialog } from "@/components/providers/DialogProvider";
import { Share2, MapPin, Star, ChevronLeft, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { Review } from '@/lib/types/reviews';
import { Place } from '@/lib/types/places';
import { PlaceCard } from './PlaceCard';
import { Lightbox } from './Lightbox';
import { PlaceGallery } from './PlaceGallery';
import { PlaceInfoTabs } from './PlaceInfoTabs';
import { StickyActionsBar } from './StickyActionsBar';
import { ReviewsSection } from './reviews/ReviewsSection';
import { getPlaceViews } from '@/lib/actions/places';


import { FavoriteButton } from '@/components/common/FavoriteButton';
import { AppBar } from '@/components/ui/AppBar';interface PlaceDetailsClientProps {
    place: Place;
    relatedPlaces: Place[];
    initialReviews?: Review[];
    isFavorite?: boolean;
}

export function PlaceDetailsClient({
    place,
    relatedPlaces,
    initialReviews,
    isFavorite = false
}: PlaceDetailsClientProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [views, setViews] = useState(place.viewsCount);

    useEffect(() => {
        const fetchCurrentViews = async () => {
            try {
                // Fetch fresh views after a small delay to allow ViewTracker to finish
                setTimeout(async () => {
                    const freshViews = await getPlaceViews(place.id);
                    if (freshViews > 0) setViews(freshViews);
                }, 1500);
            } catch (error) {
                console.error('Error fetching real-time views:', error);
            }
        };
        fetchCurrentViews();
    }, [place.id]);

    // Use multiple images if available, otherwise fallback to imageUrl
    const galleryImages = place.images && place.images.length > 0
        ? place.images
        : [place.imageUrl].filter(Boolean) as string[];

    const { showAlert } = useDialog();


    const handleImageClick = (index: number) => {
        setActiveImageIndex(index);
        setIsLightboxOpen(true);
    };

    // removed unused googleMapsUrl

    return (
        <div className="w-full min-h-screen bg-background pb-24 md:pb-32 text-right" dir="rtl">
            {/* ── Top Navigation Bar (Mobile Only) ────────────────────────── */}
            <AppBar 
                title={place.name}
                transparent={false}
                backHref={place.categorySlug ? `/categories/${place.categorySlug}` : "/places"}
                actions={
                    <ShareButton
                        title={place.name}
                        text={`شوف المكان ده في السويس: ${place.name}`}
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated transition-colors"
                        onSuccess={() => showAlert({
                            title: 'تم النسخ!',
                            message: 'تم نسخ رابط المكان بنجاح! ✨',
                            type: 'success'
                        })}
                    >
                        <Share2 className="w-5 h-5" />
                    </ShareButton>
                }
            />

            <main className="pt-14 md:pt-32 max-w-4xl mx-auto px-4">

                {/* ── Desktop Breadcrumbs ───────────────────────────────────── */}
                <nav className="hidden md:flex items-center gap-2 mb-10 text-sm font-bold">
                    <Link href="/" className="text-text-muted hover:text-primary transition-colors">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30 rotate-180" />
                    <Link href="/places" className="text-text-muted hover:text-primary transition-colors">أماكن</Link>
                    <ChevronLeft className="w-4 h-4 text-text-muted/30 rotate-180" />
                    {place.categorySlug ? (
                        <Link href={`/categories/${place.categorySlug}`} className="text-text-muted hover:text-primary transition-colors">
                            {place.category}
                        </Link>
                    ) : (
                        <span className="text-text-muted/50">{place.category}</span>
                    )}
                    <ChevronLeft className="w-4 h-4 text-text-muted/30 rotate-180" />
                    <span className="text-primary">{place.name}</span>
                </nav>

                {/* ── 1. Image Gallery (Full width on mobile) ────────────────────────── */}
                <div className="-mx-4 md:mx-0 mb-8 md:mb-12">
                    <PlaceGallery
                        images={galleryImages}
                        placeName={place.name}
                        onImageClick={handleImageClick}
                    />
                </div>

                {/* ── 2. Header Info ────────────────────────────────────────── */}
                <section className="mb-8 relative">
                    <div className="flex items-center gap-3 mb-4 justify-end">
                        {place.isVerified && (
                            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-[10px] font-black border border-accent/20">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>موثوق</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full text-[10px] font-black border border-border-subtle/50 text-text-muted">
                            <Eye className="w-3 h-3" />
                            <span>{views} مشاهدة</span>
                        </div>
                        <span className="text-text-muted text-[10px] font-black opacity-30">•</span>
                        <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full text-[10px] font-black border border-border-subtle/50 text-text-muted">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{place.rating}</span>
                            <span className="opacity-30">({place.reviews})</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-4">
                        {/* Favorite Button (Left side in RTL) */}
                        <FavoriteButton
                            itemId={place.id}
                            itemType="place"
                            initialIsFavorite={isFavorite}
                            size="lg"
                        />

                        <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight text-right flex-1">
                            {place.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-text-muted font-bold mb-6 justify-start bg-surface p-2 rounded-xl">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {place.area}، السويس
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="text-primary font-black">{place.category}</span>
                    </div>

                    <p className="text-text-muted text-lg leading-relaxed max-w-2xl font-medium opacity-90 mx-0">
                        {place.description || 'اكتشف أفضل الخدمات والمنتجات المتاحة في مدينة السويس بأسعار تنافسية وجودة عالية.'}
                    </p>
                </section>

                {/* ── 3. Primary Actions (Share only, others moved to sticky bar) ── */}
                <div className="hidden md:flex justify-end mb-10">

                    <ShareButton
                        title={place.name}
                        text={`شوف المكان ده في السويس: ${place.name}`}
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        className="w-full md:w-auto px-8 h-16 rounded-[28px] bg-surface border border-border-subtle text-text-muted flex items-center justify-center gap-3 hover:bg-elevated transition-all shadow-lg group"
                        onSuccess={() => showAlert({
                            title: 'تم النسخ!',
                            message: 'تم نسخ رابط المكان بنجاح! ✨',
                            type: 'success'
                        })}
                    >
                        <Share2 className="w-6 h-6 transition-transform group-hover:scale-110 " />
                        <span className="font-black text-lg">مشاركة المكان</span>
                    </ShareButton>
                </div>

                {/* ── 4. Tabs & Information (Modularized) ────────────────────── */}
                <PlaceInfoTabs place={place} />

                {/* ── 5. User Reviews ────────────────────────────────────────── */}
                <ReviewsSection
                    placeId={place.id}
                    initialReviewsCount={place.reviews || 0}
                    initialReviews={initialReviews}
                />

                {/* ── 6. Related Places ─────────────────────────────────────── */}
                {relatedPlaces.length > 0 && (
                    <section className="border-t border-border-subtle pt-12">
                        <h3 className="text-xl font-black text-text-primary mb-10 text-right">أماكن قد تعجبك أيضاً</h3>

                        <div className="flex sm:grid flex-nowrap overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 hide-scrollbar pb-6">
                            {relatedPlaces.map((relatedPlace, idx) => (
                                <PlaceCard
                                    key={relatedPlace.id}
                                    place={relatedPlace}
                                    index={idx}
                                    className="min-w-[70%] sm:min-w-0 snap-center"
                                />
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

            <StickyActionsBar place={place} />
        </div >
    );
}
