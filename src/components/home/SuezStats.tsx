'use client';

import { motion } from 'framer-motion';
import { Target, Users, Map, ShieldCheck } from 'lucide-react';

const stats = [
    {
        id: 1,
        label: 'أماكن موثقة',
        value: '١٢٠٠+',
        icon: <ShieldCheck className="w-6 h-6" />,
        color: 'text-primary'
    },
    {
        id: 2,
        label: 'زائر شهرياً',
        value: '٥٠ ألف',
        icon: <Users className="w-6 h-6" />,
        color: 'text-accent'
    },
    {
        id: 3,
        label: 'منطقة نغطيها',
        value: '١٥+',
        icon: <Map className="w-6 h-6" />,
        color: 'text-primary'
    }
];

export default function SuezStats() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-20 relative overflow-hidden">
            {/* Background glow lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border-subtle to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border-subtle to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex flex-col items-center text-center group"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-surface/50 backdrop-blur-md border border-border-subtle/50 flex items-center justify-center mb-6 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/5 group-hover:border-primary/20 transition-all duration-300 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-text-primary mb-2 tracking-tighter">
                            {stat.value}
                        </h3>
                        <p className="text-text-muted font-bold text-sm md:text-base uppercase tracking-widest opacity-60">
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
