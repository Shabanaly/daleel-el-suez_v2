'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Video,
  Sparkles,
  BadgeCheck,
  Tag,
  Gift,
  X,
} from 'lucide-react';
import { HeroAd, HeroAdFormValues, HeroAdIconType, HeroAdMediaType } from '../types';
import { createHeroAd, updateHeroAd, deleteHeroAd } from '../actions';
import { toast } from 'react-hot-toast';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface HeroAdAdminPanelProps {
  initialAds: HeroAd[];
}

const ICON_OPTIONS: { value: HeroAdIconType; label: string; icon: React.ReactNode }[] = [
  { value: 'verified', label: 'موثّق', icon: <BadgeCheck size={16} /> },
  { value: 'offer', label: 'عرض', icon: <Tag size={16} /> },
  { value: 'new', label: 'جديد', icon: <Sparkles size={16} /> },
];

const MEDIA_TYPE_OPTIONS: { value: HeroAdMediaType; label: string; icon: React.ReactNode }[] = [
  { value: 'none', label: 'بدون وسائط', icon: <X size={16} /> },
  { value: 'image', label: 'صورة', icon: <ImageIcon size={16} /> },
  { value: 'gif', label: 'GIF', icon: <Gift size={16} /> },
  { value: 'video', label: 'فيديو', icon: <Video size={16} /> },
];

const DEFAULT_FORM: HeroAdFormValues = {
  title: '',
  description: '',
  tag_text: '',
  action_url: '',
  icon_type: null,
  media_url: '',
  media_type: 'none',
  is_active: true,
  order_index: 0,
};

