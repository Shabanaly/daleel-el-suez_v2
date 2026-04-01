'use client';

import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { Place } from '@/lib/types/places';
import { incrementPlaceCall, incrementPlaceWhatsapp, incrementPlaceDirections } from '@/lib/actions/places';

interface StickyActionsBarProps {
    place: Place;
}

export function StickyActionsBar({ place }: StickyActionsBarProps) {
    const phoneNumber = typeof place.phoneNumber === 'object' ? place.phoneNumber.primary : place.phoneNumber;
    const whatsappNumber = typeof place.phoneNumber === 'object' ? place.phoneNumber.whatsapp : null;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || place.area) + ' Suez')}`;

    const handleCall = () => {
        incrementPlaceCall(place.id);
    };

    const handleWhatsapp = () => {
        incrementPlaceWhatsapp(place.id);
    };

    const handleDirections = () => {
        incrementPlaceDirections(place.id);
    };

    return (
        <div className="fixed bottom-4 left-0 right-0 z-100 px-4 pointer-events-none">
            <div className="max-w-lg mx-auto h-16 rounded-2xl bg-background/80 dark:bg-card/90 backdrop-blur-xl border border-border-subtle/50 shadow-2xl shadow-black/20 flex items-center gap-2 p-2 pointer-events-auto">
                <a
                    href={`tel:${phoneNumber}`}
                    onClick={handleCall}
                    className="flex-1 h-full rounded-xl bg-primary text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                >
                    <Phone className="w-4 h-4" />
                    <span>اتصال</span>
                </a>

                {whatsappNumber && (
                    <a
                        href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWhatsapp}
                        className="flex-1 h-full rounded-xl bg-green-500 text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                    >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>واتساب</span>
                    </a>
                )}

                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDirections}
                    className="flex-1 h-full rounded-xl bg-accent text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                >
                    <MapPin className="w-4 h-4" />
                    <span>الخريطة</span>
                </a>
            </div>
        </div>
    );
}
