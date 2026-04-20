import React from 'react';

const SkeletonBase = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-surface/50 rounded-2xl border border-border/10 ${className}`} />
);

export const PlaceCardSkeleton = () => (
  <div className="min-w-[280px] md:min-w-0 flex-1 space-y-4">
    <SkeletonBase className="aspect-video w-full rounded-3xl" />
    <div className="space-y-2">
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-3 w-1/2" />
    </div>
  </div>
);

export const SectionSkeleton = ({ cards = 3 }: { cards?: number }) => (
  <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-32" />
        <SkeletonBase className="h-4 w-48" />
      </div>
      <SkeletonBase className="h-10 w-24 rounded-full" />
    </div>
    <div className="flex overflow-x-auto hide-scrollbar gap-6 md:grid md:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

export const MarketSectionSkeleton = () => (
  <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
    <SkeletonBase className="h-8 w-40 mb-8" />
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBase key={i} className="aspect-square w-full rounded-3xl" />
      ))}
    </div>
  </section>
);

export const StatsSkeleton = () => (
  <section className="w-full max-w-7xl mx-auto px-4 py-16">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-4">
          <SkeletonBase className="w-14 h-14 rounded-2xl" />
          <SkeletonBase className="h-10 w-24" />
          <SkeletonBase className="h-4 w-32" />
        </div>
      ))}
    </div>
  </section>
);

export const DistrictsSkeleton = () => (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
        <SkeletonBase className="h-8 w-48 mb-8 mx-auto" />
        <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonBase key={i} className="h-12 w-32 rounded-full" />
            ))}
        </div>
    </section>
);
