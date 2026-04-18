'use client';

import { useState, useEffect } from 'react';
import CustomLink from '@/components/customLink/customLink';
import ShareButton from '@/components/ui/ShareButton';
import AdSlot from '@/components/common/AdSlot';
import { Banner320x50 } from '@/components/common/ThirdPartyAds';
import { useDialog } from "@/components/providers/DialogProvider";
import { Share2, MapPin, Star, ChevronLeft, ChevronRight, CheckCircle2, Eye } from 'lucide-react';
import { Review } from '@/features/places/types/reviews';
import { Place } from '@/features/places/types';
import { PlaceCard } from './PlaceCard';
import { Lightbox } from '@/components/common/Lightbox';
import { ImageGallery } from '@/components/common/ImageGallery';
import { PlaceInfoTabs } from './PlaceInfoTabs';
import { StickyActionsBar } from './StickyActionsBar';
import { ReviewsSection } from './reviews/ReviewsSection';
import { getPlaceViews } from '@/features/places/actions/places.server';
import NAPDisplay from '@/components/common/NAPDisplay';


import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AppBar } from '@/components/ui/AppBar';
import { ROUTES, ROUTE_HELPERS } from '@/constants';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PlaceFactSheet from './PlaceFactSheet';
interface PlaceDetailsClientProps {
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
                backHref={place.category ? ROUTE_HELPERS.PLACES_CATEGORY(place.category) : ROUTES.PLACES}
                actions={
                    <ShareButton
                        title={place.name}
                        text={`المكان ده في السويس: ${place.name}`}
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

                {/* ── Breadcrumbs (Visible on all devices + JSON-LD) ──────────── */}
                <Breadcrumbs 
                    items={[
                        { label: 'أماكن', href: ROUTES.PLACES },
                        { 
                            label: place.category || 'تصنيف', 
                            href: place.category ? ROUTE_HELPERS.PLACES_CATEGORY(place.category) : undefined 
                        },
                        { label: place.name }
                    ]} 
                    className="mb-8"
                />

                {/* ── 1. Image Gallery (Full width on mobile) ────────────────────────── */}
                <div className="-mx-4 md:mx-0 mb-8 md:mb-12">
                    <ImageGallery
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

                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Favorite Button (Left side in RTL) */}
                            <FavoriteButton
                                itemId={place.id}
                                itemType="place"
                                initialIsFavorite={isFavorite}
                                size="lg"
                            />

                            <NAPDisplay 
                                name={place.name} 
                                address={place.address}
                                area={place.area}
                                phone={place.phoneNumber?.primary}
                                className="text-right flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-text-muted font-bold mb-6 justify-start bg-surface p-2 rounded-xl">
                        <span className="text-primary font-black">{place.category}</span>
                    </div>

                    <p className="text-text-muted text-lg leading-relaxed max-w-2xl font-medium opacity-90 mx-0 mb-8">
                        {place.description || 'اكتشف أفضل الخدمات والمنتجات المتاحة في مدينة السويس بأسعار تنافسية وجودة عالية.'}
                    </p>

                    {/* 🤖 AI Knowledge Layer: Fact Sheet */}
                    <PlaceFactSheet place={place} className="mb-8" />
                </section>

                <AdSlot device="mobile" className="w-full mb-8">
                    <Banner320x50 containerId="ad-place-details-mobile" />
                </AdSlot>

                {/* ── 3. Primary Actions (Share only, others moved to sticky bar) ── */}
                <div className="hidden md:flex justify-end mb-10">

                    <ShareButton
                        title={place.name}
                        text={`المكان ده في السويس: ${place.name}`}
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
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />

            <StickyActionsBar place={place} />
        </div >
    );
}
