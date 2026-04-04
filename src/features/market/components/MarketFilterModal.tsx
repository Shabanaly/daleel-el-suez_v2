import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Check, RotateCcw } from 'lucide-react';
import { MarketSortOption } from '../hooks/useMarketFilter';
import { AreaWithDistrict } from '@/features/taxonomy/actions/areas';

interface MarketFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDistrict: string;
    initialArea: string;
    initialSort: MarketSortOption;
    districts: { id: number; name: string }[];
    getAvailableAreas: (districtName: string) => AreaWithDistrict[];
    onApply: (filters: { district: string; area: string; sort: MarketSortOption }) => void;
    onClear: () => void;
}

export const MarketFilterModal = memo(function MarketFilterModal({
    isOpen,
    onClose,
    initialDistrict,
    initialArea,
    initialSort,
    districts,
    getAvailableAreas,
    onApply,
    onClear
}: MarketFilterModalProps) {
    const [localDistrict, setLocalDistrict] = useState(initialDistrict);
    const [localArea, setLocalArea] = useState(initialArea);
    const [localSort, setLocalSort] = useState<MarketSortOption>(initialSort);

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalDistrict(initialDistrict);
            setLocalArea(initialArea);
            setLocalSort(initialSort);
        }
    }, [isOpen, initialDistrict, initialArea, initialSort]);

    const availableAreas = getAvailableAreas(localDistrict);

    const handleDistrictChange = (name: string) => {
        setLocalDistrict(name);
        setLocalArea('كل المناطق');
    };

    const handleApply = () => {
        onApply({
            district: localDistrict,
            area: localArea,
            sort: localSort
        });
    };

    const handleClear = () => {
        setLocalDistrict('كل الأحياء');
        setLocalArea('كل المناطق');
        setLocalSort('newest');
        onClear();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:max-h-[85vh] bg-surface dark:bg-elevated border border-border-subtle rounded-[32px] shadow-2xl z-101 flex flex-col overflow-hidden"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-surface/50 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Filter className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-text-primary">تصفية النتائج</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-surface-active text-text-muted transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-border">
                            
                            {/* District Selection */}
                            <section>
                                <label className="text-xs font-black text-text-secondary mb-4 block uppercase tracking-widest">تصفية حسب الحي</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleDistrictChange('كل الأحياء')}
                                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${localDistrict === 'كل الأحياء'
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-surface/50 text-text-muted border-border-subtle hover:border-primary/30 hover:text-text-primary'
                                            }`}
                                    >
                                        {localDistrict === 'كل الأحياء' && <Check className="w-4 h-4" />}
                                        كل الأحياء
                                    </button>
                                    {districts.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => handleDistrictChange(d.name)}
                                            className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${localDistrict === d.name
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-surface/50 text-text-muted border-border-subtle hover:border-primary/30 hover:text-text-primary'
                                                }`}
                                        >
                                            {localDistrict === d.name && <Check className="w-4 h-4" />}
                                            {d.name}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Area Selection */}
                            <section>
                                <label className="text-xs font-black text-text-secondary mb-4 block uppercase tracking-widest">المنطقة</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setLocalArea('كل المناطق')}
                                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${localArea === 'كل المناطق'
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-surface/50 text-text-muted border-border-subtle hover:border-primary/30 hover:text-text-primary'
                                            }`}
                                    >
                                        {localArea === 'كل المناطق' && <Check className="w-4 h-4" />}
                                        كل المناطق
                                    </button>
                                    {availableAreas.map(area => (
                                        <button
                                            key={area.id}
                                            onClick={() => setLocalArea(area.name)}
                                            className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${localArea === area.name
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-surface/50 text-text-muted border-border-subtle hover:border-primary/30 hover:text-text-primary'
                                                }`}
                                        >
                                            {localArea === area.name && <Check className="w-4 h-4" />}
                                            {area.name}
                                        </button>
                                    ))}
                                </div>
                                {availableAreas.length === 0 && localDistrict !== 'كل الأحياء' && (
                                    <p className="text-xs text-text-muted mt-3 italic text-center">لا توجد مناطق مدرجة لهذا الحي حالياً</p>
                                )}
                            </section>

                            {/* Sort Order */}
                            <section>
                                <label className="text-xs font-black text-text-secondary mb-4 block uppercase tracking-widest">ترتيب النتائج حسب</label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { value: 'newest', label: 'الأحدث (أضيف مؤخراً)' },
                                        { value: 'cheapest', label: 'الأرخص (أقل سعر)' },
                                        { value: 'expensive', label: 'الأغلى (أعلى سعر)' },
                                        { value: 'trending', label: 'الأكثر رواجاً (ترشيحات الجمهور)' }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLocalSort(opt.value as MarketSortOption)}
                                            className={`px-5 py-4 rounded-2xl text-right transition-all duration-300 border flex items-center justify-between ${localSort === opt.value
                                                ? 'bg-accent/10 text-accent border-accent/30 shadow-md'
                                                : 'bg-surface/30 text-text-muted border-border-subtle hover:border-accent/20'
                                                }`}
                                        >
                                            <span className="font-bold text-sm">{opt.label}</span>
                                            {localSort === opt.value && <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer - Actions */}
                        <div className="p-6 border-t border-border-subtle bg-surface/50 backdrop-blur flex items-center gap-4">
                            <button
                                onClick={handleClear}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-border-subtle text-text-secondary font-black text-sm flex items-center justify-center gap-2 hover:bg-surface-active transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                تفريغ الكل
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-2 py-4 px-6 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                تطبيق الفرز
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});
