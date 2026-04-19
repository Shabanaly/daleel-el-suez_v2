'use client';

import { Place } from '@/features/places/types';
import { AppBar } from '@/components/ui/AppBar';
import { BusinessStats } from './dashboard/BusinessStats';
import { InlineEditForm } from './dashboard/InlineEditForm';
import { GalleryManager } from './dashboard/GalleryManager';
import { ReviewsManager } from './dashboard/ReviewsManager';

interface BusinessDashboardClientProps {
    place: Place;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: any[];
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
}

export function BusinessDashboardClient({ place, reviews, categories, areas }: BusinessDashboardClientProps) {
    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            <AppBar
                title={place.name}
                backHref="/manage"
            />

            <div className="max-w-5xl mx-auto px-4 md:px-12 pt-14 md:pt-24 space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-black text-text-primary mb-2">لوحة التحكم</h1>
                    <p className="text-sm text-text-muted font-bold">إدارة تفاصيل، صور، وتقييمات نشاطك التجاري</p>
                </div>

                {/* 1. Statistics */}
                <BusinessStats place={place} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

                    {/* Main Content (Right on LTR, Left on RTL - 7/12 wide) */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                        {/* 2. Inline Editing Form */}
                        <div className="bg-surface rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
                            <h2 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">📝</span>
                                البيانات الأساسية
                            </h2>
                            <InlineEditForm place={place} categories={categories} areas={areas} />
                        </div>

                        {/* 3. Reviews Manager */}
                        <div className="bg-surface rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
                            <h2 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">💬</span>
                                التقييمات والمراجعات
                            </h2>
                            <ReviewsManager place={place} reviews={reviews} />
                        </div>
                    </div>

                    {/* Sidebar (Left on LTR, Right on RTL - 5/12 wide) */}
                    <div className="lg:col-span-5 space-y-8 lg:order-2">
                        {/* 4. Gallery Manager */}
                        <div className="bg-surface rounded-3xl p-6 border border-border-subtle shadow-sm h-fit">
                            <h2 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">🖼️</span>
                                معرض الصور
                            </h2>
                            <GalleryManager place={place} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
