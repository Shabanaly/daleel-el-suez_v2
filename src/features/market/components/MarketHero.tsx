"use client";
import { motion } from "framer-motion";

export default function MarketHero() {
    return (
        <section className="pt-12 md:pt-24 pb-8 md:pb-16 text-center px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-3xl md:text-6xl lg:text-8xl font-black text-text-primary tracking-tighter leading-tight mb-4 md:mb-6">
                    سوق <span className="text-primary drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)]">السويس</span>
                </h1>
                <p className="text-sm md:text-2xl text-text-muted font-bold max-w-2xl mx-auto leading-relaxed">
                    المنصة الأولى للبيع والشراء في مدينة السويس.<br className="hidden md:block"/> كل اللي بتدور عليه في مكان واحد.
                </p>
            </motion.div>
        </section>
    );
}
