/**
 * 🔑 Cache Keys Registry
 * Used for unstable_cache identifiers.
 */

export const CACHE_KEYS = {
    places: 'places-list',
    trending: 'trending-places',
    latest: 'latest-places',
    homePage: 'home-page-data',
    blogList: 'blog-list',
    blogPost: 'blog-post',
    blogRecent: 'blog-recent',
    blogSitemap: 'blog-sitemap',
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

    // Blog
    blogList: (page: number, limit: number, category?: string) => [CACHE_KEYS.blogList, `page-${page}`, `limit-${limit}`, category || 'all'],
    blogPost: (slug: string) => [CACHE_KEYS.blogPost, slug],
    blogRecent: (excludeSlug: string | undefined, limit: number, categoryId?: string) => [CACHE_KEYS.blogRecent, excludeSlug || 'none', `limit-${limit}`, categoryId || 'all'],
    blogSitemap: () => [CACHE_KEYS.blogSitemap],

    // Favorites
    isFavorite: (userId: string, itemId: string) => [`user-${userId}-fav-${itemId}`],
};
