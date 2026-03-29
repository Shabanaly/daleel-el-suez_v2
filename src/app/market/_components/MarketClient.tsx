"use client";

import { useState, useEffect, useRef } from "react";
import { getMarketAds } from "@/lib/actions/market";
import { MarketAd, MarketCategory } from "@/lib/types/market";
import { createClient } from "@/lib/supabase/client";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { useRouter } from "next/navigation";
import { Suggestion } from "@/components/common/SearchAutocomplete";

// New Components
import MarketHero from "./MarketHero";
import MarketSearchHeader from "./MarketSearchHeader";
import MarketCategories from "./MarketCategories";
import MarketHighlights from "./MarketHighlights";
import MarketResults from "./MarketResults";

interface MarketClientProps {
    initialCategories: MarketCategory[];
    initialAds: MarketAd[];
    initialTotal: number;
    initialQuery?: string;
    initialCategory?: string;
    trendingAds?: MarketAd[];
    latestAds?: MarketAd[];
    excludeIds?: string[];
}

export function MarketClient({ 
    initialCategories = [],
    initialAds = [],
    initialTotal = 0,
    initialQuery = "",
    trendingAds = [],
    latestAds = [],
    excludeIds = []
}: MarketClientProps) {
    const router = useRouter();
    
    // Core State
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [ads, setAds] = useState<MarketAd[]>(initialAds);
    const [totalAds, setTotalAds] = useState(initialTotal);
    const [loading, setLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Use ref to track the last synced parameters to prevent loops
    const lastSyncKey = useRef(initialQuery);

    const filteredCategories = initialCategories.filter((c: MarketCategory) => c.adCount > 0);

    // Sync State with URL logic (Live Search)
    useEffect(() => {
        const currentSyncKey = searchQuery;
        
        const timer = setTimeout(async () => {
            if (lastSyncKey.current === currentSyncKey) return;
            
            setLoading(true);
            try {
                // Pass excludeIds only if not searching
                const result = await getMarketAds(1, undefined, searchQuery, 20, searchQuery ? [] : excludeIds);
                setAds(result.ads);
                setTotalAds(result.total);
                
                const params = new URLSearchParams();
                if (searchQuery) params.set('q', searchQuery);
                
                const newQueryString = params.toString();
                const currentQueryString = new URLSearchParams(window.location.search).toString();

                if (newQueryString !== currentQueryString) {
                    router.replace(`/market?${newQueryString}`, { scroll: false });
                }

                lastSyncKey.current = currentSyncKey;
            } catch (error) {
                console.error("Failed to fetch ads:", error);
            } finally {
                setLoading(false);
            }
        }, searchQuery ? 500 : 50);

        return () => clearTimeout(timer);
    }, [searchQuery, router, excludeIds]);

    const handleCreateAdClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default button behavior
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
            router.push(`/market/category/${encodeURIComponent(s.slug)}`);
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSuggestionSelect={handleSuggestionSelect}
                handleCreateAdClick={handleCreateAdClick}
            />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* 3. Categories Section (Immediately below header) */}
                <MarketCategories categories={filteredCategories} />

                {/* 4. Highlights Sections (Only when not searching) */}
                {!searchQuery && (
                    <MarketHighlights 
                        trendingAds={trendingAds}
                        latestAds={latestAds}
                    />
                )}

                {/* 5. Results Section */}
                <MarketResults 
                    searchQuery={searchQuery}
                    totalAds={totalAds}
                    loading={loading}
                    ads={ads}
                />
            </main>
        </div>
    );
}
