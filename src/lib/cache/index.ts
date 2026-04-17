export * from './tags';
export * from './keys';

import { revalidateTag } from 'next/cache';
import { tags } from './tags';

/**
 * 🛠️ Cache Management Utilities (Centralized Revalidation)
 */
export const cacheManager = {
    /**
     * Invalidate everything related to places (e.g. on new place addition)
     */
    invalidateAllPlaces: () => {
        revalidateTag(tags.allPlaces(), 'max');
        revalidateTag(tags.trendingPlaces(), 'max');
        revalidateTag(tags.newestPlaces(), 'max');
    },

    /**
     * Invalidate a place across all specific cache partitions
     */
    invalidatePlace: (slug: string, id: string, categoryId?: number | string, areaId?: number | string) => {
        revalidateTag(tags.place(slug), 'max');
        revalidateTag(tags.placeById(id), 'max');
        if (categoryId) revalidateTag(tags.placesByCategory(categoryId.toString()), 'max');
        if (areaId) revalidateTag(tags.placesByArea(areaId), 'max');

        // Always clear general lists and home page when a specific item changes
        revalidateTag(tags.allPlaces(), 'max');
        revalidateTag(tags.trendingPlaces(), 'max');
        revalidateTag(tags.newestPlaces(), 'max');
    },

    invalidateReview: (placeId: string, userId?: string) => {
        revalidateTag(tags.placeReviews(placeId), 'max');
        revalidateTag(tags.placeById(placeId), 'max'); // Review count / average rating changed
        revalidateTag(tags.allPlaces(), 'max'); // List rating might change
        if (userId) cacheManager.invalidateUserStats(userId);
    },

    invalidateFavorites: (userId: string, itemId: string) => {
        revalidateTag(tags.userFavorites(userId), 'max');
        revalidateTag(tags.isFavorite(userId, itemId)[0], 'max');
    },

    invalidateMetadata: () => {
        revalidateTag(tags.allCategories(), 'max');
        revalidateTag(tags.allDistricts(), 'max');
        revalidateTag(tags.allAreas(), 'max');
    },

    invalidatePost: (postId: string, userId?: string) => {
        revalidateTag(tags.allPosts(), 'max');
        revalidateTag(tags.post(postId), 'max');
        if (userId) cacheManager.invalidateUserStats(userId);
    },

    invalidateComment: (postId: string, userId?: string) => {
        revalidateTag(tags.postComments(postId), 'max');
        revalidateTag(tags.post(postId), 'max'); // Comment count changed
        if (userId) cacheManager.invalidateUserStats(userId);
    },

    invalidateBlogPost: (slug: string, previousSlug?: string) => {
        revalidateTag(tags.allBlogPosts(), 'max');
        revalidateTag(tags.blogPost(slug), 'max');
        revalidateTag(tags.recentBlogPosts(), 'max');
        revalidateTag(tags.blogSitemap(), 'max');
        if (previousSlug && previousSlug !== slug) {
            revalidateTag(tags.blogPost(previousSlug), 'max');
        }
    },

    invalidateUserStats: (userId: string) => {
        revalidateTag(`user-${userId}-stats`, 'max');
        revalidateTag(`user-${userId}-activities`, 'max');
    }
};
