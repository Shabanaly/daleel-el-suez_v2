import { useState, useMemo, useEffect, useTransition, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MarketAd, MarketCategory } from '../lib/types/market';
import { AreaWithDistrict } from '../lib/actions/areas';

export type MarketSortOption = 'newest' | 'cheapest' | 'expensive' | 'trending';

export function useMarketFilter(
    initialAds: MarketAd[],
    initialTotal: number,
    categories: MarketCategory[],
    allAreas: AreaWithDistrict[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    districts: any[]
) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local state for UI responsiveness
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [activeDistrict, setActiveDistrict] = useState(searchParams.get('district') || 'كل الأحياء');
    const [activeArea, setActiveArea] = useState(searchParams.get('area') || 'كل المناطق');
    const [sortBy, setSortBy] = useState<MarketSortOption>((searchParams.get('sort') as MarketSortOption) || 'newest');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [showFilters, setShowFilters] = useState(false);

    // Current displayed ads (initial or server-fetched)
    const [ads, setAds] = useState<MarketAd[]>(initialAds);
    const [total, setTotal] = useState(initialTotal);

    // Sync with Server-fetched data when URL changes and page.tsx re-renders
    useEffect(() => {
        setAds(initialAds);
        setTotal(initialTotal);
        const urlPage = Number(searchParams.get('page')) || 1;
        setPage(urlPage);
        
        // Also sync filter states when URL changes (e.g. browser back button)
        setQuery(searchParams.get('q') || '');
        setActiveCategory(searchParams.get('category') || 'all');
        setActiveDistrict(searchParams.get('district') || 'كل الأحياء');
        setActiveArea(searchParams.get('area') || 'كل المناطق');
        setSortBy((searchParams.get('sort') as MarketSortOption) || 'newest');
    }, [initialAds, initialTotal, searchParams, categories]);

    // Derived: Areas belonging to a specific district (helper for modal)
    const getAvailableAreasForDistrict = useCallback((districtName: string) => {
        if (districtName === 'كل الأحياء') return allAreas;
        const districtObj = districts.find(d => d.name === districtName);
        if (!districtObj) return [];
        return allAreas.filter(a => a.district_id === districtObj.id);
    }, [allAreas, districts]);

    const availableAreas = useMemo(() => getAvailableAreasForDistrict(activeDistrict), 
        [getAvailableAreasForDistrict, activeDistrict]);

    // Centralized URL update function
    const updateURL = useCallback((updates: Partial<{
        q: string,
        category: string,
        district: string,
        area: string,
        sort: string,
        page: number
    }>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Apply updates
        if (updates.q !== undefined) {
            if (updates.q) params.set('q', updates.q);
            else params.delete('q');
        }
        if (updates.category !== undefined) {
            if (updates.category !== 'all') params.set('category', updates.category);
            else params.delete('category');
        }
        if (updates.district !== undefined) {
            if (updates.district !== 'كل الأحياء') params.set('district', updates.district);
            else params.delete('district');
        }
        if (updates.area !== undefined) {
            if (updates.area !== 'كل المناطق') params.set('area', updates.area);
            else params.delete('area');
        }
        if (updates.sort !== undefined) {
            if (updates.sort !== 'newest') params.set('sort', updates.sort);
            else params.delete('sort');
        }
        
        // Handle pagination reset if filters changed
        const filtersChanged = updates.q !== undefined || updates.category !== undefined || 
                               updates.district !== undefined || updates.area !== undefined || 
                               updates.sort !== undefined;
        
        if (filtersChanged && updates.page === undefined) {
            params.delete('page');
        } else if (updates.page !== undefined) {
            if (updates.page > 1) params.set('page', updates.page.toString());
            else params.delete('page');
        }

        const nextQuery = params.toString();
        const currentQuery = searchParams.toString();

        if (nextQuery !== currentQuery) {
            startTransition(() => {
                router.push(`${pathname}?${nextQuery}`, { scroll: false });
            });
        }
    }, [pathname, router, searchParams]);

    // Immediate actions
    const handleCategoryChange = (categorySlug: string) => {
        setActiveCategory(categorySlug);
        updateURL({ category: categorySlug, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateURL({ page: newPage });
    };

    const handleSearch = (searchTerm: string) => {
        setQuery(searchTerm);
        updateURL({ q: searchTerm, page: 1 });
    };

    // Staged actions (for Modal)
    const applyFilters = (filters: {
        district: string,
        area: string,
        sort: MarketSortOption
    }) => {
        setActiveDistrict(filters.district);
        setActiveArea(filters.area);
        setSortBy(filters.sort);
        updateURL({
            district: filters.district,
            area: filters.area,
            sort: filters.sort,
            page: 1
        });
        setShowFilters(false);
    };

    const clearFilters = () => {
        setQuery('');
        setActiveCategory('all');
        setActiveDistrict('كل الأحياء');
        setActiveArea('كل المناطق');
        setSortBy('newest');
        updateURL({
            q: '',
            category: 'all',
            district: 'كل الأحياء',
            area: 'كل المناطق',
            sort: 'newest',
            page: 1
        });
    };

    const hasActiveFilters = activeCategory !== 'all' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق' || query !== '';

    return {
        query, setQuery,
        activeCategory, setActiveCategory: handleCategoryChange,
        activeDistrict,
        activeArea,
        sortBy,
        page, setPage: handlePageChange,
        showFilters, setShowFilters,
        availableAreas,
        getAvailableAreasForDistrict,
        applyFilters,
        handleSearch,
        filtered: ads, // We trust server-side data
        hasActiveFilters,
        clearFilters,
        isPending,
        total,
        debouncedQuery: query // Renamed for compatibility, though searching is manual now
    };
}
