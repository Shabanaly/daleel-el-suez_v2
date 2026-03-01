import { getCommunityPosts } from '@/lib/actions/posts';
import { getCommunityCategories } from '@/lib/actions/categories';
import PostCard from './_components/PostCard';
import CreatePost from './_components/CreatePost';
import CommunityFeed from './_components/CommunityFeed';
import CategoryIcon from './_components/CategoryIcon';
import { Suspense } from 'react';
import { Loader2, Users, LayoutGrid } from 'lucide-react';

export const metadata = {
  title: 'المجتمع - دليل السويس',
  description: 'شارك، اسأل، وتواصل مع أهل السويس في أذكى مجتمع محلي.',
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;

  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  // Fetch data in parallel
  const [posts, categories] = await Promise.all([
    getCommunityPosts(categoryId),
    getCommunityCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pt-28 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-text-primary tracking-tight">مجتمع السويس</h1>
            </div>
            <p className="text-text-muted font-bold text-sm">تواصل مع جيرانك واعرف آخر أخبار مدينتك</p>
          </div>

          {/* Category Filter Pills (Mobile Scrollable) */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar">
            <a
              href="/community"
              className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-2 ${!categoryId
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-surface text-text-muted border-border-subtle hover:border-primary/30'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              الكل
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/community?category=${cat.id}`}
                className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-2 ${categoryId === cat.id
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-surface text-text-muted border-border-subtle hover:border-primary/30'
                  }`}
              >
                <CategoryIcon name={cat.icon} className="w-4 h-4" />
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        {/* Create Post Area */}
        <Suspense fallback={<div className="h-32 bg-surface animate-pulse rounded-[32px] mb-8" />}>
          <CreatePost categories={categories} />
        </Suspense>

        {/* Posts Feed */}
        <CommunityFeed initialPosts={posts} />

        {posts.length >= 10 && (
          <div className="mt-10 text-center">
            <button className="px-8 py-4 bg-surface border border-border-subtle rounded-2xl font-black text-sm text-text-muted hover:text-primary transition-all">
              عرض المزيد من المنشورات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}