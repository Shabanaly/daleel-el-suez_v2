'use client';

import { ArrowLeft, BookOpenText } from 'lucide-react';
import CustomLink from '@/components/customLink/customLink';
import { ROUTES } from '@/constants';
import { BlogCard } from './BlogCard';
import type { BlogPostListItem } from '../types';

interface HomeBlogSectionProps {
  posts: BlogPostListItem[];
}

export default function HomeBlogSection({ posts }: HomeBlogSectionProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black tracking-wider uppercase">
              <BookOpenText className="w-3.5 h-3.5" />
              مدونة دليل السويس
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
              اكتشف السويس بعيون أهلها
            </h2>
            <p className="text-text-secondary max-w-2xl leading-relaxed font-medium">
              نصائح، ترشيحات، وحكايات عن أفضل الأماكن والخدمات في مدينتنا. محتوى حصري يساعدك تستمتع بالسويس أكتر.
            </p>
          </div>

          <CustomLink
            href={ROUTES.BLOG}
            className="group flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all"
          >
            مشاهدة كل المقالات
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </CustomLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* Mobile View All Button - visible only on small screens */}
        <div className="md:hidden pt-4">
          <CustomLink
            href={ROUTES.BLOG}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-surface border border-border-subtle font-black text-text-primary active:scale-95 transition-all"
          >
            مشاهدة كل المقالات
            <ArrowLeft className="w-4 h-4" />
          </CustomLink>
        </div>
      </div>
    </section>
  );
}