export default function HeroAdAdminPanel({ initialAds }: HeroAdAdminPanelProps) {
  const router = useRouter();
  const [ads, setAds] = useState<HeroAd[]>(initialAds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroAd | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<HeroAdFormValues>(DEFAULT_FORM);

  const uploader = useImageUpload({
    folder: 'hero-ads',
    maxImages: 1,
    initialImages: formValues.media_url ? [formValues.media_url] : [],
    initialPublicIds: formValues.media_url ? [extractCloudinaryPublicId(formValues.media_url)] : [],
    // Disable compression for GIFs/Videos to avoid corrupting them
    compression: false 
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormValues(DEFAULT_FORM);
    uploader.clearImages();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HeroAd) => {
    setEditingItem(item);
    setFormValues({
      title: item.title,
      description: item.description || '',
      tag_text: item.tag_text || '',
      action_url: item.action_url,
      icon_type: item.icon_type,
      media_url: item.media_url || '',
      media_type: item.media_type,
      is_active: item.is_active,
      order_index: item.order_index,
    });
    uploader.clearPending(); // Clear any pending files from previous interactions
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalMediaUrl = formValues.media_url;

      if (formValues.media_type !== 'none') {
        const uploadResult = await uploader.startUpload();
        if (uploadResult.urls.length > 0) {
          finalMediaUrl = uploadResult.urls[0];
        } else {
          // If media is required but missing
          toast.error('الرجاء اختيار ملف أو الانتظار حتى يكتمل الرفع');
          setIsSubmitting(false);
          return;
        }
      }

      const payload: HeroAdFormValues = {
        ...formValues,
        description: formValues.description || undefined,
        tag_text: formValues.tag_text || undefined,
        media_url: formValues.media_type !== 'none' ? finalMediaUrl : undefined,
        icon_type: formValues.icon_type || undefined,
      };

      if (editingItem) {
        const updated = await updateHeroAd(editingItem.id, payload);
        setAds(prev => prev.map(a => (a.id === editingItem.id ? updated : a)));
        toast.success('تم تحديث الإعلان بنجاح');
      } else {
        const created = await createHeroAd(payload);
        setAds(prev => [created, ...prev]);
        toast.success('تم إضافة الإعلان بنجاح');
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: HeroAd) => {
    try {
      const updated = await updateHeroAd(item.id, { is_active: !item.is_active });
      setAds(prev => prev.map(a => (a.id === item.id ? updated : a)));
      toast.success(updated.is_active ? 'تم تفعيل الإعلان' : 'تم تعطيل الإعلان');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'حدث خطأ ما');
    }
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteHeroAd(idToDelete);
      setAds(prev => prev.filter(a => a.id !== idToDelete));
      toast.success('تم حذف الإعلان');
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
      setIdToDelete(null);
    }
  };

  const getMediaIcon = (type: HeroAdMediaType) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} className="text-primary" />;
      case 'video': return <Video size={14} className="text-warning" />;
      case 'gif': return <Gift size={14} className="text-success" />;
      default: return null;
    }
  };

  const getIconLabel = (type: HeroAdIconType | null) => {
    if (!type) return null;
    const found = ICON_OPTIONS.find(o => o.value === type);
    return found ? (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md border border-primary/20">
        {found.icon} {found.label}
      </span>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة إعلانات الهيرو</h2>
          <p className="text-text-muted mt-1">تحكم في البطاقات الإعلانية التي تظهر في قسم الهيرو الرئيسي</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus size={20} />
          إضافة إعلان جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-sm">إجمالي الإعلانات</p>
          <p className="text-2xl font-bold mt-1">{ads.length}</p>
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-sm">نشطة</p>
          <p className="text-2xl font-bold mt-1 text-success">{ads.filter(a => a.is_active).length}</p>
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-sm">معطّلة</p>
          <p className="text-2xl font-bold mt-1 text-error">{ads.filter(a => !a.is_active).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-elevated border-b border-border-subtle text-text-muted text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">العنوان</th>
                <th className="px-6 py-4 font-medium">الأيقونة</th>
                <th className="px-6 py-4 font-medium">الوسائط</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الترتيب</th>
                <th className="px-6 py-4 font-medium">الرابط</th>
                <th className="px-6 py-4 font-medium text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {ads.map(item => (
                <tr key={item.id} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.tag_text && (
                      <span className="text-xs text-primary mt-0.5 block">{item.tag_text}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getIconLabel(item.icon_type)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      {getMediaIcon(item.media_type)}
                      <span className="text-text-muted capitalize">
                        {item.media_type === 'none' ? '—' : item.media_type.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`flex items-center gap-1.5 text-sm ${item.is_active ? 'text-success' : 'text-text-muted'}`}
                    >
                      {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {item.is_active ? 'نشط' : 'معطّل'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{item.order_index}</td>
                  <td className="px-6 py-4">
                    <a
                      href={item.action_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={14} />
                      زيارة
                    </a>
                  </td>
                  <td className="px-6 py-4 text-left space-x-reverse space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-text-muted hover:text-primary transition-colors"
                      title="تعديل"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-2 text-text-muted hover:text-error transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle size={32} className="opacity-20" />
                      <p>لا توجد إعلانات هيرو حالياً</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'تعديل الإعلان' : 'إضافة إعلان هيرو جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title + Order */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1.5">العنوان *</label>
                  <input
                    required
                    type="text"
                    value={formValues.title}
                    onChange={e => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="عنوان الإعلان..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">الترتيب</label>
                  <input
                    type="number"
                    value={formValues.order_index}
                    onChange={e => setFormValues(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">الوصف (اختياري)</label>
                <textarea
                  rows={2}
                  value={formValues.description || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="وصف قصير..."
                />
              </div>

              {/* Tag + Icon Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">نص التاج (اختياري)</label>
                  <input
                    type="text"
                    value={formValues.tag_text || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, tag_text: e.target.value }))}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="مثال: عرض حصري"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">نوع الأيقونة</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormValues(prev => ({ ...prev, icon_type: null }))}
                      className={`flex-1 py-2 rounded-lg border text-xs transition-all ${!formValues.icon_type ? 'bg-primary/10 border-primary text-primary' : 'border-border-subtle text-text-muted hover:border-primary/50'}`}
                    >
                      لا شيء
                    </button>
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormValues(prev => ({ ...prev, icon_type: opt.value }))}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-xs transition-all ${formValues.icon_type === opt.value ? 'bg-primary/10 border-primary text-primary' : 'border-border-subtle text-text-muted hover:border-primary/50'}`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action URL */}
              <div>
                <label className="block text-sm font-medium mb-1.5">رابط الزر (CTA) *</label>
                <input
                  required
                  type="text"
                  value={formValues.action_url}
                  onChange={e => setFormValues(prev => ({ ...prev, action_url: e.target.value }))}
                  className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="/places أو https://..."
                />
              </div>

              {/* Media Type */}
              <div>
                <label className="block text-sm font-medium mb-1.5">نوع الوسائط</label>
                <div className="flex gap-2">
                  {MEDIA_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormValues(prev => ({ ...prev, media_type: opt.value, media_url: opt.value === 'none' ? '' : prev.media_url }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm transition-all ${formValues.media_type === opt.value ? 'bg-primary/10 border-primary text-primary font-medium' : 'border-border-subtle text-text-muted hover:border-primary/50'}`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media URL (conditional) */}
              {formValues.media_type !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    رفع {formValues.media_type === 'image' ? 'الصورة' : formValues.media_type === 'gif' ? 'الـ GIF' : 'الفيديو'} *
                  </label>
                  
                  {formValues.media_type === 'video' ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={e => e.target.files && uploader.uploadFiles(e.target.files)}
                          className="flex-1 bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        {uploader.images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              uploader.clearImages();
                              setFormValues(prev => ({ ...prev, media_url: '' }));
                            }}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="حذف الملف"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                      {uploader.error && (
                        <p className="text-error text-xs">{uploader.error}</p>
                      )}
                      {uploader.images.length > 0 && (
                        <div className="rounded-lg overflow-hidden border border-border-subtle bg-elevated relative group">
                          <video
                            src={uploader.images[0]}
                            controls
                            className="w-full max-h-48"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-[300px] mx-auto mt-2">
                      <ImageUploader
                        images={uploader.images}
                        onFileChange={e => {
                          if (e.target.files) {
                            uploader.uploadFiles(e.target.files);
                          }
                        }}
                        onDeleteImage={async (index) => {
                          await uploader.deleteImage(index);
                          if (uploader.images.length <= 1) { // If it was the last one
                             setFormValues(prev => ({ ...prev, media_url: '' }));
                          }
                        }}
                        isUploading={uploader.isBusy}
                        maxImages={1}
                        error={uploader.error}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Is Active */}
              <div>
                <label className="block text-sm font-medium mb-1.5">الحالة</label>
                <button
                  type="button"
                  onClick={() => setFormValues(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${formValues.is_active ? 'bg-success/10 border-success text-success' : 'bg-text-muted/10 border-border-subtle text-text-muted'}`}
                >
                  {formValues.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {formValues.is_active ? 'نشط' : 'معطّل'}
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || uploader.isBusy}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {(isSubmitting || uploader.isBusy) && <Loader2 size={18} className="animate-spin" />}
                  {uploader.isUploading ? 'جاري الرفع...' : editingItem ? 'حفظ التغييرات' : 'إضافة الإعلان'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-elevated border border-border-subtle py-2.5 rounded-lg hover:bg-border-subtle/50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">هل أنت متأكد؟</h3>
              <p className="text-text-muted mb-6">
                هل تريد حقاً حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 bg-error text-white py-2.5 rounded-lg hover:bg-error/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  نعم، احذف
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-elevated border border-border-subtle py-2.5 rounded-lg hover:bg-border-subtle/50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to extract Cloudinary public ID for deletion
function extractCloudinaryPublicId(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return '';
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return '';
    const path = parts[1];
    const withoutVersion = path.replace(/^v\d+\//, '');
    const lastDotIndex = withoutVersion.lastIndexOf('.');
    return lastDotIndex !== -1 ? withoutVersion.substring(0, lastDotIndex) : withoutVersion;
  } catch {
    return '';
  }
}

