'use client';

import { Edit3, MessageSquare, ExternalLink, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Place } from '@/lib/types/places';

interface ManagePlaceCardProps {
    place: Place;
    onEdit: (place: Place) => void;
    onReply: (place: Place) => void;
}

export function ManagePlaceCard({ place, onEdit, onReply }: ManagePlaceCardProps) {
    return (
        <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-40 shrink-0 overflow-hidden bg-background">
                    {place.imageUrl ? (
                        <Image 
                            src={place.imageUrl} 
                            alt={place.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted/20">
                            <MapPin className="w-12 h-12" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black text-white">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        {place.rating || 0}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-black text-text-primary group-hover:text-primary transition-colors">
                                    {place.name}
                                </h3>
                                <p className="text-xs text-text-muted font-bold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {place.area || 'السويس'}
                                </p>
                            </div>
                            <Link 
                                href={`/places/${place.slug}`}
                                className="w-8 h-8 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                                title="عرض الصفحة العامة"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                        <p className="text-sm text-text-muted line-clamp-2 font-medium mb-4">
                            {place.description || 'لا يوجد وصف لهذا المكان.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onEdit(place)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Edit3 className="w-4 h-4" />
                            تعديل البيانات
                        </button>
                        <button 
                            onClick={() => onReply(place)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-surface border-2 border-primary/20 text-primary text-sm font-black hover:bg-primary/5 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            الرد على التقييمات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
