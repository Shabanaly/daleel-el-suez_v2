'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cacheManager } from '@/lib/cache';

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  categoryId: string | null;
  categoryName: string | null;
}

interface AdminBlogPostRow {
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
  category_id: number | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createExcerpt(content: string) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 180);
}

async function checkAdminOrModerator() {
  const supabaseSession = await createClient();
  const { data: { user }, error: userError } = await supabaseSession.auth.getUser();

  if (userError || !user) {
    throw new Error('غير مصرح لك بالدخول.');
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !['admin', 'moderator'].includes(data?.role)) {
    throw new Error('ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء.');
  }

  return { user, role: data?.role as 'admin' | 'moderator' };
}

async function generateUniqueSlug(title: string, currentId?: string) {
  const supabase = createAdminClient();
  const baseSlug = slugify(title) || `post-${Date.now()}`;
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', candidate)
      .limit(1);

    if (currentId) {
      query = query.neq('id', currentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking blog slug uniqueness:', error);
      throw new Error('تعذر إنشاء رابط المقال.');
    }

    if (!data || data.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

function mapPost(row: AdminBlogPostRow): AdminBlogPost {
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
    categoryId: row.category_id?.toString() ?? null,
    categoryName: (row as unknown as { categories?: { name?: string } }).categories?.name ?? null,
  };
}

export async function getAdminBlogPosts(params?: { page?: number; search?: string; limit?: number }) {
  await checkAdminOrModerator();
  const supabase = createAdminClient();
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

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
      category_id,
      categories!category_id (name)
    `, { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (params?.search?.trim()) {
    query = query.or(`title.ilike.%${params.search.trim()}%,content.ilike.%${params.search.trim()}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin blog posts:', error);
    throw new Error('فشل جلب المقالات.');
  }

  return {
    posts: (data ?? []).map(mapPost),
    totalCount: count ?? 0,
  };
}

export async function createBlogPostAction(input: {
  title: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  categoryId?: string | null;
}) {
  const { user } = await checkAdminOrModerator();
  const supabase = createAdminClient();
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error('العنوان والمحتوى مطلوبان.');
  }

  const slug = await generateUniqueSlug(title);
  const payload = {
    title,
    slug,
    content,
    excerpt: createExcerpt(content),
    image_url: input.imageUrl ?? null,
    image_public_id: input.imagePublicId ?? null,
    published_at: input.publishedAt || new Date().toISOString(),
    is_published: input.isPublished,
    category_id: input.categoryId ? parseInt(input.categoryId) : null,
    author_id: user.id,
  };

  const { error } = await supabase.from('blog_posts').insert(payload);

  if (error) {
    console.error('Error creating blog post:', error);
    throw new Error('فشل إنشاء المقال.');
  }

  cacheManager.invalidateBlogPost(slug);
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/sitemap.xml');
}

export async function updateBlogPostAction(postId: string, input: {
  title: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  categoryId?: string | null;
}) {
  await checkAdminOrModerator();
  const supabase = createAdminClient();
  const title = input.title.trim();
  const content = input.content.trim();

  const { data: existingPost, error: existingPostError } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('id', postId)
    .single();

  if (existingPostError || !existingPost) {
    console.error('Error fetching existing blog post before update:', existingPostError);
    throw new Error('تعذر الوصول إلى المقال قبل تحديثه.');
  }

  if (!title || !content) {
    throw new Error('العنوان والمحتوى مطلوبان.');
  }

  const slug = await generateUniqueSlug(title, postId);
  const payload = {
    title,
    slug,
    content,
    excerpt: createExcerpt(content),
    image_url: input.imageUrl ?? null,
    image_public_id: input.imagePublicId ?? null,
    published_at: input.publishedAt || new Date().toISOString(),
    is_published: input.isPublished,
    category_id: input.categoryId ? parseInt(input.categoryId) : null,
  };

  const { error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', postId);

  if (error) {
    console.error('Error updating blog post:', error);
    throw new Error('فشل تحديث المقال.');
  }

  cacheManager.invalidateBlogPost(slug, existingPost.slug);
  revalidatePath('/blog');
  revalidatePath(`/blog/${existingPost.slug}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/sitemap.xml');
}

export async function deleteBlogPostAction(postId: string) {
  const { role } = await checkAdminOrModerator();

  if (role !== 'admin') {
    throw new Error('حذف المقالات متاح للمدير فقط.');
  }

  const supabase = createAdminClient();
  const { data: existingPost, error: existingPostError } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('id', postId)
    .single();

  if (existingPostError || !existingPost) {
    console.error('Error fetching existing blog post before delete:', existingPostError);
    throw new Error('تعذر الوصول إلى المقال قبل حذفه.');
  }

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw new Error('فشل حذف المقال.');
  }

  cacheManager.invalidateBlogPost(existingPost.slug);
  revalidatePath('/blog');
  revalidatePath(`/blog/${existingPost.slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/sitemap.xml');
}
