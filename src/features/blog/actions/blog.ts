'use server';

import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { keys, tags } from '@/lib/cache';
import type { BlogPost, BlogPostListItem, BlogPostsResult } from '@/features/blog/types';

const POSTS_PER_PAGE = 6;

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  image_public_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  is_published: boolean | null;
  author_id: string | null;
  category_id: number | null;
  profiles?: Array<{
    full_name?: string | null;
    username?: string | null;
  }> | null;
  categories?: Array<{
    name: string;
    slug: string;
    icon: string;
  }> | null;
}

function mapPostRow(row: BlogPostRow): BlogPostListItem {
  const authorProfile = row.profiles?.[0];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt ?? '',
    imageUrl: row.image_url ?? null,
    imagePublicId: row.image_public_id ?? null,
    publishedAt: row.published_at ?? row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    isPublished: Boolean(row.is_published),
    authorId: row.author_id ?? null,
    authorName: authorProfile?.full_name ?? authorProfile?.username ?? null,
    categoryName: row.categories?.[0]?.name ?? null,
    categorySlug: row.categories?.[0]?.slug ?? null,
    categoryIcon: row.categories?.[0]?.icon ?? null,
    categoryId: row.category_id?.toString() ?? null,
  };
}

function normalizeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function getPublishedBlogPosts(page = 1, limit = POSTS_PER_PAGE, category?: string): Promise<BlogPostsResult> {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : POSTS_PER_PAGE;
  return unstable_cache(
    async (cachedPage: number, cachedLimit: number, cachedCategory?: string): Promise<BlogPostsResult> => {
      const from = (cachedPage - 1) * cachedLimit;
      const to = from + cachedLimit - 1;
      const supabase = createAdminClient();
 
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          image_url,
          image_public_id,
          published_at,
          created_at,
          updated_at,
          is_published,
          author_id,
          profiles:author_id (
            full_name,
            username
          ),
          categories:category_id${cachedCategory ? '!inner' : ''} (
            name,
            slug,
            icon
          )
        `, { count: 'exact' })
        .eq('is_published', true);

      if (cachedCategory) {
        query = query.eq('categories.slug', cachedCategory);
      }

      const { data, count, error } = await query
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching published blog posts:', error);
        return { posts: [], totalCount: 0, totalPages: 0, currentPage: cachedPage };
      }

      const totalCount = count ?? 0;
      return {
        posts: (data as any[] ?? []).map(mapPostRow),
        totalCount,
        totalPages: Math.ceil(totalCount / cachedLimit),
        currentPage: cachedPage,
      };
    },
    keys.blogList(safePage, safeLimit, category),
    {
      tags: [tags.allBlogPosts(), tags.blogPage(safePage)],
      revalidate: 1800,
    }
  )(safePage, safeLimit, category);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return unstable_cache(
    async (cachedSlug: string): Promise<BlogPost | null> => {
      const normalizedSlug = normalizeSlug(cachedSlug);
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          image_url,
          image_public_id,
          published_at,
          created_at,
          updated_at,
          is_published,
          author_id,
          category_id,
          categories:category_id (
            name,
            slug,
            icon
          )
        `)
        .eq('slug', normalizedSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error || !data) {
        if (error) console.error('Error fetching blog post by slug:', error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt ?? '',
        imageUrl: data.image_url ?? null,
        imagePublicId: data.image_public_id ?? null,
        publishedAt: data.published_at ?? data.created_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at ?? data.created_at,
        isPublished: Boolean(data.is_published),
        authorId: data.author_id ?? null,
        categoryName: (data.categories as any)?.[0]?.name ?? null,
        categorySlug: (data.categories as any)?.[0]?.slug ?? null,
        categoryIcon: (data.categories as any)?.[0]?.icon ?? null,
        categoryId: data.category_id?.toString() ?? null,
      };
    },
    keys.blogPost(slug),
    {
      tags: [tags.blogPost(slug), tags.allBlogPosts()],
      revalidate: 3600,
    }
  )(slug);
}

export async function getRecentBlogPosts(excludeSlug?: string, limit = 3, categoryId?: string): Promise<BlogPostListItem[]> {
  return unstable_cache(
    async (cachedExcludeSlug?: string, cachedLimit = 3, cachedCategoryId?: string): Promise<BlogPostListItem[]> => {
      const supabase = createAdminClient();
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          image_url,
          image_public_id,
          published_at,
          created_at,
          updated_at,
          is_published,
          author_id,
          category_id,
          profiles:author_id (
            full_name,
            username
          )
        `)
        .eq('is_published', true);

      if (cachedCategoryId) {
        query = query.eq('category_id', cachedCategoryId);
      }

      query = query
        .order('published_at', { ascending: false })
        .limit(cachedLimit);

      if (cachedExcludeSlug) {
        query = query.neq('slug', cachedExcludeSlug);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recent blog posts:', error);
        return [];
      }

      return (data ?? []).map(mapPostRow);
    },
    keys.blogRecent(excludeSlug, limit, categoryId),
    {
      tags: [tags.recentBlogPosts(), tags.allBlogPosts()],
      revalidate: 3600,
    }
  )(excludeSlug, limit, categoryId);
}

export async function getAllBlogPostsForSitemap(): Promise<Array<{ slug: string; updated_at: string; published_at: string; image_url: string | null }>> {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at, image_url')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts for sitemap:', error);
        return [];
      }

      return data ?? [];
    },
    keys.blogSitemap(),
    {
      tags: [tags.blogSitemap(), tags.allBlogPosts()],
      revalidate: 86400,
    }
  )();
}

export async function getBlogCategories() {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug, icon')
        .eq('type', 'blog')
        .order('name');

      if (error) {
        console.error('Error fetching blog categories:', error);
        return [];
      }

      return data ?? [];
    },
    ['blog-categories'],
    {
      tags: ['blog-categories'],
      revalidate: 86400,
    }
  )();
}
