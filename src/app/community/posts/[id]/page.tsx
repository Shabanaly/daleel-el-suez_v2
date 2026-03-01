import { getPostById } from '@/lib/actions/posts';
import { getCommunityCategories } from '@/lib/actions/categories';
import PostCard from '../../_components/PostCard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import CommentsWrapper from '../../_components/CommentsWrapper';

import { Suspense } from 'react';

interface PostPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        return {
            title: 'منشور غير موجود - مجتمع السويس',
        };
    }

    const title = `${post.author?.full_name || 'مشاركة'}: ${post.content.substring(0, 50)}...`;
    const description = post.content.substring(0, 160);

    return {
        title: `${title} - مجتمع السويس`,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author?.full_name || 'مستشار سويسي'],
            images: post.images?.length ? [post.images[0]] : [],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { id } = await params;

    // Fetch post and categories in parallel
    const [post, categories] = await Promise.all([
        getPostById(id),
        getCommunityCategories()
    ]);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-20 md:pt-28 px-4 md:px-8">
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
                    <PostCard post={post} categories={categories} />
                </Suspense>

                {/* Comments Section (Since it's an individual page, we can handle comments differently or just use the existing sheet logic) */}
                <div className="mt-8">
                    <Suspense fallback={null}>
                        <CommentsWrapper forcedOpenPostId={post.id} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
