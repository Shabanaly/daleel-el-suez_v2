/**
 * 🔑 Cache Keys Registry
 * Used for unstable_cache identifiers.
 */

export const CACHE_KEYS = {
    places: 'places-list',
    trending: 'trending-places',
    latest: 'latest-places',
    homePage: 'home-page-data',
} as const;

export const keys = {
    // Places
    placesPaginated: (page: number, filters: Record<string, unknown>) =>
        [CACHE_KEYS.places, `page-${page}`, JSON.stringify(filters)],

    trending: (limit: number) => [CACHE_KEYS.trending, `limit-${limit}`],
    latest: (limit: number) => [CACHE_KEYS.latest, `limit-${limit}`],

    placeDetail: (slug: string) => [`place-detail-${slug}`],

    // Home Data
    homePage: () => [CACHE_KEYS.homePage],

    // Favorites
    isFavorite: (userId: string, itemId: string) => [`user-${userId}-fav-${itemId}`],
};
