import { useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Place, SortOption } from '../lib/types/places';
import { AreaWithDistrict } from '../lib/actions/areas';
import { fuzzyMatchArabic } from '../lib/utils/text';

export function usePlacesFilter(
    initialPlaces: Place[],
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

    // Sync with Server-fetched data when URL changes and page.tsx re-renders
    useEffect(() => {
        setPlaces(initialPlaces);
    }, [initialPlaces]);

    // Debounced Query State for URL and Filtering
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
            // Reset page on new search
            if (query !== searchParams.get('q')) {
                setPage(1);
            }
        }, 400); // 400ms debounce
        return () => clearTimeout(handler);
    }, [query, searchParams]);

    // Derived: Areas belonging to the active district
    const availableAreas = useMemo(() => {
        if (activeDistrict === 'كل الأحياء') return allAreas;
        const districtObj = districts.find(d => d.name === activeDistrict);
        if (!districtObj) return [];
        return allAreas.filter(a => a.district_id === districtObj.id);
    }, [allAreas, districts, activeDistrict]);

    // Enhance Search with Arabic Normalization and Debounce
    const filtered = useMemo(() => {
        if (!debouncedQuery.trim()) return places;

        return places.filter(p => {
            // Search across multiple fields 
            const matchesName = fuzzyMatchArabic(p.name, debouncedQuery);
            const matchesCategory = fuzzyMatchArabic(p.category, debouncedQuery);
            const matchesAddress = p.address ? fuzzyMatchArabic(p.address, debouncedQuery) : false;
            // Extract area/district names from IDs using the allAreas and districts arrays
            const areaId = (p as any).area_id; // Cast to access area_id if it exists
            const areaObj = areaId ? allAreas.find(a => a.id === areaId) : null;
            const matchesArea = areaObj ? fuzzyMatchArabic(areaObj.name, debouncedQuery) : false;

            const districtObj = areaObj ? districts.find(d => d.id === areaObj.district_id) : null;
            const matchesDistrict = districtObj ? fuzzyMatchArabic(districtObj.name, debouncedQuery) : false;

            return matchesName || matchesCategory || matchesAddress || matchesArea || matchesDistrict;
        });
    }, [places, debouncedQuery, allAreas, districts]);

    // Handle initial routing with debounced query
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedQuery) params.set('q', debouncedQuery); else params.delete('q');
        if (activeCategory !== 'الكل') params.set('category', activeCategory); else params.delete('category');
        if (activeDistrict !== 'كل الأحياء') params.set('district', activeDistrict); else params.delete('district');
        if (activeArea !== 'كل المناطق') params.set('area', activeArea); else params.delete('area');
        if (sortBy !== 'trending') params.set('sort', sortBy); else params.delete('sort');
        if (page > 1) params.set('page', page.toString()); else params.delete('page');

        const newUrl = `${pathname}?${params.toString()}`;

        if (newUrl !== `${pathname}?${searchParams.toString()}`) {
            router.push(newUrl, { scroll: false });
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
        // Expose debounced query for highlight functionality if needed
        debouncedQuery
    };
}
