"use client";
import Link from "next/link";
import { Search, Plus, Filter } from "lucide-react";
import SearchAutocomplete, { Suggestion } from "@/components/common/SearchAutocomplete";

interface MarketSearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    handleSearch: (searchTerm: string) => void;
    handleSuggestionSelect: (s: Suggestion) => void;
    handleCreateAdClick: (e: React.MouseEvent) => void;
    setShowFilters: (show: boolean) => void;
    hasActiveFilters: boolean;
}

export default function MarketSearchHeader({
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleSuggestionSelect,
    handleCreateAdClick,
    setShowFilters,
    hasActiveFilters
}: MarketSearchHeaderProps) {
    return (
        <header className="sticky top-14 lg:top-16 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle py-4">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 md:gap-4">
                {/* Search Area */}
                <div className="flex-1 relative group h-14 md:h-18">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <SearchAutocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                        onSuggestionSelect={handleSuggestionSelect}
                        searchType="market"
                        apiEndpoint="/api/autocomplete?type=market"
                        placeholder="بتدور على إيه النهاردة؟"
                        inputClassName="w-full h-full pr-14 pl-6 bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl border-2 border-border-subtle/60 rounded-2xl md:rounded-3xl text-base md:text-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-muted/50 shadow-xl shadow-black/5 dark:shadow-primary/10"
                    />
                </div>

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(true)}
                    className={`relative h-14 md:h-18 w-14 md:w-18 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 shrink-0 shadow-lg flex items-center justify-center ${hasActiveFilters
                        ? 'bg-primary border-primary text-white shadow-primary/25'
                        : 'bg-surface/90 border-border-subtle/60 text-text-muted hover:border-primary/40 hover:text-text-primary'
                        }`}
                >
                    <Filter className="w-5 h-5 md:w-6 md:h-6" />
                    {hasActiveFilters && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full shadow-lg shadow-accent/50 animate-pulse border-2 border-white dark:border-surface" />
                    )}
                </button>

                {/* Add Ad Button - Hidden on mobile for more search space */}
                <button
                    type="button"
                    onClick={handleCreateAdClick}
                    className="hidden md:flex bg-primary hover:bg-primary-hover text-white px-8 h-18 rounded-3xl items-center gap-2 text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-6 h-6 shrink-0" />
                    <span>أضف إعلانك</span>
                </button>
            </div>
        </header>
    );
}
