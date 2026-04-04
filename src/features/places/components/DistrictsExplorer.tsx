'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface District {
    id: string | number;
    name: string;
    icon: string;
    count: number | string;
}

export default function DistrictsExplorer({ districts }: { districts: District[] }) {
    const router = useRouter();

    const handleDistrictClick = (name: string) => {
        router.push(`/places?district=${encodeURIComponent(name)}`);
    };

    if (!districts || districts.length === 0) return null;

    return (
        <section className="w-full pt-0 pb-8 md:pt-0 md:pb-16 px-4 md:px-6 overflow-hidden relative border-t border-border-subtle/30">
            {/* Header */}
            <SectionHeader
                title="الأحياء"
                subtitle="استكشف حيك الآن"
                icon={Map}
                href="/"
                viewAllText=""
            />

            {/* Scroll Container */}
            <div className="relative w-full group">
                {/* Scroll Gradients/Shadows */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-r from-base to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-l from-base to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div
                    className="flex overflow-x-auto md:overflow-x-visible hide-scrollbar gap-4 md:gap-6 px-6 md:px-4 pb-8 md:pb-0 scroll-smooth snap-x snap-mandatory md:justify-center"
                >
                    {districts.map((district, idx: number) => (
                        <motion.div
                            key={district.id}
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleDistrictClick(district.name)}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            className="shrink-0 snap-center first:ms-4 last:me-4 md:first:ms-0 md:last:me-0"
                        >
                            <div className="w-32 h-40 md:w-44 md:h-56 rounded-[32px] md:rounded-[40px] border border-border-subtle bg-surface/40 backdrop-blur-md p-4 md:p-6 flex flex-col items-center justify-center transition-all duration-500 hover:border-primary/40 hover:bg-surface hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.12)] cursor-pointer select-none relative overflow-hidden group/card">
                                {/* Subtle internal glow */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                                <div className="text-3xl md:text-4xl mb-3 md:mb-4 transform group-hover/card:scale-110 transition-transform duration-500">
                                    {district.icon}
                                </div>
                                <h3 className="text-sm md:text-lg font-black text-text-primary mb-1 md:mb-2 text-center leading-tight">
                                    {district.name.replace('حي ', '')}
                                </h3>
                                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold ring-1 ring-primary/20">
                                    {district.count}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Hint */}
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                className="text-center text-[10px] font-medium text-text-muted mt-2 md:hidden italic"
            >
                اسحب لليسار للاستكشاف المزيد ←
            </motion.p>
        </section>
    );
}
