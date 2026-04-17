import type { Metadata } from 'next';
import { getAdminBlogPosts } from '@/features/admin/actions/blog';
import { BlogAdminClient } from '@/features/admin/components/blog/BlogAdminClient';
import { getBlogCategories } from '@/features/blog/actions/blog';

export const metadata: Metadata = {
  title: 'إدارة المدونة',
};

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q?.trim() || '';
  const [{ posts, totalCount }, categories] = await Promise.all([
    getAdminBlogPosts({ page, search, limit: 10 }),
    getBlogCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-primary">إدارة المدونة</h1>
        <p className="text-sm font-medium text-text-muted">
          أنشئ المقالات، عدّلها، وانشرها من نفس لوحة الإدارة الحالية مع روابط صديقة لمحركات البحث.
        </p>
      </div>

      <BlogAdminClient
        initialPosts={posts}
        totalCount={totalCount}
        currentPage={page}
        totalPages={Math.ceil(totalCount / 10)}
        initialSearch={search}
        categories={categories}
      />
    </div>
  );
}
