import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import CustomLink from '@/components/customLink/customLink';
import { SafeImage } from '@/components/common/SafeImage';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { APP_CONFIG, ROUTES, ROUTE_HELPERS } from '@/constants';
import { getBlogPostBySlug, getRecentBlogPosts } from '@/features/blog/actions/blog';
import { BlogCard } from '@/features/blog/components/BlogCard';
import AdSlot from '@/components/common/AdSlot';
import { Banner320x50, Banner728x90, Rectangle300x250 } from '@/components/common/ThirdPartyAds';
import { AppBar } from '@/components/ui/AppBar';
import { RichContent } from '@/features/blog/components/RichContent';
import BlogComments from '@/features/blog/components/BlogComments';

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'مقال غير موجود' };
  }

  const url = `${APP_CONFIG.BASE_URL}${ROUTE_HELPERS.BLOG_POST(post.slug)}`;
  const description = post.excerpt || post.content.slice(0, 160);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      section: 'Blog',
      images: post.imageUrl ? [post.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRecentBlogPosts(post.slug, 3, post.categoryId || undefined);
  const readMinutes = estimateReadMinutes(post.content);
  const articleUrl = `${APP_CONFIG.BASE_URL}${ROUTE_HELPERS.BLOG_POST(post.slug)}`;
  const breadcrumbs = [
    { name: 'الرئيسية', item: ROUTES.HOME },
    { name: 'المدونة', item: ROUTES.BLOG },
    { name: post.title, item: ROUTE_HELPERS.BLOG_POST(post.slug) },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160).replace(/[#*`]/g, ''),
    image: post.imageUrl ? [post.imageUrl] : [],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: APP_CONFIG.NAME,
      url: APP_CONFIG.BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_CONFIG.NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_CONFIG.BASE_URL}${APP_CONFIG.LOGO_PATH}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbsJsonLd items={breadcrumbs} />
      
      <AppBar 
        title={post.title} 
        backHref={ROUTES.BLOG} 
        titleBehavior="scroll-reveal"
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-16 md:px-6 md:py-10">
        <article className="overflow-hidden rounded-[36px] border border-border-subtle/60 bg-surface shadow-xl shadow-slate-200/20">
          {post.imageUrl && (
            <div className="relative aspect-16/7 overflow-hidden bg-elevated">
              <SafeImage
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
            </div>
          )}

          <div className="space-y-6 px-5 py-6 md:px-10 md:py-10">
            <CustomLink href={ROUTES.BLOG} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black text-primary">
              العودة إلى المدونة
            </CustomLink>

            <div className="space-y-4">
              <h1 className="text-3xl font-black leading-tight text-text-primary md:text-5xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-text-muted">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {format(new Date(post.publishedAt), 'dd MMMM yyyy', { locale: ar })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-accent" />
                  {readMinutes} دقيقة قراءة
                </span>
                {post.categoryName && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    {post.categoryName}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-border-subtle/70" />

            {/* Top Article Ad */}
            <AdSlot device="desktop" className="my-6">
              <Banner728x90 containerId="ad-article-top-desktop" />
            </AdSlot>
            <AdSlot device="mobile" className="my-6">
              <Banner320x50 containerId="ad-article-top-mobile" />
            </AdSlot>

            <div className="space-y-6">
              {(() => {
                const paragraphs = post.content.split(/\n{2,}/);
                const firstPart = paragraphs.slice(0, 3).join('\n\n');
                const secondPart = paragraphs.slice(3).join('\n\n');

                return (
                  <>
                    <RichContent content={firstPart} />
                    
                    {paragraphs.length > 3 && (
                      <div className="my-8 flex justify-center">
                        <AdSlot showLabel={true}>
                          <Rectangle300x250 containerId="ad-article-middle" />
                        </AdSlot>
                      </div>
                    )}

                    {secondPart && <RichContent content={secondPart} />}
                  </>
                );
              })()}
            </div>

            {/* Bottom Article Ad */}
            <div className="pt-8">
              <AdSlot device="desktop">
                <Banner728x90 containerId="ad-article-bottom-desktop" />
              </AdSlot>
              <AdSlot device="mobile">
                <Banner320x50 containerId="ad-article-bottom-mobile" />
              </AdSlot>
            </div>
          </div>
        </article>

        <BlogComments 
          postId={post.id} 
          postSlug={post.slug} 
        />

        {relatedPosts.length > 0 && (
          <section className="mt-10 space-y-5">
            <div>
              <h2 className="text-2xl font-black text-text-primary">مقالات قد تهمك</h2>
              <p className="mt-1 text-sm font-medium text-text-muted">محتوى مرتبط بنفس روح الموقع.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
