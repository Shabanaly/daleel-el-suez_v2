import { useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Place, SortOption } from '../lib/types/places';
import { AreaWithDistrict } from '../lib/actions/areas';
export function usePlacesFilter(
    initialPlaces: Place[],
    initialTotal: number,
    categories: string[],
    allAreas: AreaWithDistrict[],
    districts: any[]
) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local state for UI responsiveness
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || categories[0] || 'الكل');
    const [activeDistrict, setActiveDistrict] = useState(searchParams.get('district') || 'كل الأحياء');
    const [activeArea, setActiveArea] = useState(searchParams.get('area') || 'كل المناطق');
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'trending');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [showFilters, setShowFilters] = useState(!!searchParams.get('district') || !!searchParams.get('area'));

    // Current displayed places (initial or server-fetched)
    const [places, setPlaces] = useState<Place[]>(initialPlaces);
    const [total, setTotal] = useState(initialTotal);
    // Sync with Server-fetched data when URL changes and page.tsx re-renders
    useEffect(() => {
        setPlaces(initialPlaces);
        setTotal(initialTotal);
        // We also sync the page state with the URL here to handle "back" button etc.
        const urlPage = Number(searchParams.get('page')) || 1;
        setPage(urlPage);
    }, [initialPlaces, initialTotal, searchParams]);

    // Debounced Query State for URL and Filtering
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400); // 400ms debounce
        return () => clearTimeout(handler);
    }, [query]);

    // Derived: Areas belonging to the active district
    const availableAreas = useMemo(() => {
        if (activeDistrict === 'كل الأحياء') return allAreas;
        const districtObj = districts.find(d => d.name === activeDistrict);
        if (!districtObj) return [];
        return allAreas.filter(a => a.district_id === districtObj.id);
    }, [allAreas, districts, activeDistrict]);

    // Enhance Search: Sync with Server Data while allowing quick local filtering
    const filtered = useMemo(() => {
        // If there is an active search query, we trust the server-side Genius Results entirely
        // to avoid mismatch between server ranking/filtering and client fuzzy matching.
        if (debouncedQuery.trim()) {
            return places;
        }

        // Standard logic: if no search, server returns unfiltered or cat/area filtered list
        return places;
    }, [places, debouncedQuery]);

    // Reset page to 1 whenever any filter changes (except page itself)
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, activeCategory, activeDistrict, activeArea, sortBy]);

    // Handle initial routing with debounced query
    useEffect(() => {
        const params = new URLSearchParams(); // Fresh params based on current state

        if (debouncedQuery) params.set('q', debouncedQuery);
        if (activeCategory !== 'الكل') params.set('category', activeCategory);
        if (activeDistrict !== 'كل الأحياء') params.set('district', activeDistrict);
        if (activeArea !== 'كل المناطق') params.set('area', activeArea);
        if (sortBy !== 'trending') params.set('sort', sortBy);
        if (page > 1) params.set('page', page.toString());

        const nextQuery = params.toString();
        const currentQuery = searchParams.toString();

        if (nextQuery !== currentQuery) {
            startTransition(() => {
                router.push(`${pathname}?${nextQuery}`, { scroll: false });
            });
        }
    }, [debouncedQuery, activeCategory, activeDistrict, activeArea, sortBy, page, pathname, router, searchParams]);

    const hasActiveFilters = activeCategory !== 'الكل' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق' || debouncedQuery !== '';

    const clearFilters = () => {
        setActiveCategory('الكل');
        setActiveDistrict('كل الأحياء');
        setActiveArea('كل المناطق');
        setQuery('');
        setPage(1);
    };

    return {
        query, setQuery,
        activeCategory, setActiveCategory,
        activeDistrict, setActiveDistrict,
        activeArea, setActiveArea,
        sortBy, setSortBy,
        page, setPage,
        showFilters, setShowFilters,
        availableAreas,
        filtered,
        hasActiveFilters,
        clearFilters,
        isPending,
        // Expose total for pagination
        total,
        // Expose debounced query for highlight functionality if needed
        debouncedQuery
    };
}
