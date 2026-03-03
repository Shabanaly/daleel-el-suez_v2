import { getPostById } from '@/lib/actions/posts';
import { getCommunityCategories } from '@/lib/actions/categories';
import { createClient } from '@/lib/supabase/server';
import PostCard from '../../_components/PostCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import CommunityComments from '../../_components/CommunityComments';
import { Suspense } from 'react';

interface PostPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const post = await getPostById(id, user?.id);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    if (!post) {
        return {
            title: 'منشور غير موجود - مجتمع السويس',
        };
    }

    const cleanContent = post.content.replace(/[#*`]/g, '').substring(0, 160);
    const title = `${post.author?.full_name || 'مشاركة'}: ${post.content.substring(0, 50)}... | مجتمع السويس`;
    const description = `${cleanContent}... اقرأ المزيد وشارك في النقاش على دليل السويس.`;

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/community/posts/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}/community/posts/${id}`,
            siteName: 'دليل السويس',
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author?.full_name || 'عضو في مجتمع السويس'],
            images: post.images?.length ? [post.images[0]] : ['/images/og-community.jpg'],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.images?.length ? [post.images[0]] : ['/images/og-community.jpg'],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch post and categories in parallel
    const [post, categories] = await Promise.all([
        getPostById(id, user?.id),
        getCommunityCategories()
    ]);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SocialMediaPosting',
        headline: post.content.substring(0, 100),
        description: post.content.substring(0, 160),
        author: {
            '@type': 'Person',
            name: post.author?.full_name || 'عضو مجتمع السويس',
        },
        datePublished: post.created_at,
        image: post.images?.length ? post.images[0] : undefined,
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-20 md:pt-28 px-4 md:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-3xl mx-auto">
                {/* Back Button & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/community"
                        className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Users className="w-4 h-4 text-primary opacity-60" />
                            <h1 className="text-sm font-black text-text-muted">مجتمع السويس</h1>
                        </div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">تفاصيل المنشور</h2>
                    </div>
                </div>

                {/* The Post Card */}
                <Suspense fallback={<div className="h-96 bg-surface animate-pulse rounded-[32px]" />}>
                    <PostCard post={post} categories={categories} isFullPage={true} />
                </Suspense>


                {/* Comments Section (Inline for individual page) */}
                <div className="mt-8">
                    <Suspense fallback={<div className="h-40 bg-surface animate-pulse rounded-2xl" />}>
                        <CommunityComments postId={post.id} isInline={true} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
