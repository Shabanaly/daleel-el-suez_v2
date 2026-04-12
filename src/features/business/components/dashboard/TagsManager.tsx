'use client';

import { useState, useEffect, useRef } from 'react';
import { Place } from '@/features/places/types';
import { updatePlaceBasicInfo } from '@/features/business/actions/business.server';
import { Hash, Check, X, RotateCcw, Plus } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter } from 'next/navigation';

interface TagsManagerProps {
    place: Place;
}

export function TagsManager({ place }: TagsManagerProps) {
    const router = useRouter();
    const { showAlert, showConfirm } = useDialog();

    const [tags, setTags] = useState<string[]>(place.tags || []);
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state whenever the server refreshes the place prop
    const prevPlaceId = useRef(place.id);
    useEffect(() => {
        // Reset tags when place changes or after a successful save (router.refresh)
        setTags(place.tags || []);
        prevPlaceId.current = place.id;
    }, [place.id, place.tags]);

    const savedTags = place.tags || [];
    const isDirty = JSON.stringify(tags) !== JSON.stringify(savedTags);

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        
        if (tags.includes(trimmed)) {
            showAlert({ title: 'موجود مسبقاً', message: 'هذه الكلمة مضافة بالفعل.', type: 'error' });
            return;
        }

        setTags(prev => [...prev, trimmed]);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updatePlaceBasicInfo(place.id, 'tags', tags);
        setIsSaving(false);

        if (result.success) {
            showAlert({ title: 'تم الحفظ', message: 'تم حفظ الكلمات المفتاحية بنجاح.', type: 'success' });
            router.refresh();
        } else {
            showAlert({ title: 'خطأ', message: result.error || 'حدث خطأ متوقع.', type: 'error' });
        }
    };

    const handleReset = () => {
        showConfirm({
            title: 'تأكيد التراجع',
            message: 'هل أنت متأكد من رغبتك في إلغاء التغييرات غير المحفوظة؟',
            onConfirm: () => {
                setTags(savedTags);
                setInputValue('');
            }
        });
    };

    return (
        <div className="border-b border-border-subtle last:border-0 py-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                    <Hash className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-text-muted uppercase tracking-wider">الكلمات المفتاحية (Tags)</span>
                {isDirty && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 mr-auto">
                        غير محفوظ
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Input Area */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="أدخل كلمة مفتاحية واضغط Enter"
                        className="flex-1 h-11 bg-background border border-border-subtle rounded-xl px-4 text-sm focus:border-primary outline-none transition-colors"
                        disabled={isSaving}
                    />
                    <button
                        onClick={handleAddTag}
                        disabled={!inputValue.trim() || isSaving}
                        className="h-11 px-4 bg-surface-elevated text-text-muted rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-border-subtle transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Tags List */}
                {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span 
                                key={tag} 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold"
                            >
                                {tag}
                                <button 
                                    onClick={() => handleRemoveTag(tag)}
                                    className="p-0.5 hover:bg-primary/20 rounded-md transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-text-muted text-center py-2">لا يوجد كلمات مفتاحية مضافة، أضف البعض لتحسين ظهور مكانك في البحث.</p>
                )}

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
