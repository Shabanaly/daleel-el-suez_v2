'use client';

import { DollarSign, Phone, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { MarketFormData } from './MarketStep1BasicInfo';

interface MarketStep2PricingContactProps {
    formData: MarketFormData;
    updateFormData: (data: Partial<MarketFormData>) => void;
    areas: { id: number; name: string }[];
    onNext: () => void;
    onBack: () => void;
    errors: Record<string, string>;
}

export function MarketStep2PricingContact({
    formData,
    updateFormData,
    areas,
    onNext,
    onBack,
    errors
}: MarketStep2PricingContactProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-text-primary">السعر والتواصل</h3>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-border-subtle/50 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">السعر المطلوب</label>
                        <div className="relative">
                            <input 
                                type="text"
                                inputMode="numeric"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => updateFormData({ price: e.target.value })}
                                className={`w-full h-14 pr-14 pl-6 rounded-2xl bg-background border ${errors.price ? 'border-red-500' : 'border-border-subtle'} font-black text-lg focus:border-primary transition-all outline-none`}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm pointer-events-none">ج.م</div>
                        </div>
                        
                        {/* Negotiable Toggle */}
                        <div className="flex items-center gap-3 mt-4 mr-2">
                            <button
                                type="button"
                                onClick={() => updateFormData({ isNegotiable: !formData.isNegotiable })}
                                className={`w-12 h-6 rounded-full transition-all relative ${formData.isNegotiable ? 'bg-primary' : 'bg-border-subtle'}`}
                            >
                                <motion.div 
                                    animate={{ x: formData.isNegotiable ? 24 : 4 }}
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                />
                            </button>
                            <span className="text-xs font-bold text-text-primary">السعر قابل للتفاوض</span>
                        </div>

                        {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.price}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">رقم الهاتف للتواصل</label>
                        <div className="relative">
                            <input 
                                type="tel"
                                placeholder="01xxxxxxxxx"
                                value={formData.phone}
                                onChange={(e) => updateFormData({ phone: e.target.value })}
                                className={`w-full h-14 pl-14 pr-6 rounded-2xl bg-background border ${errors.phone ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none`}
                                dir="ltr"
                            />
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        </div>
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.phone}</p>}
                    </div>
                </div>

                {/* Area */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted mr-2 uppercase tracking-wide">المنطقة</label>
                    <div className="relative">
                        <select 
                            value={formData.areaId}
                            onChange={(e) => updateFormData({ areaId: e.target.value })}
                            className={`w-full h-14 px-12 rounded-2xl bg-background border ${errors.areaId ? 'border-red-500' : 'border-border-subtle'} font-bold focus:border-primary transition-all text-sm outline-none appearance-none`}
                        >
                            <option value="">اختر المنطقة</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.name}</option>
                            ))}
                        </select>
                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    {errors.areaId && <p className="text-red-500 text-[10px] font-bold mt-1 mr-2">{errors.areaId}</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="h-14 px-8 rounded-2xl bg-surface border border-border-subtle text-text-primary font-black text-sm flex items-center gap-3 hover:bg-elevated transition-all w-full sm:w-auto justify-center"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
                >
                    <span>التالي</span>
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
