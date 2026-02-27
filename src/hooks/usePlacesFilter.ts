import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Place, SortOption } from '../lib/types/places';

export function usePlacesFilter(initialPlaces: Place[], categories: string[], areas: string[]) {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(categories[0] || 'الكل');
    const [activeArea, setActiveArea] = useState(areas[0] || 'كل المناطق');
    const [sortBy, setSortBy] = useState<SortOption>('rating');
    const [showFilters, setShowFilters] = useState(false);

    // 🧠 Sync URL search params with state on mount
    useEffect(() => {
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const area = searchParams.get('area');

        if (q) setQuery(q);
        if (category) setActiveCategory(category);
        if (area) setActiveArea(area);
    }, [searchParams]);

    const filtered = useMemo(() => {
        let list = initialPlaces;

        // 1. Search Query
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(p =>
                p.name.includes(q) ||
                p.category.includes(q) ||
                p.area.includes(q) ||
                p.tags.some(t => t.includes(q))
            );
        }

        // 2. Category Filter
        if (activeCategory !== 'الكل') {
            list = list.filter(p => p.category === activeCategory);
        }

        // 3. Area Filter
        if (activeArea !== 'كل المناطق') {
            list = list.filter(p => p.area === activeArea);
        }

        // 4. Sorting
        list = [...list].sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'reviews') return b.reviews - a.reviews;
            return a.name.localeCompare(b.name, 'ar');
        });

        return list;
    }, [initialPlaces, query, activeCategory, activeArea, sortBy]);

    const hasActiveFilters = activeCategory !== 'الكل' || activeArea !== 'كل المناطق';

    const clearFilters = () => {
        setActiveCategory('الكل');
        setActiveArea('كل المناطق');
        setQuery('');
    };

    return {
        // State
        query,
        activeCategory,
        activeArea,
        sortBy,
        showFilters,

        // Derived state
        filtered,
        hasActiveFilters,

        // Actions
        setQuery,
        setActiveCategory,
        setActiveArea,
        setSortBy,
        setShowFilters,
        clearFilters
    };
}
