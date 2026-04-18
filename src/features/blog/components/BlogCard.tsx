'use client';

import { CalendarDays, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import CustomLink from '@/components/customLink/customLink';
import { SafeImage } from '@/components/common/SafeImage';
import type { BlogPostListItem } from '@/features/blog/types';
import { ROUTE_HELPERS } from '@/constants';

export const stripHtmlAndMarkdown = (content: string) => {
  if (!content) return '';
  
  let text = content;
  
  // 1. Remove Markdown Images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');
  
  // 2. Clear Markdown Links but keep the text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // 3. Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // 4. Remove other Markdown symbols (Headers, Bold, Italic, Blockquotes, etc.)
  text = text.replace(/[#*_~`>|]/g, '');
  
  // 5. Remove horizontal rules
  text = text.replace(/-{3,}/g, '');
  
  // 6. Normalize whitespace and trim
  return text.replace(/\s+/g, ' ').trim();
};

export function BlogCard({ post, priority = false }: { post: BlogPostListItem; priority?: boolean }) {
  return (
    <article className="group glass-card rounded-[28px] overflow-hidden border-border-subtle/70 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
      <CustomLink href={ROUTE_HELPERS.BLOG_POST(post.slug)} className="block h-full">
        <div className="relative aspect-16/10 overflow-hidden bg-elevated">
          {post.imageUrl ? (
            <SafeImage
              src={post.imageUrl}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent/10 to-transparent" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/55 via-black/20 to-transparent" />
          
          {post.categoryName && (
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/20 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {post.categoryName}
            </div>
          )}

          <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-surface/85 px-3 py-1.5 text-[11px] font-black text-text-secondary backdrop-blur-md">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {format(new Date(post.publishedAt), 'dd MMMM yyyy', { locale: ar })}
          </div>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <h2 className="line-clamp-2 text-xl font-black leading-tight text-text-primary transition-colors group-hover:text-primary">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-7 text-text-muted">
            {stripHtmlAndMarkdown(post.excerpt || post.content || '')}
          </p>
          <div className="flex items-center justify-between text-sm font-bold text-primary">
            <span>{post.authorName ? `بقلم ${post.authorName}` : 'مقال من دليل السويس'}</span>
            <span className="inline-flex items-center gap-2">
              اقرأ المقال
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </CustomLink>
    </article>
  );
}
