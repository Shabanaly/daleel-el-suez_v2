'use client';

import { motion } from 'framer-motion';
import { Ship, Anchor, Waves, Info, Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';
import Image from 'next/image';

const SUEZ_HIGHLIGHTS = [
    { title: "قناة السويس", description: "شريان الحياة العالمي وأهم ممر ملاحي في العالم.", icon: <Ship className="w-5 h-5 text-blue-500" /> },
    { title: "بورتوفيق", description: "جمال الميناء التاريخي والمنظر الخلاب للقناة.", icon: <Anchor className="w-5 h-5 text-accent" /> },
    { title: "العين السخنة", description: "أجمل الشواطئ والمنتجعات السياحية العالمية.", icon: <Waves className="w-5 h-5 text-cyan-500" /> },
];

const OUR_SERVICES = [
    { title: "دليل الأماكن", icon: <Info className="w-4 h-4" /> },
    { title: "سوق السويس", icon: <Sparkles className="w-4 h-4" /> },
    { title: "مجتمع تفاعلي", icon: <Heart className="w-4 h-4" /> },
    { title: "توثيق معتمد", icon: <ShieldCheck className="w-4 h-4" /> },
];

export default function LeftSidebar() {
    return (
        <aside className="hidden xl:flex fixed top-[72px] left-0 z-40 w-72 h-[calc(100vh-72px)] flex-col bg-surface/50 dark:bg-base/50 backdrop-blur-2xl border-r border-border-subtle shadow-[-20px_0_50px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto custom-scrollbar">

                {/* Suez Highlights Animated Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Zap className="w-4 h-4 text-accent animate-pulse" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">اكتشف السويس</h2>
                    </div>

                    <div className="space-y-3">
                        {SUEZ_HIGHLIGHTS.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-4 rounded-2xl bg-elevated/40 border border-accent/20 hover:border-accent/40 shadow-[0_0_12px_rgba(234,179,8,0.05)] transition-all hover:bg-elevated cursor-default"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-base border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-text-primary mb-1">{item.title}</h3>
                                        <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Services Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">خدمات الدليل</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {OUR_SERVICES.map((service, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="p-3 rounded-xl bg-base border border-border-subtle flex flex-col items-center gap-2 text-center group transition-colors hover:border-primary-500/30"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    {service.icon}
                                </div>
                                <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary">{service.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Promotional Animated Banner */}
                <div className="mt-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl p-4 bg-linear-to-br from-primary-600 to-accent text-white overflow-hidden group shadow-lg shadow-primary-500/20"
                    >
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 0 L100 0 L100 100 Z" fill="currentColor" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <h4 className="text-xs font-black mb-1">أضف عملك الآن!</h4>
                            <p className="text-[9px] text-white/80 font-bold mb-3 leading-tight">اجعل مكانك جزءاً من أكبر مجتمع رقمي في مدينة السويس.</p>
                            <button className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-black tracking-tight transition-all active:scale-95 border border-white/20">
                                ابدأ مجاناً
                            </button>
                        </div>
                    </motion.div>
                </div>

            </div>
        </aside>
    );
}
