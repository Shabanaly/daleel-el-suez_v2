'use client';

import { useState } from 'react';
import { Clock, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { Place, DayKey, DaySchedule, WeeklySchedule } from '@/features/places/types';
import { updateWorkingHours } from '@/features/business/actions/business.server';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/providers/DialogProvider';

interface WorkingHoursManagerProps {
    place: Place;
}

const DAY_LABELS: Record<DayKey, string> = {
    saturday:  'السبت',
    sunday:    'الأحد',
    monday:    'الاثنين',
    tuesday:   'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday:  'الخميس',
    friday:    'الجمعة',
};

const DAY_ORDER: DayKey[] = [
    'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
];

const DEFAULT_SCHEDULE: WeeklySchedule = DAY_ORDER.reduce((acc, day) => {
    acc[day] = { isOpen: false, from: '09:00', to: '22:00' };
    return acc;
}, {} as WeeklySchedule);

function buildInitialState(place: Place) {
    const schedule = place.workingHours as WeeklySchedule;
    const sat = schedule?.saturday;
    
    const hasExisting = Boolean(sat);
    const is24 = hasExisting && sat.isOpen && sat.from === '00:00' && sat.to === '23:59';
    
    return {
        is24Hours: is24,
        fromTime: (is24 || !hasExisting || !sat.from) ? '09:00' : sat.from,
        toTime: (is24 || !hasExisting || !sat.to) ? '22:00' : sat.to
    };
}

export function WorkingHoursManager({ place }: WorkingHoursManagerProps) {
    const router = useRouter();
    const { showAlert } = useDialog();

    const initial = buildInitialState(place);
    const [is24Hours, setIs24Hours] = useState(initial.is24Hours);
    const [fromTime, setFromTime] = useState(initial.fromTime);
    const [toTime, setToTime] = useState(initial.toTime);
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isDirty = is24Hours !== initial.is24Hours || fromTime !== initial.fromTime || toTime !== initial.toTime;

    const handleSave = async () => {
        setIsSaving(true);
        
        // Build 7-day schedule payload
        const payload = DAY_ORDER.reduce((acc, day) => {
            acc[day] = {
                isOpen: true,
                from: is24Hours ? '00:00' : fromTime,
                to: is24Hours ? '23:59' : toTime
            };
            return acc;
        }, {} as WeeklySchedule);
        
        const result = await updateWorkingHours(place.id, payload as unknown as Record<string, unknown>);
        setIsSaving(false);

        if (result.success) {
            showAlert({ title: 'تم الحفظ', message: 'تم حفظ أوقات العمل بنجاح.', type: 'success' });
            router.refresh();
        } else {
            showAlert({ title: 'خطأ في الحفظ', message: result.error || 'حدث خطأ أثناء الحفظ.', type: 'error' });
        }
    };

    const handleReset = () => {
        setIs24Hours(initial.is24Hours);
        setFromTime(initial.fromTime);
        setToTime(initial.toTime);
    };

    return (
        <div className="border-b border-border-subtle last:border-0 py-5">
            {/* Header Row */}
            <button
                onClick={() => setIsExpanded(v => !v)}
                className="w-full flex items-center justify-between gap-4 group"
            >
                <div className="flex items-center gap-2 mb-0">
                    <span className="p-1.5 rounded-lg bg-surface-elevated text-text-muted">
                        <Clock className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-black text-text-muted uppercase tracking-wider">ساعات العمل</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Summary chips */}
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${is24Hours ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                            {is24Hours ? 'مفتوح 24 ساعة' : `من ${fromTime} إلى ${toTime}`}
                        </span>
                        {isDirty && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                                غير محفوظ
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-2">
                            <div className="bg-surface-elevated/50 border border-border-subtle/50 rounded-[28px] overflow-hidden">
                                <label 
                                    onClick={(e) => { e.preventDefault(); setIs24Hours(!is24Hours); }}
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-elevated transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-primary">مفتوح 24 ساعة</span>
                                        <span className="text-[10px] font-bold text-text-muted mt-0.5">المكان يعمل طوال اليوم بدون إغلاق</span>
                                    </div>
                                    <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${is24Hours ? 'bg-primary' : 'bg-text-muted/20'}`}>
                                        <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${is24Hours ? 'right-6' : 'right-1.5'}`} />
                                    </div>
                                </label>
                                
                                <AnimatePresence>
                                    {!is24Hours && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex gap-4 p-5 pt-0 border-t border-border-subtle/20 mt-2">
                                                <div className="flex-1 space-y-2">
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mr-2 block">وقت الفتح</span>
                                                    <input
                                                        type="time"
                                                        value={fromTime}
                                                        onChange={e => setFromTime(e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-background border border-border-subtle text-sm font-black focus:border-primary transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mr-2 block">وقت الإغلاق</span>
                                                    <input
                                                        type="time"
                                                        value={toTime}
                                                        onChange={e => setToTime(e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-background border border-border-subtle text-sm font-black focus:border-primary transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !isDirty}
                                    className="flex-1 h-11 bg-primary text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    {isSaving
                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <Check className="w-4 h-4" />
                                    }
                                    حفظ أوقات العمل
                                </button>
                                {isDirty && (
                                    <button
                                        onClick={handleReset}
                                        disabled={isSaving}
                                        className="h-11 px-4 bg-surface-elevated text-text-muted rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-border-subtle transition-all"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        تراجع
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
