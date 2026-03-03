import { useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Place, SortOption } from '../lib/types/places';
import { AreaWithDistrict } from '../lib/actions/areas';
import { getPlaces } from '../lib/actions/places';

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

    // Sync state with URL manually if needed or use URL as source of truth
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        // Construct new URL based on state
        if (query) params.set('q', query); else params.delete('q');
        if (activeCategory !== 'الكل') params.set('category', activeCategory); else params.delete('category');
        if (activeDistrict !== 'كل الأحياء') params.set('district', activeDistrict); else params.delete('district');
        if (activeArea !== 'كل المناطق') params.set('area', activeArea); else params.delete('area');
        if (sortBy !== 'trending') params.set('sort', sortBy); else params.delete('sort');
        if (page > 1) params.set('page', page.toString()); else params.delete('page');

        const newUrl = `${pathname}?${params.toString()}`;

        // Only update if URL actually changed to avoid infinite loops
        if (newUrl !== `${pathname}?${searchParams.toString()}`) {
            router.push(newUrl, { scroll: false });
        }
    }, [query, activeCategory, activeDistrict, activeArea, sortBy, page, pathname, router, searchParams]);

    // Derived: Areas belonging to the active district
    const availableAreas = useMemo(() => {
        if (activeDistrict === 'كل الأحياء') return allAreas;
        const districtObj = districts.find(d => d.name === activeDistrict);
        if (!districtObj) return [];
        return allAreas.filter(a => a.district_id === districtObj.id);
    }, [allAreas, districts, activeDistrict]);

    // Handle Server-Side Filtering (Pseudo-code, usually handled by Page.tsx in Next.js)
    // But since we want "Live" feeling, we use the hook to trigger data updates
    const filtered = useMemo(() => {
        // Here we still apply query filter on the current page for instant feedback
        if (!query.trim()) return places;
        const q = query.toLowerCase();
        return places.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }, [places, query]);

    const hasActiveFilters = activeCategory !== 'الكل' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق' || query !== '';

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
        isPending
    };
}
