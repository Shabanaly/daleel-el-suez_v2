/**
 * 🏷️ Cache Tags Registry
 * Centralized source of truth for all Next.js cache tags.
 */
import { createHash } from 'crypto';

/**
 * 🔒 Utility to ensure tags stay under 256 characters (Next.js limit)
 * URL-encoded Arabic slugs can be very long.
 */
const hashValue = (val: string) => {
    if (!val) return 'none';
    // If the value is short enough, keep it human readable
    if (val.length < 40) return val;
    // Otherwise hash it to a fixed length (32 chars)
    return createHash('md5').update(val).digest('hex');
};

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
    blog: 'blog',
} as const;

/**
 * 🚀 Dynamic Tag Generators
 */
export const tags = {
    // Places
    allPlaces: () => CACHE_TAGS.places,
    trendingPlaces: () => `${CACHE_TAGS.places}-trending`,
    newestPlaces: () => `${CACHE_TAGS.places}-newest`,
    place: (slug: string) => `${CACHE_TAGS.places}-slug:${hashValue(slug)}`,
    placeById: (id: string) => `${CACHE_TAGS.places}-id:${id}`,
    placesByCategory: (category: string) => `${CACHE_TAGS.places}-cat:${hashValue(category)}`,
    placesByArea: (areaId: number | string) => `${CACHE_TAGS.places}-area:${areaId}`,
    placesPage: (page: number) => `${CACHE_TAGS.places}-page:${page}`,

    // Market (Marketplace)
    allAds: () => CACHE_TAGS.market,
    ad: (id: string) => `${CACHE_TAGS.market}-id:${id}`,
    adsByCategory: (slug: string) => `${CACHE_TAGS.market}-cat:${hashValue(slug)}`,
    marketCategories: () => `${CACHE_TAGS.market}-categories`,
    marketCategory: (slug: string) => `${CACHE_TAGS.market}-category:${hashValue(slug)}`,

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

    // Blog
    allBlogPosts: () => CACHE_TAGS.blog,
    blogPost: (slug: string) => `${CACHE_TAGS.blog}-slug:${hashValue(slug)}`,
    blogPage: (page: number) => `${CACHE_TAGS.blog}-page:${page}`,
    recentBlogPosts: () => `${CACHE_TAGS.blog}-recent`,
    blogSitemap: () => `${CACHE_TAGS.blog}-sitemap`,
    blogComments: (postId: string) => `comments-blog:${postId}`,

    // Metadata
    allCategories: () => CACHE_TAGS.categories,
    allDistricts: () => CACHE_TAGS.districts,
    allAreas: () => CACHE_TAGS.areas,
    autocomplete: (type: string, q: string) => `${CACHE_TAGS.autocomplete}-${type}-${q}`,
};
