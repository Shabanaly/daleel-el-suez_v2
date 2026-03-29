"use client";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import SearchAutocomplete, { Suggestion } from "@/components/common/SearchAutocomplete";

interface MarketSearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    handleSuggestionSelect: (s: Suggestion) => void;
    handleCreateAdClick: (e: React.MouseEvent) => void;
}

export default function MarketSearchHeader({
    searchQuery,
    setSearchQuery,
    handleSuggestionSelect,
    handleCreateAdClick
}: MarketSearchHeaderProps) {
    return (
        <header className="sticky top-14 lg:top-16 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle py-4">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3 md:gap-6">
               {/* Search Area */}
               <div className="flex-1 relative group h-14 md:h-18">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-text-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <SearchAutocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={setSearchQuery}
                        onSuggestionSelect={handleSuggestionSelect}
                        apiEndpoint="/api/autocomplete?type=market"
                        placeholder="بتدور على إيه النهاردة؟"
                        inputClassName="w-full h-full pr-14 pl-6 bg-surface/90 dark:bg-elevated/90 backdrop-blur-2xl border-2 border-border-subtle/60 rounded-2xl md:rounded-3xl text-base md:text-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-muted/50 shadow-xl shadow-black/5 dark:shadow-primary/10"
                    />
               </div>

               {/* Add Ad Button */}
               <button 
                    type="button"
                    onClick={handleCreateAdClick}
                    className="bg-primary hover:bg-primary-hover text-white px-5 md:px-10 h-14 md:h-18 rounded-2xl md:rounded-3xl flex items-center gap-2 text-sm md:text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                    <span className="hidden sm:inline">أضف إعلانك</span>
                    <span className="sm:hidden">أضف</span>
                </button>
            </div>
        </header>
    );
}
