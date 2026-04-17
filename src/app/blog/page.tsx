import type { Metadata } from 'next';
import { APP_CONFIG, ROUTES } from '@/constants';
import { getPublishedBlogPosts, getBlogCategories } from '@/features/blog/actions/blog';
import { BlogCard } from '@/features/blog/components/BlogCard';
import { BlogPaginationNav } from '@/features/blog/components/BlogPaginationNav';
import BlogCategoryNav from '@/features/blog/components/BlogCategoryNav';
import BlogHeader from '@/features/blog/components/BlogHeader';
import AdSlot from '@/components/common/AdSlot';
import { Banner320x50, Banner728x90, Rectangle300x250 } from '@/components/common/ThirdPartyAds';
import React from 'react';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category;
  const pageSuffix = page > 1 ? ` - صفحة ${page}` : '';
  
  const title = (category 
    ? `مقالات عن ${category} - مدونة دليل السويس` 
    : `نبض السويس - أخبار، مقالات ومعلومات تهمك`) + pageSuffix;
  const description = 'اكتشف آخر أخبار السويس، مقالات مفيدة عن أفضل الأماكن، ونصائح يومية تهم كل سويسي وزائر للمدينة.';
  const url = page > 1 
    ? `${APP_CONFIG.BASE_URL}${ROUTES.BLOG}?page=${page}`
    : `${APP_CONFIG.BASE_URL}${ROUTES.BLOG}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} - ${APP_CONFIG.NAME}`,
      description: 'مقالات ونصائح وأدلة محلية لأهل السويس وزوارها.',
      url,
      images: [APP_CONFIG.OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${APP_CONFIG.NAME}`,
      description: 'مقالات ونصائح وأدلة محلية لأهل السويس وزوارها.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category;
  
  const [{ posts, currentPage, totalPages, totalCount }, categories] = await Promise.all([
    getPublishedBlogPosts(page, undefined, category),
    getBlogCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <BlogHeader categories={categories} />
      
      <section className="relative overflow-hidden rounded-[36px] border border-border-subtle/60 bg-linear-to-br from-primary/10 via-surface to-accent/10 px-6 pb-8 pt-16 md:px-10 md:py-12">
        <div className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative space-y-4">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black text-primary">
            مقالات ودلائل محلية
          </span>
          <h1 className="text-3xl font-black tracking-tight text-text-primary md:text-5xl">
            مدونة دليل السويس
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-text-secondary md:text-base">
            محتوى تحريري بنفس روح الموقع: أماكن مميزة، اقتراحات مفيدة، وأفكار تساعد أهل السويس يكتشفوا مدينتهم بشكل أفضل.
          </p>
          <div className="text-sm font-bold text-text-muted">
            {totalCount} مقال متاح للقراءة
          </div>
        </div>
      </section>

      <BlogCategoryNav categories={categories} />

   

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <React.Fragment key={post.id}>
            <BlogCard post={post} priority={index === 0} />
            
            {/* Inject Ad as the 3rd item (index 1 + insertion) */}
            {index === 1 && (
              <div className="flex h-full min-h-[350px] items-center justify-center overflow-hidden rounded-[28px] border border-border-subtle/70 bg-surface/50 p-4">
                <AdSlot showLabel={true}>
                  <Rectangle300x250 containerId="ad-blog-listing-grid" />
                </AdSlot>
              </div>
            )}
          </React.Fragment>
        ))}
      </section>

      {posts.length === 0 && (
        <div className="mt-10 rounded-[32px] border border-border-subtle/60 bg-surface/70 px-6 py-10 text-center text-sm font-bold text-text-muted">
          لا توجد مقالات منشورة حتى الآن.
        </div>
      )}

      <BlogPaginationNav currentPage={currentPage} totalPages={totalPages} basePath={ROUTES.BLOG} />
    </div>
  );
}
