"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { Fragment, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlacesSearchHeader } from "./PlacesSearchHeader";
import { Place } from "@/features/places/types";
import { usePlacesFilter } from "../hooks/usePlacesFilter";
import { PlaceCard } from "./PlaceCard";
import { Pagination } from "@/components/common/Pagination";
import { PlacesFilterModal } from "./PlacesFilterModal";
import AdSlot from "@/components/common/AdSlot";
import { Banner320x50, Banner468x60, Banner728x90, Rectangle300x250 } from "@/components/common/ThirdPartyAds";

import { AreaWithDistrict } from "@/features/taxonomy/actions/areas";

interface PlacesClientProps {
  initialPlaces: Place[];
  totalCount: number;
  categories: { name: string; count: number; slug: string }[];
  areas: AreaWithDistrict[];
  districts: { id: number; name: string }[];
}

export function PlacesClient({
  initialPlaces,
  totalCount,
  categories,
  areas,
  districts,
}: PlacesClientProps) {
  // 🧠 Here we use our custom hook. All logic is encapsulated inside it!
  const {
    query,
    activeCategory,
    setActiveCategory,
    activeDistrict,
    activeArea,
    sortBy,
    page,
    setPage,
    showFilters,
    openFilters,
    closeFilters,
    applyFilters,
    handleSearch,
    getAvailableAreasForDistrict,
    filtered,
    hasActiveFilters,
    clearFilters,
    isPending,
    total,
  } = usePlacesFilter(initialPlaces, totalCount, categories, areas, districts);

  // 🌊 Intelligent Scroll: Scroll to top ONLY when new data has arrived and transition is finished
  useEffect(() => {
    if (!isPending) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPending, page]); // Triggers when transition ends or page state changes

  return (
    <div className="w-full min-h-screen pt-2 md:pt-6 pb-8">
      {/* ── Advanced Search Hub Header ───────────────────────────────── */}
      <div className="w-full max-w-5xl px-4 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 md:gap-6"
        >
          {/* Search & Filter toggle row */}
          {/* Search & Filter toggle row */}
          <PlacesSearchHeader
            initialQuery={query}
            onSearch={handleSearch}
            onOpenFilters={openFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Category Chips - Horizontal Scrollable */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none" />

            <div className="flex overflow-x-auto hide-scrollbar md:scroll-me-10 gap-2 pb-2 -mx-2 px-2 scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`shrink-0 px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 flex items-center gap-2 ${
                    activeCategory === cat.name
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-surface text-text-muted border-border-subtle hover:bg-elevated hover:text-text-primary hover:border-primary/30"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] md:text-xs font-black px-1.5 py-0.5 rounded-md transition-colors ${
                      activeCategory === cat.name
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Refined Filter Modal */}
        <PlacesFilterModal
          isOpen={showFilters}
          onClose={closeFilters}
          initialDistrict={activeDistrict}
          initialArea={activeArea}
          initialSort={sortBy}
          districts={districts}
          getAvailableAreas={getAvailableAreasForDistrict}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      </div>

      {/* ── Results Count ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-surface/80 border border-border-subtle shadow-sm rounded-2xl">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-primary font-black text-lg md:text-xl">
              {total}
            </span>
            <span className="text-text-secondary font-bold text-sm">مكان</span>
          </div>

          {(activeCategory !== "الكل" ||
            activeDistrict !== "كل الأحياء" ||
            activeArea !== "كل المناطق") && (
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-text-muted border-r-2 border-border-subtle pr-3 mr-1">
              {activeCategory !== "الكل" && <span>{activeCategory}</span>}
              {(activeDistrict !== "كل الأحياء" ||
                activeArea !== "كل المناطق") && (
                <span className="opacity-40">·</span>
              )}
              {activeDistrict !== "كل الأحياء" && <span>{activeDistrict}</span>}
              {activeArea !== "كل المناطق" && (
                <span>
                  <span className="mx-1">/</span>
                  {activeArea}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Places Grid ───────────────────────────────────────────────── */}
      <div className="max-w-5xl px-4 relative">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-base/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center h-[400px]"
            >
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
        <AdSlot device="desktop" className="w-full mb-2">
          <Banner728x90 containerId={`ad-places-list-desktop-top`} />
        </AdSlot>

        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <>
              <motion.div
                layout
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${isPending ? "opacity-50 grayscale-[0.2]" : ""} transition-all duration-500`}
              >
                {/* place card */}
                {filtered.map((place, idx) => (
                  <Fragment key={place.id}>
                    <PlaceCard place={place} index={idx} />

                    {/* 🎯 Strategic Ad Injection */}
                    
                    {/* Desktop Ad: Placed at index 2 (Position 3) and index 8 (Position 9) */}
                    {/* These perfectly fill the last cell of the 1st and 3rd rows in a 3-column grid */}
                    {(idx === 2 || idx === 8) && (
                      <div className="hidden lg:flex items-center justify-center p-5 rounded-[32px] border border-border-subtle/60 bg-surface/40 backdrop-blur-sm shadow-sm h-full min-h-[380px]">
                        <AdSlot device="desktop" showLabel={true}>
                          <Rectangle300x250 containerId={`ad-places-desktop-pos-${idx}`} />
                        </AdSlot>
                      </div>
                    )}

                    {/* Mobile/Tablet Ad: Placed after every 4 items (Index 3, 7, 11...) */}
                    {((idx + 1) % 4 === 0) && (
                      <div className="lg:hidden w-full p-4 rounded-[28px] border border-border-subtle/50 bg-surface/30 flex items-center justify-center">
                        <AdSlot device="mobile" showLabel={true}>
                          <Rectangle300x250 containerId={`ad-places-mobile-pos-${idx}`} />
                        </AdSlot>
                      </div>
                    )}
                  </Fragment>
                ))}
              </motion.div>

              {/* ── Pagination Controls ────────────────────────────────── */}
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / 20)}
                onPageChange={setPage}
                isPending={isPending}
              />
            </>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <span className="text-6xl mb-4">🔍</span>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                مفيش نتائج
              </h2>
              <p className="text-text-muted text-sm mb-6">
                جرب تغير الفلاتر أو ابحث بكلمة تانية
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-all text-sm font-medium"
              >
                مسح الفلاتر
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
