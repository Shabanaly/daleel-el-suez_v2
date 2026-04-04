'use client';

import { DashboardPlaceCard } from './DashboardPlaceCard';
import { LayoutDashboard, Plus, PlusCircle, Store } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/features/places/types';
import { AppBar } from '@/components/ui/AppBar';

interface ManageBusinessesClientProps {
    places: Place[];
}

export function ManageBusinessesClient({ places }: ManageBusinessesClientProps) {
    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            <AppBar 
                title="إدارة أعمالي" 
                backHref="/profile" 
            />

            <div className="max-w-5xl mx-auto px-4 md:px-12 pt-14 md:pt-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">إدارة أعمالي</h1>
                        <p className="text-sm md:text-base text-text-muted font-bold opacity-70 mt-1">اختر النشاط الذي ترغب في إدارته وتعديل تفاصيله</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <Link
                            href="/places/add"
                            className="bg-primary text-white px-6 h-12 rounded-2xl hidden lg:flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex-1 md:flex-none text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة نشاط جديد
                        </Link>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {places.length > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {places.map((place) => (
                                    <DashboardPlaceCard key={place.id} place={place} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-surface border border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center p-8 shadow-sm"
                            >
                                <div className="w-24 h-24 bg-elevated rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-border-subtle/50">
                                    <Store className="w-10 h-10 text-text-muted/20" />
                                </div>
                                <h3 className="text-2xl font-black text-text-primary mb-3">ليس لديك أنشطة تديرها بعد</h3>
                                <p className="text-text-muted font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                                    هل تمتلك محلاً أو تقدم خدمة في السويس؟ أضف نشاطك الآن للتواصل مع آلاف الزبائن في الدليل.
                                </p>
                                <Link 
                                    href="/places/add"
                                    className="bg-primary text-white px-10 h-16 rounded-xl flex items-center gap-3 font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all outline-none"
                                >
                                    <PlusCircle className="w-6 h-6" />
                                    أضف نشاطك الآن
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-6 left-6 z-40">
                <Link
                    href="/places/add"
                    className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50 active:scale-90 transition-all border-2 border-white/20"
                >
                    <Plus className="w-8 h-8 font-black" />
                </Link>
            </div>
        </div>
    );
}
