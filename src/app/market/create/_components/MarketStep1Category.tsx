'use client';

import React from 'react';
import { MarketCategory } from '@/lib/types/market';
import DynamicIcon from '@/components/common/DynamicIcon';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketStep1CategoryProps {
    categories: MarketCategory[];
    selectedId: string;
    onSelect: (id: string) => void;
    onNext: () => void;
}

export default function MarketStep1Category({
    categories,
    selectedId,
    onSelect,
    onNext
}: MarketStep1CategoryProps) {
    if (!categories || categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-text-primary">اختر القسم المناسب</h2>
                <p className="text-text-muted text-sm font-bold">ابدأ باختيار القسم اللي بيوصف إعلانك بالظبط</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {categories.map((cat) => {
                    const isActive = selectedId === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                onSelect(cat.id);
                                setTimeout(onNext, 400);
                            }}
                            className={`flex flex-row sm:flex-col items-center sm:justify-center gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all group relative overflow-hidden h-full ${
                                isActive 
                                    ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.01] sm:scale-[1.02]' 
                                    : 'border-border-subtle bg-surface hover:border-primary/30 hover:shadow-lg hover:bg-muted/30'
                            }`}
                        >
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                                isActive ? 'bg-primary text-white' : 'bg-muted text-text-muted group-hover:bg-primary/20 group-hover:text-primary'
                            }`}>
                                <DynamicIcon 
                                    name={cat.icon || 'ShoppingBag'} 
                                    className="w-6 h-6 sm:w-7 sm:h-7" 
                                    fallback={<ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />} 
                                />
                            </div>
                            <span className={`text-sm sm:text-base font-black text-right sm:text-center flex-1 sm:flex-none transition-colors ${isActive ? 'text-primary' : 'text-text-primary group-hover:text-primary'}`}>
                                {cat.name}
                            </span>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="active-check"
                                    className="absolute left-6 sm:left-auto sm:top-3 sm:right-3 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                >
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                </motion.div>
                            )}
                            
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/2 transition-colors pointer-events-none" />
                        </button>
                    );
                })}
            </div>
            
            {!selectedId && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold text-center animate-pulse">
                    برجاء اختيار أحد الأقسام أعلاه بصورة مباشرة للمتابعة
                </div>
            )}
        </div>
    );
}
