'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Tag, MapPin, ChevronDown, Search } from 'lucide-react';
import { Place } from '@/features/places/types';
import { updatePlaceTaxonomy } from '@/features/business/actions/business.server';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/providers/DialogProvider';

interface TaxonomyEditorProps {
    place: Place;
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
}

interface CustomSelectProps {
    label: string;
    icon: React.ReactNode;
    currentId: number | undefined;
    currentName: string;
    options: { id: number; name: string }[];
    onSave: (id: number) => Promise<void>;
    placeholder?: string;
}

function CustomSelect({ label, icon, currentId, currentName, options, onSave, placeholder = 'ابحث...' }: CustomSelectProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | undefined>(currentId);
    const [selectedName, setSelectedName] = useState<string>(currentName);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
        if (isOpen && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.name.includes(searchQuery)
    );

    const handleSelect = (opt: { id: number; name: string }) => {
        setSelectedId(opt.id);
        setSelectedName(opt.name);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleSave = async () => {
        if (!selectedId || selectedId === currentId) {
            setIsEditing(false);
            return;
        }
        setIsLoading(true);
        await onSave(selectedId);
        setIsLoading(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelectedId(currentId);
        setSelectedName(currentName);
        setIsOpen(false);
        setSearchQuery('');
        setIsEditing(false);
    };

    return (
        <div className="group border-b border-border-subtle last:border-0 py-5 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Label */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                            {icon}
                        </span>
                        <span className="text-xs font-black text-text-muted uppercase tracking-wider">{label}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="mt-2"
                            >
                                {/* Custom Dropdown Trigger */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(v => !v)}
                                        className="w-full h-12 bg-background border-2 border-primary/20 hover:border-primary/40 rounded-xl px-4 text-sm font-bold text-right flex items-center justify-between gap-2 transition-all outline-none focus:border-primary"
                                    >
                                        <span className={selectedName ? 'text-text-primary' : 'text-text-muted/50 font-medium'}>
                                            {selectedName || 'اختر من القائمة...'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Panel */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                                            >
                                                {/* Search box */}
                                                {options.length > 6 && (
                                                    <div className="p-2 border-b border-border-subtle">
                                                        <div className="relative">
                                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/50" />
                                                            <input
                                                                ref={searchRef}
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={e => setSearchQuery(e.target.value)}
                                                                placeholder={placeholder}
                                                                className="w-full h-9 bg-background rounded-lg pr-9 pl-3 text-xs font-bold text-text-primary placeholder:text-text-muted/40 border border-border-subtle focus:border-primary outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Options list */}
                                                <div className="max-h-52 overflow-y-auto py-1.5 overscroll-contain">
                                                    {filteredOptions.length === 0 ? (
                                                        <p className="text-center text-xs text-text-muted py-6 font-medium">لا توجد نتائج</p>
                                                    ) : (
                                                        filteredOptions.map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => handleSelect(opt)}
                                                                className={`w-full text-right px-4 py-2.5 text-sm font-bold transition-colors hover:bg-primary/5 flex items-center justify-between gap-2 ${opt.id === selectedId ? 'text-primary bg-primary/5' : 'text-text-primary'}`}
                                                            >
                                                                <span>{opt.name}</span>
                                                                {opt.id === selectedId && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading || !selectedId || selectedId === currentId}
                                        className="bg-primary text-white h-10 px-6 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {isLoading
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Check className="w-4 h-4" />}
                                        حفظ التغيير
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="bg-surface-elevated text-text-muted h-10 px-6 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-border-subtle transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        إلغاء
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-between group/val">
                                <p className="text-sm md:text-base font-bold text-text-primary px-1">
                                    {currentName || <span className="text-text-muted opacity-40 font-medium italic">لم يتم التحديد بعد...</span>}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                                    title="تعديل هذا الحقل"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export function TaxonomyEditor({ place, categories, areas }: TaxonomyEditorProps) {
    const router = useRouter();
    const { showAlert } = useDialog();

    const handleCategoryChange = async (categoryId: number) => {
        const result = await updatePlaceTaxonomy(place.id, { categoryId });
        if (!result.success) {
            showAlert({ title: 'فشل التحديث', message: `حدث خطأ: ${result.error}`, type: 'error' });
        } else {
            router.refresh();
        }
    };

    const handleAreaChange = async (areaId: number) => {
        const result = await updatePlaceTaxonomy(place.id, { areaId });
        if (!result.success) {
            showAlert({ title: 'فشل التحديث', message: `حدث خطأ: ${result.error}`, type: 'error' });
        } else {
            router.refresh();
        }
    };

    return (
        <>
            <CustomSelect
                label="التصنيف"
                icon={<Tag className="w-3.5 h-3.5" />}
                currentId={place.categoryId}
                currentName={place.category}
                options={categories}
                onSave={handleCategoryChange}
                placeholder="ابحث في التصنيفات..."
            />
            <CustomSelect
                label="المنطقة"
                icon={<MapPin className="w-3.5 h-3.5" />}
                currentId={place.areaId}
                currentName={place.area}
                options={areas}
                onSave={handleAreaChange}
                placeholder="ابحث في المناطق..."
            />
        </>
    );
}
