/**
 * 🏷️ Cache Tags Registry
 * Centralized source of truth for all Next.js cache tags.
 */

export const CACHE_TAGS = {
    places: 'places',
    categories: 'categories',
    areas: 'areas',
    districts: 'districts',
    favorites: 'favorites',
    community: 'community',
    reviews: 'reviews',
    market: 'market',
    autocomplete: 'autocomplete',
} as const;

/**
 * 🚀 Dynamic Tag Generators
 */
export const tags = {
    // Places
    allPlaces: () => CACHE_TAGS.places,
    trendingPlaces: () => `${CACHE_TAGS.places}-trending`,
    newestPlaces: () => `${CACHE_TAGS.places}-newest`,
    place: (slug: string) => `${CACHE_TAGS.places}-slug:${slug}`,
    placeById: (id: string) => `${CACHE_TAGS.places}-id:${id}`,
    placesByCategory: (category: string) => `${CACHE_TAGS.places}-cat:${category}`,
    placesByArea: (areaId: number | string) => `${CACHE_TAGS.places}-area:${areaId}`,
    placesPage: (page: number) => `${CACHE_TAGS.places}-page:${page}`,

    // Market (Marketplace)
    allAds: () => CACHE_TAGS.market,
    ad: (id: string) => `${CACHE_TAGS.market}-id:${id}`,
    adsByCategory: (slug: string) => `${CACHE_TAGS.market}-cat:${slug}`,
    marketCategories: () => `${CACHE_TAGS.market}-categories`,
    marketCategory: (slug: string) => `${CACHE_TAGS.market}-category:${slug}`,

    // User specific
    userFavorites: (userId: string) => `user-${userId}-${CACHE_TAGS.favorites}`,
    isFavorite: (userId: string, itemId: string) => [`user-${userId}-fav-${itemId}`],

    // Reviews & Views
    placeReviews: (placeId: string) => `reviews-place:${placeId}`,
    placeViews: (placeId: string) => `views-place:${placeId}`,

    // Community
    allPosts: () => CACHE_TAGS.community,
    post: (id: string) => `${CACHE_TAGS.community}-id:${id}`,
    postComments: (postId: string) => `comments-post:${postId}`,

    // Metadata
    allCategories: () => CACHE_TAGS.categories,
    allDistricts: () => CACHE_TAGS.districts,
    allAreas: () => CACHE_TAGS.areas,
    autocomplete: (type: string, q: string) => `${CACHE_TAGS.autocomplete}-${type}-${q}`,
};
