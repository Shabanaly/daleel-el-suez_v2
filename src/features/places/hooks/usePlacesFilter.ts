/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import { useState, useMemo, useEffect, useTransition, useCallback, useDeferredValue } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Place, SortOption } from '@/features/places/types';
import { AreaWithDistrict } from '@/features/taxonomy/actions/areas';

export function usePlacesFilter(
    initialPlaces: Place[],
    initialTotal: number,
    categories: { name: string; count: number; slug: string }[],
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
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || categories[0]?.name || 'الكل');
    const [activeDistrict, setActiveDistrict] = useState(searchParams.get('district') || 'كل الأحياء');
    const [activeArea, setActiveArea] = useState(searchParams.get('area') || 'كل المناطق');
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'trending');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [showFilters, setShowFilters] = useState(false);
    const openFilters = useCallback(() => setShowFilters(true), []);
    const closeFilters = useCallback(() => setShowFilters(false), []);

    // Pattern: Adjusting state during render (replaces useEffect sync to avoid cascading renders)
    const [prevSearchParams, setPrevSearchParams] = useState(searchParams.toString());
    const currentSearchParamsStr = searchParams.toString();

    if (currentSearchParamsStr !== prevSearchParams) {
        const urlPage = Number(searchParams.get('page')) || 1;
        if (page !== urlPage) setPage(urlPage);

        const urlCat = searchParams.get('category') || categories[0]?.name || 'الكل';
        if (activeCategory !== urlCat) setActiveCategory(urlCat);

        const urlDistrict = searchParams.get('district') || 'كل الأحياء';
        if (activeDistrict !== urlDistrict) setActiveDistrict(urlDistrict);

        const urlArea = searchParams.get('area') || 'كل المناطق';
        if (activeArea !== urlArea) setActiveArea(urlArea);

        const urlSort = (searchParams.get('sort') as SortOption) || 'trending';
        if (sortBy !== urlSort) setSortBy(urlSort);
        
        setPrevSearchParams(currentSearchParamsStr);
    }

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
            if (updates.category !== 'الكل') params.set('category', updates.category);
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
            if (updates.sort !== 'trending') params.set('sort', updates.sort);
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
    const handleCategoryChange = useCallback((category: string) => {
        setActiveCategory(category);
        updateURL({ category, page: 1 });
    }, [updateURL]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        updateURL({ page: newPage });
    }, [updateURL]);

    const handleSearch = useCallback((searchTerm: string) => {
        setQuery(searchTerm);
        updateURL({ q: searchTerm, page: 1 });
    }, [updateURL]);

    // Staged actions (for Modal)
    const applyFilters = useCallback((filters: {
        district: string,
        area: string,
        sort: SortOption
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
    }, [updateURL]);

    const clearFilters = useCallback(() => {
        setQuery('');
        setActiveCategory('الكل');
        setActiveDistrict('كل الأحياء');
        setActiveArea('كل المناطق');
        setSortBy('trending');
        updateURL({
            q: '',
            category: 'الكل',
            district: 'كل الأحياء',
            area: 'كل المناطق',
            sort: 'trending',
            page: 1
        });
    }, [updateURL]);

    // Defer the query for performance matching react 18 rendering
    const deferredQuery = useDeferredValue(query);

    const hasActiveFilters = activeCategory !== 'الكل' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق' || deferredQuery !== '';

    return {
        query, setQuery,
        activeCategory, setActiveCategory: handleCategoryChange,
        activeDistrict,
        activeArea,
        sortBy,
        page, setPage: handlePageChange,
        showFilters, openFilters, closeFilters,
        availableAreas,
        getAvailableAreasForDistrict,
        applyFilters,
        handleSearch,
        clearFilters,
        hasActiveFilters,
        isPending,
        filtered: initialPlaces, // Use server-provided places directly
        total: initialTotal,
        debouncedQuery: deferredQuery // Using deferredValue for UI responsiveness
    };
}
