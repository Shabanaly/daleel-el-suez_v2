import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Place, SortOption } from '../lib/types/places';
import { AreaWithDistrict } from '../lib/actions/areas';

export function usePlacesFilter(
    initialPlaces: Place[],
    categories: string[],
    areas: AreaWithDistrict[],
    districts: any[]
) {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(categories[0] || 'الكل');
    const [activeDistrict, setActiveDistrict] = useState('كل الأحياء');
    const [activeArea, setActiveArea] = useState('كل المناطق');
    const [sortBy, setSortBy] = useState<SortOption>('rating');
    const [showFilters, setShowFilters] = useState(false);

    // 🧠 Sync URL search params with state on mount
    useEffect(() => {
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const district = searchParams.get('district');
        const area = searchParams.get('area');
        const sort = searchParams.get('sort') as SortOption;

        if (q) {
            setQuery(q);
            setShowFilters(true);
        }
        if (category) setActiveCategory(category);

        if (district) {
            setActiveDistrict(district);
            setShowFilters(true);
        }
        if (area) {
            setActiveArea(area);
            setShowFilters(true);
        }

        if (sort) setSortBy(sort);
    }, [searchParams]);

    // Derived: Areas belonging to the active district
    const availableAreas = useMemo(() => {
        if (activeDistrict === 'كل الأحياء') return areas;
        const districtObj = districts.find(d => d.name === activeDistrict);
        if (!districtObj) return [];
        return areas.filter(a => a.district_id === districtObj.id);
    }, [areas, districts, activeDistrict]);

    // Auto-reset area if it's not in the new available list
    useEffect(() => {
        if (activeArea !== 'كل المناطق' && activeDistrict !== 'كل الأحياء') {
            const isStillAvailable = availableAreas.some(a => a.name === activeArea);
            if (!isStillAvailable) {
                setActiveArea('كل المناطق');
            }
        }
    }, [availableAreas, activeArea, activeDistrict]);

    const filtered = useMemo(() => {
        let list = initialPlaces;

        // 1. Search Query
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(p =>
                p.name.includes(q) ||
                p.category.includes(q) ||
                p.area.includes(q) ||
                p.district.includes(q) ||
                p.tags.some(t => t.includes(q))
            );
        }

        // 2. Category Filter
        if (activeCategory !== 'الكل') {
            list = list.filter(p => p.category === activeCategory);
        }

        // 3. District Filter (Higher level)
        if (activeDistrict !== 'كل الأحياء') {
            list = list.filter(p => p.district === activeDistrict);
        }

        // 4. Area Filter (Detailed level)
        if (activeArea !== 'كل المناطق') {
            list = list.filter(p => p.area === activeArea);
        }

        // 5. Sorting
        list = [...list].sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'reviews') return b.reviews - a.reviews;
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === 'trending') {
                const scoreA = (a.viewsCount * 0.7) + (a.rating * 10 * 0.3);
                const scoreB = (b.viewsCount * 0.7) + (b.rating * 10 * 0.3);
                return scoreB - scoreA;
            }
            return a.name.localeCompare(b.name, 'ar');
        });

        return list;
    }, [initialPlaces, query, activeCategory, activeDistrict, activeArea, sortBy]);

    const hasActiveFilters = activeCategory !== 'الكل' || activeDistrict !== 'كل الأحياء' || activeArea !== 'كل المناطق' || query !== '';

    const clearFilters = () => {
        setActiveCategory('الكل');
        setActiveDistrict('كل الأحياء');
        setActiveArea('كل المناطق');
        setQuery('');
    };

    return {
        // State
        query,
        activeCategory,
        activeDistrict,
        activeArea,
        sortBy,
        showFilters,
        availableAreas,

        // Derived state
        filtered,
        hasActiveFilters,

        // Actions
        setQuery,
        setActiveCategory,
        setActiveDistrict,
        setActiveArea,
        setSortBy,
        setShowFilters,
        clearFilters
    };
}
