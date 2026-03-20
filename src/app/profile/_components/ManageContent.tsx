'use client';

import { useState } from 'react';
import { ManagePlaceCard } from './ManagePlaceCard';
import { ReviewReplyModal } from './ReviewReplyModal';
import { LayoutDashboard, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Place } from '@/lib/types/places';

interface ManageContentProps {
    places: Place[];
    reviews: any[];
}

export function ManageContent({ places, reviews }: ManageContentProps) {
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const handleReplyClick = (place: Place) => {
        setSelectedPlace(place);
        setIsReplyModalOpen(true);
    };

    const handleEditClick = (place: Place) => {
        // Typically would redirect to an edit page or open an edit modal
        window.location.href = `/places/edit/${place.id}`;
    };

    const getReviewsForPlace = (placeId: string) => {
        return reviews.filter(r => r.place_id === placeId);
    };

    return (
        <>
            {places.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {places.map((place) => (
                        <ManagePlaceCard 
                            key={place.id} 
                            place={place} 
                            onEdit={handleEditClick}
                            onReply={handleReplyClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface border border-border-subtle rounded-[2.5rem]">
                    <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutDashboard className="w-8 h-8 text-text-muted/30" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">ليس لديك أنشطة تديرها بعد</h3>
                    <p className="text-sm text-text-muted mt-2 mb-8 max-w-sm mx-auto">
                        هل تمتلك محلاً أو تقدم خدمة في السويس؟ أضف نشاطك الآن للتواصل مع آلاف الزبائن في الدليل.
                    </p>
                    <Link 
                        href="/places/add"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        أضف نشاطك الآن
                    </Link>
                </div>
            )}

            {selectedPlace && (
                <ReviewReplyModal 
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    reviews={getReviewsForPlace(selectedPlace.id)}
                    placeName={selectedPlace.name}
                />
            )}
        </>
    );
}
