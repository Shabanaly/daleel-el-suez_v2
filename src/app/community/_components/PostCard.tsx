"use client";

import { useState } from 'react';
import { User, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import CategoryIcon from './CategoryIcon';
import PostActions from './PostActions';
import PostHeaderActions from './PostHeaderActions';
import PostImagesGrid from './PostImagesGrid';
import PostCardAnimation from './PostCardAnimation';

interface PostCardProps {
  post: any;
  categories: any[];
  isLikedInitial?: boolean;
  isFullPage?: boolean;
}

export default function PostCard({ post, categories, isLikedInitial = false, isFullPage = false }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const CONTENT_THRESHOLD = 200; // rough char count for 4 lines
  // Use window.location.origin in client
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const likesCount = post.likes_count || 0;
  const commentsCount = post.comments_count?.[0]?.count || 0;

  return (
    <PostCardAnimation id={`post-${post.id}`}>
      {/* Post Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative ring-2 ring-background border border-primary/20">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.full_name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-black">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-text-primary text-base">
              {post.author?.full_name || 'مستشار سويسي'}
            </h3>
            <div className="flex items-center gap-2 text-text-muted text-xs font-bold opacity-60">
              <Clock className="w-3 h-3" />
              <Link href={`/community/posts/${post.id}`} className="hover:text-primary transition-colors">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}
              </Link>
              {post.category && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-primary font-black">
                    <CategoryIcon name={post.category.icon} className="w-3.5 h-3.5" />
                    <span>{post.category.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <PostHeaderActions
          post={post}
          origin={origin}
          categories={categories}
        />
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        {!isFullPage ? (
          <div>
            <Link href={`/community/posts/${post.id}`} className="block group/content">
              <p className={`text-text-primary text-base leading-relaxed font-bold whitespace-pre-wrap group-hover/content:text-primary transition-colors ${!isExpanded ? 'line-clamp-4' : ''}`}>
                {post.content}
              </p>
            </Link>
            {post.content && post.content.length > CONTENT_THRESHOLD && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary font-bold text-sm mt-2 hover:underline inline-block"
              >
                {isExpanded ? 'عرض أقل' : 'قراءة المزيد...'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-text-primary text-base leading-relaxed font-bold whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Images Grid (Client for Lightbox) */}
      <PostImagesGrid
        post={post}
        initialIsLiked={isLikedInitial}
        initialLikesCount={likesCount}
      />

      {/* Post Actions (Client for Like/Comment/Share) */}
      <PostActions
        postId={post.id}
        initialLikesCount={likesCount}
        initialIsLiked={post.isLiked || isLikedInitial}
        commentsCount={commentsCount}
        postContent={post.content}
        origin={origin}
        isFullPage={isFullPage}
      />
    </PostCardAnimation>
  );
}