"use client";

import { useState } from "react";
import { MarketAd, MarketCategory } from "@/lib/types/market";
import { createClient } from "@/lib/supabase/client";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { useRouter } from "next/navigation";
import { Suggestion } from "@/components/common/SearchAutocomplete";
import { useMarketFilter } from "@/hooks/useMarketFilter";
import { AreaWithDistrict } from "@/lib/actions/areas";

// New Components
import MarketHero from "./MarketHero";
import MarketSearchHeader from "./MarketSearchHeader";
import MarketCategories from "./MarketCategories";
import MarketHighlights from "./MarketHighlights";
import MarketResults from "./MarketResults";
import { MarketFilterModal } from "./MarketFilterModal";
import { Pagination } from "@/components/common/Pagination";

interface MarketClientProps {
    initialCategories: MarketCategory[];
    initialAds: MarketAd[];
    initialTotal: number;
    trendingAds?: MarketAd[];
    latestAds?: MarketAd[];
    excludeIds?: string[];
    districts: { id: number; name: string }[];
    areas: AreaWithDistrict[];
}

export function MarketClient({ 
    initialCategories = [],
    initialAds = [],
    initialTotal = 0,
    trendingAds = [],
    latestAds = [],
    districts = [],
    areas = []
}: MarketClientProps) {
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // 🧠 Here we use our custom hook. All logic is encapsulated inside it!
    const {
        query, setQuery,
        activeCategory, setActiveCategory,
        activeDistrict,
        activeArea,
        sortBy,
        page, setPage,
        showFilters, setShowFilters,
        applyFilters,
        handleSearch,
        getAvailableAreasForDistrict,
        filtered, hasActiveFilters, clearFilters,
        isPending,
        total
    } = useMarketFilter(initialAds, initialTotal, initialCategories, areas, districts);

    const filteredCategories = initialCategories.filter((c: MarketCategory) => c.adCount > 0);

    const handleCreateAdClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsAuthModalOpen(true);
        } else {
            router.push('/market/create');
        }
    };

    const handleSuggestionSelect = (s: Suggestion) => {
        const isCategory = initialCategories.find((c: MarketCategory) => c.slug === s.slug);
        if (isCategory) {
            setActiveCategory(isCategory.slug);
        } else {
            router.push(`/market/${s.slug}`);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-14 lg:pt-16 overflow-x-hidden text-right" dir="rtl">
            <AuthRequiredModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                title="سجل دخولك أولاً"
                description="يجب عليك تسجيل الدخول لتتمكن من إضافة إعلانات جديدة في سوق السويس."
            />

            {/* 1. Hero Section */}
            <MarketHero />

            {/* 2. Sticky Search Header */}
            <MarketSearchHeader 
                searchQuery={query}
                setSearchQuery={setQuery}
                handleSearch={handleSearch}
                handleSuggestionSelect={handleSuggestionSelect}
                handleCreateAdClick={handleCreateAdClick}
                setShowFilters={setShowFilters}
                hasActiveFilters={hasActiveFilters}
            />

            <main className="max-w-7xl mx-auto px-4 py-8 relative">
                {/* Refined Filter Modal */}
                <MarketFilterModal 
                    isOpen={showFilters}
                    onClose={() => setShowFilters(false)}
                    initialDistrict={activeDistrict}
                    initialArea={activeArea}
                    initialSort={sortBy}
                    districts={districts}
                    getAvailableAreas={getAvailableAreasForDistrict}
                    onApply={applyFilters}
                    onClear={clearFilters}
                />

                {/* 3. Categories Section */}
                <MarketCategories 
                    categories={filteredCategories} 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory} 
                />

                {/* 4. Highlights Sections (Only when not searching/filtering) */}
                {!hasActiveFilters && trendingAds.length > 0 && (
                    <MarketHighlights 
                        trendingAds={trendingAds}
                    />
                )}

                {/* 5. Results Section */}
                <div className={`${isPending ? 'opacity-60 pointer-events-none' : ''} transition-opacity duration-300`}>
                    <MarketResults 
                        searchQuery={query}
                        totalAds={total}
                        loading={isPending}
                        ads={filtered}
                    />
                </div>

                {/* 6. Pagination */}
                {filtered.length > 0 && Math.ceil(total / 20) > 1 && (
                    <div className="mt-12">
                        <Pagination 
                            currentPage={page}
                            totalPages={Math.ceil(total / 20)}
                            onPageChange={setPage}
                            isPending={isPending}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
