'use client';

import { useState } from 'react';
import { Place } from '@/lib/types/places';
import { updatePlaceBasicInfo } from '@/lib/actions/business';
import { Link as LinkIcon, Check, X, RotateCcw, Plus } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter } from 'next/navigation';

interface SocialLink {
    platform: string;
    url: string;
}

interface SocialLinksManagerProps {
    place: Place;
}

const PLATFORMS = [
    { id: 'facebook', label: 'فيسبوك' },
    { id: 'instagram', label: 'انستجرام' },
    { id: 'website', label: 'الموقع الإلكتروني' },
];

export function SocialLinksManager({ place }: SocialLinksManagerProps) {
    const router = useRouter();
    const { showAlert, showConfirm } = useDialog();

    const initialLinks: SocialLink[] = place.socialLinks || [];
    const [links, setLinks] = useState<SocialLink[]>(initialLinks);
    const [isSaving, setIsSaving] = useState(false);
    
    const isDirty = JSON.stringify(links) !== JSON.stringify(initialLinks);

    const handleAddLink = () => {
        setLinks(prev => [...prev, { platform: 'facebook', url: '' }]);
    };

    const handleRemoveLink = (indexToRemove: number) => {
        setLinks(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
        setLinks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSave = async () => {
        // Validation
        const hasEmptyUrls = links.some(l => !l.url.trim());
        if (hasEmptyUrls) {
            showAlert({ title: 'روابط مفقودة', message: 'تأكد من إدخال الرابط لكل المنصات المضافة أو احذف المنصة الفارغة.', type: 'error' });
            return;
        }

        setIsSaving(true);
        const result = await updatePlaceBasicInfo(place.id, 'social_links', links);
        setIsSaving(false);

        if (result.success) {
            showAlert({ title: 'تم الحفظ', message: 'تم حفظ روابط التواصل بنجاح.', type: 'success' });
            router.refresh();
        } else {
            showAlert({ title: 'خطأ', message: result.error || 'حدث خطأ غير متوقع.', type: 'error' });
        }
    };

    const handleReset = () => {
        showConfirm({
            title: 'تأكيد التراجع',
            message: 'هل أنت متأكد من رغبتك في إلغاء التغييرات غير المحفوظة؟',
            onConfirm: () => {
                setLinks(initialLinks);
            }
        });
    };

    return (
        <div className="border-b border-border-subtle last:border-0 py-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                    <LinkIcon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-text-muted uppercase tracking-wider">روابط التواصل الاجتماعي</span>
                {isDirty && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 mr-auto">
                        غير محفوظ
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {links.length > 0 ? (
                    <div className="space-y-3">
                        {links.map((link, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start w-full bg-surface-elevated/30 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-border-subtle/30 sm:border-0">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select
                                        value={link.platform}
                                        onChange={(e) => handleUpdateLink(index, 'platform', e.target.value)}
                                        className="flex-1 sm:w-32 h-11 bg-background border border-border-subtle rounded-xl px-2 text-sm focus:border-primary outline-none"
                                        disabled={isSaving}
                                    >
                                        {PLATFORMS.map(p => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleRemoveLink(index)}
                                        disabled={isSaving}
                                        className="h-11 w-11 flex sm:hidden items-center justify-center shrink-0 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2 w-full sm:flex-1">
                                    <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 w-full h-11 bg-background border border-border-subtle rounded-xl px-3 text-sm focus:border-primary outline-none transition-colors text-left"
                                        dir="ltr"
                                        disabled={isSaving}
                                    />
                                    <button 
                                        onClick={() => handleRemoveLink(index)}
                                        disabled={isSaving}
                                        className="h-11 w-11 hidden sm:flex items-center justify-center shrink-0 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-text-muted text-center py-2">لم تقم بإضافة أي روابط تواصل اجتماعي بعد.</p>
                )}

                <button
                    onClick={handleAddLink}
                    disabled={isSaving}
                    className="w-full h-11 bg-surface-elevated text-text-muted rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-dashed border-border-standard hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    اضغط هنا لإضافة رابط جديد
                </button>

                {/* Action Buttons */}
                {isDirty && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 h-10 bg-primary text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            حفظ
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isSaving}
                            className="h-10 px-4 bg-surface-elevated text-text-muted rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-border-subtle transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
