'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Phone, Clock, Facebook, Instagram, Globe, MessageCircle
} from 'lucide-react';
import { Place, DayKey } from '@/lib/types/places';

interface PlaceInfoTabsProps {
    place: Place;
}

export function PlaceInfoTabs({ place }: PlaceInfoTabsProps) {
    const [activeTab, setActiveTab] = useState<'contact' | 'hours'>('contact');

    const daysMapping: { key: DayKey; label: string }[] = [
        { key: 'saturday', label: 'السبت' },
        { key: 'sunday', label: 'الأحد' },
        { key: 'monday', label: 'الاثنين' },
        { key: 'tuesday', label: 'الثلاثاء' },
        { key: 'wednesday', label: 'الأربعاء' },
        { key: 'thursday', label: 'الخميس' },
        { key: 'friday', label: 'الجمعة' },
    ];

    const formatTime = (schedule?: { isOpen?: boolean; is_open?: boolean; from?: string; to?: string; start?: string; end?: string }) => {
        if (!schedule) return 'مغلق';
        if (typeof schedule === 'string') return schedule;

        const isOpen = schedule.isOpen !== undefined ? schedule.isOpen : schedule.is_open;
        if (isOpen === false) return 'مغلق';

        const from = schedule.from || schedule.start;
        const to = schedule.to || schedule.end;

        if (!from || !to) return isOpen ? 'مفتوح' : 'مغلق';
        if (from === to) return '24 ساعة';

        return `من ${from} إلى ${to}`;
    };

    return (
        <section className="mb-16">
            {/* Tab Switcher - Traditional Look */}
            <div className="flex gap-8 px-6 -mb-px relative z-20">
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`pb-4 text-sm font-black transition-colors relative ${activeTab === 'contact' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                    معلومات التواصل
                    {activeTab === 'contact' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('hours')}
                    className={`pb-4 text-sm font-black transition-colors relative ${activeTab === 'hours' ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                    مواعيد العمل
                    {activeTab === 'hours' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                        />
                    )}
                </button>
            </div>

            {/* Content Card - Integrated */}
            <div className="rounded-[32px] glass-panel border border-border-subtle/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mt-12 blur-2xl" />

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {activeTab === 'contact' ? (
                                <div className="space-y-8 max-w-5xl mx-auto">
                                    {/* Direct Contact Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-4 group p-4 border border-border-subtle/20 rounded-2xl bg-surface/30">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-black text-text-primary text-sm mb-0.5">العنوان بالتفصيل</h4>
                                                <p className="text-text-muted text-[11px] font-bold opacity-70 leading-relaxed">{place.address}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-4 group p-4 border border-border-subtle/20 rounded-2xl bg-surface/30">
                                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/20">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <div className="text-right flex-1">
                                                    <h4 className="font-black text-text-primary text-md mb-1">أرقام الهاتف</h4>
                                                    <div className="flex flex-col gap-1 text-[14px]">
                                                        {typeof place.phoneNumber === 'object' ? (
                                                            <>
                                                                <p className="text-text-muted text-[14px] font-bold opacity-70 tracking-widest" dir="ltr">{place.phoneNumber.primary}</p>
                                                                {place.phoneNumber.others?.map((phone, idx) => (
                                                                    <p key={idx} className="text-text-muted text-[14px] font-bold opacity-70 tracking-widest" dir="ltr">{phone}</p>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <p className="text-text-muted text-[14px] font-bold opacity-70 tracking-widest" dir="ltr">{place.phoneNumber}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {place.phoneNumber.whatsapp && (
                                                <div className="flex items-center gap-4 group p-4 border border-border-subtle/20 rounded-2xl bg-surface/30">
                                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 border border-green-500/20">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-right flex-1">
                                                        <h4 className="font-black text-text-primary text-sm mb-0.5">واتساب</h4>
                                                        <p className="text-text-muted text-[14px] font-bold opacity-70 tracking-widest" dir="ltr">{place.phoneNumber.whatsapp}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    {place.socialLinks && place.socialLinks.length > 0 && (
                                        <div className="pt-8 border-t border-border-subtle/30">
                                            <h4 className="text-base font-black text-text-primary mb-6 text-right px-2">روابط التواصل</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {place.socialLinks.map((link, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-3 border border-border-subtle/20 rounded-2xl bg-surface/30 group">
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="nofollow noopener noreferrer"
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${link.platform === 'facebook' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white' :
                                                                link.platform === 'instagram' ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white' :
                                                                    'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white'
                                                                }`}
                                                        >
                                                            {link.platform === 'facebook' ? <Facebook className="w-4 h-4" /> :
                                                                link.platform === 'instagram' ? <Instagram className="w-4 h-4" /> :
                                                                    <Globe className="w-4 h-4" />}
                                                        </a>
                                                        <div className="text-right">
                                                            <h4 className="font-black text-text-primary mb-0.5 text-[11px]">
                                                                {link.platform === 'facebook' ? 'فيسبوك' :
                                                                    link.platform === 'instagram' ? 'انستجرام' :
                                                                        'الموقع الإلكتروني'}
                                                            </h4>
                                                            <a href={link.url} target="_blank" rel="nofollow noopener noreferrer" className={`text-[9px] font-black hover:underline ${link.platform === 'instagram' ? 'text-accent' : 'text-primary'
                                                                }`}>
                                                                زيارة {link.platform === 'facebook' ? 'فيسبوك' : link.platform === 'instagram' ? 'انستجرام' : 'موقعنا'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-6 justify-end px-2">
                                        <h4 className="text-lg font-black text-text-primary">مواعيد العمل</h4>
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                        {daysMapping.map(({ key, label }) => {
                                            // Case-insensitive lookup (handles "monday" or "Monday")
                                            const workingHours = place.workingHours as Record<string, { isOpen?: boolean; is_open?: boolean; from?: string; to?: string; start?: string; end?: string }>;
                                            const schedule = workingHours?.[key] ||
                                                workingHours?.[key.charAt(0).toUpperCase() + key.slice(1)];

                                            return (
                                                <div key={key} className="flex items-center justify-between py-3 px-2 rounded-xl bg-background/50 border border-border-subtle/20 group hover:border-primary/20 transition-colors">
                                                    <span className="font-black text-text-primary text-[11px]">{label}</span>
                                                    <span className="text-text-primary text-[11px]">|</span>
                                                    <span className={`text-[10px] font-black ${(schedule?.isOpen || schedule?.is_open) ? 'text-primary' : 'text-text-muted/40'}`}>
                                                        {formatTime(schedule)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!place.workingHours && (
                                        <div className="text-center py-8 opacity-50 bg-surface/20 rounded-2xl border border-dashed border-border-subtle/30">
                                            <p className="text-xs font-bold mb-1">لا توجد مواعيد مفصلة متاحة حالياً.</p>
                                            <p className="text-[10px]">{place.openHours}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
