'use client';

import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DISTRICTS = [
    { id: 'arbaeen', name: 'حي الأربعين', count: '١٢٠+ مكان', color: 'from-primary-600/20 to-primary-700/5' },
    { id: 'faisal', name: 'حي فيصل', count: '٨٥+ مكان', color: 'from-accent/20 to-accent/5' },
    { id: 'attaka', name: 'حي عتاقة', count: '٤٥+ مكان', color: 'from-primary-500/15 to-primary-800/5' },
    { id: 'suez', name: 'حي السويس', count: '٩٣+ مكان', color: 'from-[#0e7490]/20 to-[#0e7490]/5' },
    { id: 'ganayen', name: 'حي الجناين', count: '٣٤+ مكان', color: 'from-[#b45309]/20 to-[#b45309]/5' },
];

export default function DistrictsExplorer() {
    const router = useRouter();

    const handleDistrictClick = (name: string) => {
        router.push(`/places?area=${encodeURIComponent(name)}`);
    };

    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-16 mb-10 relative">
            <div className="text-center mb-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-600/10 border border-primary-600/20 shadow-[0_0_15px_rgba(8,145,178,0.15)] mb-4"
                >
                    <Map className="w-7 h-7 text-primary-500" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-3 tracking-tight">استكشف حيك</h2>
                <p className="text-text-muted text-lg">دليلك لكل الأماكن في مناطق وأحياء السويس</p>
            </div>

            <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 gap-4 md:gap-5 relative z-10 pb-6">
                {DISTRICTS.map((district, idx) => (
                    <motion.div
                        key={district.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        onClick={() => handleDistrictClick(district.name)}
                        className={`min-w-[150px] md:min-w-0 flex-1 group cursor-pointer`}
                    >
                        <div className="p-px rounded-[30px] bg-linear-to-b from-border-subtle to-transparent transition-all duration-300 group-hover:from-primary-500/40 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.2)]">
                            <div className={`h-40 md:h-48 flex flex-col items-center justify-center p-6 text-center rounded-[30px] bg-linear-to-b ${district.color} bg-surface group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden`}>

                                {/* Inner top glow effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary-400 opacity-15 rounded-b-full" />

                                <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 drop-shadow-md tracking-wide">{district.name}</h3>
                                <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">{district.count}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
