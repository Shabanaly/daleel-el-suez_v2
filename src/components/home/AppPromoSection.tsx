'use client';

import { motion } from 'framer-motion';
import { Apple, PlayCircle, Star, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

export default function AppPromoSection() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-24">
            <div className="w-full relative rounded-[40px] bg-linear-to-br from-elevated via-surface to-elevated border border-primary/20 overflow-hidden px-8 py-16 md:px-20 md:py-24 shadow-2xl shadow-primary/5">

                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-black mb-8 border border-accent/20"
                        >
                            <Zap className="w-3.5 h-3.5 fill-accent" /> قريباً على اندرويد وآيفون
                        </motion.div>

                        <h2 className="text-4xl md:text-6xl font-black text-text-primary leading-[1.1] mb-6">
                            دليل السويس معك <br />
                            <span className="text-primary italic">في كل خطوة</span>
                        </h2>

                        <p className="text-lg md:text-xl text-text-muted font-medium mb-10 max-w-xl mx-auto lg:mx-0 opacity-80 leading-relaxed">
                            احصل على أفضل تجربة من خلال تطبيقنا القادم. تنبيهات حية، عروض حصرية، وخرائط تفاعلية دقيقة لكل شبر في مدينتك.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-lg mx-auto lg:mx-0">
                            {[
                                { icon: <Star />, label: 'تقييمات موثوقة' },
                                { icon: <ShieldCheck />, label: 'بيانات دقيقة' },
                                { icon: <Zap />, label: 'أداء سريع جداً' }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center lg:items-end gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-background border border-border-subtle flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black text-text-primary">{feature.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-text-primary text-background hover:scale-105 active:scale-95 transition-all duration-300">
                                <Apple className="w-6 h-6 shrink-0 fill-current" />
                                <div className="text-right">
                                    <p className="text-[10px] opacity-70 font-bold mb-0.5 uppercase tracking-tighter">قريباً على</p>
                                    <p className="text-sm font-black tracking-tight">App Store</p>
                                </div>
                            </button>

                            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface border border-border-subtle hover:border-primary/30 hover:scale-105 active:scale-95 transition-all duration-300">
                                <PlayCircle className="w-6 h-6 shrink-0 fill-primary" />
                                <div className="text-right">
                                    <p className="text-[10px] opacity-70 font-bold mb-0.5 uppercase tracking-tighter">قريباً على</p>
                                    <p className="text-sm font-black tracking-tight text-text-primary">Google Play</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Mockup (Self-generated SVG-like visual) */}
                    <motion.div
                        initial={{ opacity: 0, rotate: 10, y: 50 }}
                        whileInView={{ opacity: 1, rotate: -5, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative w-[280px] h-[580px] shrink-0"
                    >
                        {/* iPhone Frame */}
                        <div className="absolute inset-0 rounded-[3rem] border-8 border-text-primary bg-background shadow-2xl overflow-hidden group">
                            {/* Screen Content Mockup */}
                            <div className="w-full h-full bg-background p-4 flex flex-col gap-4">
                                <div className="w-20 h-2 bg-text-muted/20 rounded-full mx-auto" />
                                <div className="w-full h-40 rounded-2xl bg-primary/10 border border-primary/20 animate-pulse" />
                                <div className="space-y-2">
                                    <div className="w-3/4 h-3 bg-text-primary/10 rounded-full" />
                                    <div className="w-1/2 h-4 bg-primary/20 rounded-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="aspect-square rounded-2xl bg-surface border border-border-subtle" />
                                    <div className="aspect-square rounded-2xl bg-surface border border-border-subtle" />
                                </div>
                                {/* Floating Profile Pic */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-2xl border-4 border-primary/20 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Zap className="w-6 h-6 fill-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Inner Shine */}
                            <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>

                        {/* External Elements */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -right-12 top-24 px-4 py-2 rounded-2xl bg-white dark:bg-elevated shadow-xl border border-primary/10 flex items-center gap-2"
                        >
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" />
                            </div>
                            <span className="text-[10px] font-black text-text-primary">أسرع تجربة تصفح</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
