import { getCommunityPosts } from '@/lib/actions/posts';
import { getCommunityCategories } from '@/lib/actions/categories';
import { createClient } from '@/lib/supabase/server';
import CommunityClient from './_components/CommunityClient';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;

  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  let title = 'مجتمع السويس - دليل السويس';
  let description = 'شارك، اسأل، وتواصل مع أهل السويس في أذكى مجتمع محلي. شارك أخبارك، استفساراتك، وتجاربك مع الجميع.';

  const categories = await getCommunityCategories();

  if (categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      title = `قسم ${category.name} - مجتمع السويس`;
      description = `تصفح أحدث المنشورات والمناقشات في قسم ${category.name} بمجتمع السويس.`;
    }
  }

  if (q) {
    title = `نتائج البحث عن "${q}" - مجتمع السويس`;
    description = `نتائج البحث عن "${q}" في مجتمع السويس. استكشف المناقشات والمنشورات المتعلقة.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}


export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;

  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch data in parallel
  const [posts, categories] = await Promise.all([
    getCommunityPosts(categoryId, q, 1, 10, user?.id),
    getCommunityCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-20 md:pt-28 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <CommunityClient
          initialPosts={posts}
          categories={categories}
          userAvatar={user?.user_metadata?.avatar_url}
        />
      </div>
    </div>
  );
}