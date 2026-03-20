import { getCommunityPosts } from '@/lib/actions/posts';
import { getCommunityCategories } from '@/lib/actions/categories';
import { createClient } from '@/lib/supabase/server';
import CommunityClient from './_components/CommunityClient';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;

  const title = q
    ? `نتائج البحث عن "${q}" - مجتمع السويس`
    : 'مجتمع السويس - دليل السويس';

  const description = q
    ? `نتائج البحث عن "${q}" في مجتمع السويس. استكشف المناقشات والمنشورات المتعلقة.`
    : 'شارك، اسأل، وتواصل مع أهل السويس في أذكى مجتمع محلي. شارك أخبارك، استفساراتك، وتجاربك مع الجميع.';

  return {
    title,
    description,
    keywords: ["مجتمع السويس", "منتدى السويس", "اخبار السويس", "اسال السويس", "مناقشات السويس", "سويس كافيه"],
    openGraph: { 
      title, 
      description,
      type: 'website',
      siteName: 'مجتمع السويس'
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  };
}


export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const q = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all posts (no category filter) + categories for post creation modal
  const [posts, categories] = await Promise.all([
    getCommunityPosts(undefined, q, 1, 20, user?.id),
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