'use client';

import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SuccessState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-panel p-10 rounded-[44px] text-center border-accent/20 shadow-2xl shadow-accent/10 mx-auto"
        >
            <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center text-accent mx-auto mb-8 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">تم الإرسال بنجاح!</h2>
            <p className="text-text-muted font-medium mb-8 leading-relaxed">
                شكراً لثقتك في دليل السويس. سنقوم بمراجعة بيانات نشاطك التجاري وتفعيله فوراً.
            </p>
            <Link
                href="/places"
                className="inline-flex h-14 px-8 rounded-2xl bg-accent text-white font-black items-center justify-center hover:bg-accent transition-all shadow-lg shadow-accent/25"
            >
                الرجوع للدليل
            </Link>
        </motion.div>
    );
}
