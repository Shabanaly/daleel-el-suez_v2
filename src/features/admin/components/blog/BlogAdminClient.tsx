'use client';

import { useMemo, useState, useTransition } from 'react';
import { CalendarDays, Edit3, Loader2, MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { useDialog } from '@/components/providers/DialogProvider';
import type { AdminBlogPost } from '@/features/admin/actions/blog';
import {
  createBlogPostAction,
  deleteBlogPostAction,
  updateBlogPostAction,
} from '@/features/admin/actions/blog';
import { RichContent } from '@/features/blog/components/RichContent';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { AdminCommentsModal } from './AdminCommentsModal';

const EMPTY_FORM = {
  title: '',
  content: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  isPublished: true,
  categoryId: '',
};

function toLocalInputValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 16);
  return new Date(value).toISOString().slice(0, 16);
}

export function BlogAdminClient({
  initialPosts,
  totalCount,
  currentPage,
  totalPages,
  initialSearch = '',
  categories,
}: {
  initialPosts: AdminBlogPost[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  initialSearch?: string;
  categories?: { name: string; slug: string; icon: string; id?: number }[];
}) {
  const router = useRouter();
  const { showConfirm } = useDialog();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [commentingPost, setCommentingPost] = useState<AdminBlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPreview, setShowPreview] = useState(false);

  const uploader = useImageUpload({
    folder: 'blog-posts',
    maxImages: 1,
    initialImages: editingPost?.imageUrl ? [editingPost.imageUrl] : [],
    initialPublicIds: editingPost?.imagePublicId ? [editingPost.imagePublicId] : [],
    compression: { maxWidthOrHeight: 1600, quality: 0.85 },
  });

  const submitLabel = editingPost ? 'تحديث المقال' : 'نشر مقال جديد';

  const stats = useMemo(() => {
    const published = initialPosts.filter((post) => post.isPublished).length;
    return {
      published,
      drafts: initialPosts.length - published,
    };
  }, [initialPosts]);

  const resetForm = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    uploader.clearImages();
  };

  const beginEdit = (post: AdminBlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      publishedAt: toLocalInputValue(post.publishedAt),
      isPublished: post.isPublished,
      categoryId: post.categoryId || '',
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    router.push(params.toString() ? `/admin/blog?${params.toString()}` : '/admin/blog');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const uploaded = await uploader.startUpload();
        const payload = {
          title: form.title,
          content: form.content,
          publishedAt: new Date(form.publishedAt).toISOString(),
          isPublished: form.isPublished,
          categoryId: form.categoryId || null,
          imageUrl: uploaded.urls[0] ?? null,
          imagePublicId: uploaded.publicIds[0] ?? null,
        };

        if (editingPost) {
          await updateBlogPostAction(editingPost.id, payload);
        } else {
          await createBlogPostAction(payload);
        }

        resetForm();
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleDelete = (postId: string) => {
    showConfirm({
      title: 'حذف المقال',
      message: 'سيتم حذف المقال نهائيًا من المدونة ولوحة التحكم. هل تريد المتابعة؟',
      type: 'confirm',
      confirmLabel: 'حذف نهائي',
      cancelLabel: 'إلغاء',
      onConfirm: async () => {
        startTransition(async () => {
          await deleteBlogPostAction(postId);
          if (editingPost?.id === postId) {
            resetForm();
          }
          router.refresh();
        });
      },
    });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-3xl border-border-subtle/60 p-5">
          <div className="text-sm font-bold text-text-muted">إجمالي المقالات</div>
          <div className="mt-2 text-3xl font-black text-text-primary">{totalCount}</div>
        </div>
        <div className="glass-card rounded-3xl border-border-subtle/60 p-5">
          <div className="text-sm font-bold text-text-muted">المنشور حاليًا</div>
          <div className="mt-2 text-3xl font-black text-primary">{stats.published}</div>
        </div>
        <div className="glass-card rounded-3xl border-border-subtle/60 p-5">
          <div className="text-sm font-bold text-text-muted">المسودات في هذه الصفحة</div>
          <div className="mt-2 text-3xl font-black text-accent">{stats.drafts}</div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[32px] border-border-subtle/60 p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-text-primary">
                {editingPost ? 'تعديل المقال' : 'إضافة مقال جديد'}
              </h2>
              <p className="mt-1 text-sm font-medium text-text-muted">
                استخدم نفس أسلوب الموقع مع عنوان واضح ومحتوى غني وصورة غلاف مناسبة.
              </p>
            </div>
            {editingPost && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-border-subtle px-4 py-2 text-xs font-black text-text-secondary transition hover:border-primary/30 hover:text-primary"
              >
                إلغاء التعديل
              </button>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-black text-text-primary">عنوان المقال</label>
              <input
                dir="auto"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                placeholder="مثال: أفضل أماكن الفسحة في السويس هذا الأسبوع"
              />
            </div>
 
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black text-text-primary">التصنيف</label>
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary/40 appearance-none"
                  required
                >
                  <option value="" disabled>اختر التصنيف...</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id || cat.slug} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <option disabled>لا توجد تصنيفات (تأكد من وجود تصنيفات من نوع blog)</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-text-primary">تاريخ النشر</label>
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary/40"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-1">
              <label className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm font-bold text-text-primary">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                نشر المقال مباشرة
              </label>
            </div>

            <ImageUploader
              images={uploader.images}
              onFileChange={(event) => {
                if (event.target.files) {
                  uploader.uploadFiles(event.target.files);
                  event.target.value = '';
                }
              }}
              onDeleteImage={uploader.deleteImage}
              isUploading={uploader.isBusy}
              maxImages={1}
              error={uploader.error}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-text-primary">محتوى المقال</label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                    showPreview 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-surface-tertiary text-text-secondary border border-border-subtle hover:border-primary/30'
                  }`}
                >
                  {showPreview ? 'العودة للمحرر' : 'معاينة النشر'}
                </button>
              </div>
              
              {showPreview ? (
                <div className="min-h-[400px] w-full rounded-xl border border-border-subtle bg-surface-secondary/30 px-6 py-6 overflow-hidden">
                  <RichContent content={form.content} />
                </div>
              ) : (
                <RichTextEditor
                  content={form.content}
                  onChange={(newContent) => setForm((prev) => ({ ...prev, content: newContent }))}
                  placeholder="اكتب المقال هنا..."
                  draftKey={editingPost ? `blog_draft_edit_${editingPost.id}` : 'blog_draft_new'}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || uploader.isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending || uploader.isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitLabel}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-[32px] border-border-subtle/60 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="ابحث عن مقال..."
                  className="w-full rounded-2xl border border-border-subtle bg-surface py-3 pr-11 pl-4 text-sm outline-none transition focus:border-primary/40"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-2xl border border-border-subtle bg-surface px-5 py-3 text-sm font-black text-text-primary transition hover:border-primary/30 hover:text-primary"
              >
                بحث
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {initialPosts.map((post) => (
              <article key={post.id} className="glass-card rounded-[28px] border-border-subtle/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${
                        post.isPublished ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      }`}>
                        {post.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                      {post.categoryName && (
                        <span className="rounded-full bg-surface-tertiary px-3 py-1 text-[11px] font-black text-text-primary border border-border-subtle">
                          {post.categoryName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-text-muted">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {format(new Date(post.publishedAt), 'dd MMM yyyy - HH:mm', { locale: ar })}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-text-primary">{post.title}</h3>
                    <p className="line-clamp-2 text-sm leading-7 text-text-muted">
                      {post.excerpt || post.content}
                    </p>
                    <div className="text-xs font-bold text-text-muted">/{post.slug}</div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentingPost(post)}
                      className="rounded-2xl border border-border-subtle p-3 text-text-secondary transition hover:border-primary/30 hover:text-primary"
                      title="التعليقات"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => beginEdit(post)}
                      className="rounded-2xl border border-border-subtle p-3 text-text-secondary transition hover:border-primary/30 hover:text-primary"
                      title="تعديل"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="rounded-2xl border border-border-subtle p-3 text-text-secondary transition hover:border-error/30 hover:text-error"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {initialPosts.length === 0 && (
              <div className="glass-card rounded-[28px] border-border-subtle/60 p-8 text-center text-sm font-bold text-text-muted">
                لا توجد مقالات مطابقة للبحث الحالي.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-[28px] border border-border-subtle/60 bg-surface/70 px-5 py-4 text-sm font-bold text-text-secondary">
              <span>الصفحة {currentPage} من {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchTerm.trim()) params.set('q', searchTerm.trim());
                    params.set('page', String(currentPage - 1));
                    router.push(`/admin/blog?${params.toString()}`);
                  }}
                  className="rounded-2xl border border-border-subtle px-4 py-2 transition hover:border-primary/30 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchTerm.trim()) params.set('q', searchTerm.trim());
                    params.set('page', String(currentPage + 1));
                    router.push(`/admin/blog?${params.toString()}`);
                  }}
                  className="rounded-2xl border border-border-subtle px-4 py-2 transition hover:border-primary/30 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <AdminCommentsModal 
        post={commentingPost} 
        onClose={() => setCommentingPost(null)} 
      />
    </div>
  );
}
