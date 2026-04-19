"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Announcement, AnnouncementFormValues } from "../types";
import { 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from "../actions";
import { toast } from "react-hot-toast";

interface AnnouncementAdminPanelProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementAdminPanel({ initialAnnouncements }: AnnouncementAdminPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState<AnnouncementFormValues>({
    content: "",
    label: "هام",
    link: "",
    is_active: true,
    order_index: 0
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormValues({ content: "", label: "هام", link: "", is_active: true, order_index: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormValues({
      content: item.content,
      label: item.label || "هام",
      link: item.link || "",
      is_active: item.is_active,
      order_index: item.order_index
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingItem) {
        const updated = await updateAnnouncement(editingItem.id, formValues);
        setAnnouncements(prev => prev.map(a => a.id === editingItem.id ? updated : a));
        toast.success("تم تحديث الإعلان بنجاح");
      } else {
        const created = await createAnnouncement(formValues);
        setAnnouncements(prev => [created, ...prev]);
        toast.success("تم إضافة الإعلان بنجاح");
      }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "حدث خطأ ما");
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleToggleActive = async (item: Announcement) => {
    try {
      const updated = await updateAnnouncement(item.id, { is_active: !item.is_active });
      setAnnouncements(prev => prev.map(a => a.id === item.id ? updated : a));
      toast.success(updated.is_active ? "تم تفعيل الإعلان" : "تم تعطيل الإعلان");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "حدث خطأ ما");
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
      await deleteAnnouncement(idToDelete);
      setAnnouncements(prev => prev.filter(a => a.id !== idToDelete));
      toast.success("تم حذف الإعلان");
      setIsDeleteModalOpen(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "حدث خطأ ما");
    } finally {
      setIsSubmitting(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الإعلانات</h2>
          <p className="text-text-muted">تحكم في الشريط المتحرك أعلى الموقع</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus size={20} />
          إضافة إعلان جديد
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-elevated border-b border-border-subtle text-text-muted text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">التصنيف</th>
                <th className="px-6 py-4 font-medium">المحتوى</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الترتيب</th>
                <th className="px-6 py-4 font-medium">الرابط</th>
                <th className="px-6 py-4 font-medium text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {announcements.map((item) => (
                <tr key={item.id} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md border border-primary/20">
                      {item.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="line-clamp-2">{item.content}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleToggleActive(item)}
                      className={`flex items-center gap-1.5 ${item.is_active ? 'text-success' : 'text-text-muted'}`}
                    >
                      {item.is_active ? (
                        <>
                          <ToggleRight size={20} />
                          <span>نشط</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} />
                          <span>غير نشط</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{item.order_index}</td>
                  <td className="px-6 py-4">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} />
                        زيارة
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs">لا يوجد</span>
                    )}
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
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle size={32} className="opacity-20" />
                      <p>لا توجد إعلانات حالياً</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingItem ? "تعديل الإعلان" : "إضافة إعلان جديد"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1.5">التصنيف (مثلاً: هام، عاجل)</label>
                  <input
                    required
                    type="text"
                    value={formValues.label}
                    onChange={e => setFormValues(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="هام"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1.5">الترتيب</label>
                  <input
                    type="number"
                    value={formValues.order_index}
                    onChange={e => setFormValues(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">محتوى الإعلان</label>
                <textarea
                  required
                  rows={3}
                  value={formValues.content}
                  onChange={e => setFormValues(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="أدخل نص الإعلان هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">الرابط (اختياري)</label>
                <input
                  type="url"
                  value={formValues.link || ""}
                  onChange={e => setFormValues(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1.5">الحالة</label>
                <button
                  type="button"
                  onClick={() => setFormValues(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    formValues.is_active 
                      ? 'bg-success/10 border-success text-success' 
                      : 'bg-text-muted/10 border-border-subtle text-text-muted'
                  }`}
                >
                  {formValues.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{formValues.is_active ? "نشط" : "غير نشط"}</span>
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {editingItem ? "حفظ التغييرات" : "إضافة الإعلان"}
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
