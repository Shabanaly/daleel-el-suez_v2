'use client';

import { Search, Mic, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
    { name: 'مطاعم', icon: '🍽️', href: '/places?category=مطاعم' },
    { name: 'كافيهات', icon: '☕', href: '/places?category=كافيهات' },
    { name: 'صيدلية', icon: '💊', href: '/places?category=صيدليات' },
    { name: 'سوبر ماركت', icon: '🛒', href: '/places?category=سوبر ماركت' },
    { name: 'بنوك', icon: '🏦', href: '/places?category=بنوك' },
];

export default function Hero() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/places?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            router.push('/places');
        }
    };

    return (
        <section className="relative w-full flex flex-col items-center justify-center overflow-hidden pt-16 pb-6 md:pt-28 md:pb-20 md:min-h-screen">
            {/* Background Glowing Orbs */}
            <div className="absolute top-[-5%] left-[-10%] w-[300px] h-[300px] md:w-[550px] md:h-[550px] bg-primary-500 rounded-full filter blur-[80px] md:blur-[130px] opacity-0 dark:opacity-20 transition-opacity duration-300" />
            <div className="absolute top-[25%] right-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-accent rounded-full filter blur-[70px] md:blur-[110px] opacity-0 dark:opacity-15 transition-opacity duration-300" />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-100 dark:opacity-20 pointer-events-none" />

            {/* Glowing divider at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary-500/20 dark:via-accent/50 to-transparent shadow-[0_0_15px_rgba(8,145,178,0.1)] dark:shadow-[0_0_20px_rgba(217,119,6,0.4)]" />

            <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center text-center">

                {/* Mobile Welcome Section */}
                <AnimatePresence>
                    {user && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000"
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative w-20 h-20 rounded-full p-1 bg-linear-to-tr from-primary-600 via-accent to-primary-400">
                                    <div className="w-full h-full rounded-full bg-base overflow-hidden border-2 border-base">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image
                                                src={user.user_metadata.avatar_url}
                                                alt={user.user_metadata?.full_name || 'User'}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-600/10">
                                                <User className="w-8 h-8 text-primary-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-sm font-bold text-primary-500/80 block uppercase tracking-widest mb-1">أهلاً بك مجدداً</span>
                                <h2 className="text-xl font-black text-text-primary tracking-tight">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'يا صديقي'} 👋
                                </h2>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Animated Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col md:flex-col items-center mb-6 md:mb-8"
                >
                    <div className="flex items-center gap-2 md:flex-col md:gap-0">
                        <span className="text-xl md:text-6xl font-bold text-primary-800 dark:text-primary-300 tracking-wide">دليل</span>
                        <h1 className="text-4xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-primary-900 via-primary-700 to-primary-600 dark:bg-linear-to-b dark:from-text-primary dark:via-primary-300 dark:to-accent drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(8,145,178,0.4)] leading-tight">
                            السويس
                        </h1>
                    </div>
                    <p className="hidden md:block text-lg md:text-2xl text-text-secondary dark:text-text-muted mt-4 max-w-lg mx-auto font-medium tracking-wide">
                        كل مكان في السويس في مكان واحد
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-3xl mb-8 md:mb-12"
                >
                    <div className="relative flex items-center w-full h-14 md:h-18 p-1.5 rounded-full bg-surface dark:bg-surface/60 backdrop-blur-md border border-primary-600/10 dark:border-border-subtle shadow-lg shadow-primary-900/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] focus-within:shadow-2xl focus-within:shadow-primary-900/10 dark:focus-within:shadow-[0_0_25px_rgba(8,145,178,0.25)] focus-within:border-primary-500/30 dark:focus-within:border-primary-500/50 transition-all duration-300 ease-out">
                        <div className="ps-3 md:ps-6 me-2 md:me-4 text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer shrink-0">
                            <Mic className="w-5 h-5 md:w-6 md:h-6" />
                        </div>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث... مطعم، صيدلية، كافيه"
                            className="flex-1 h-full bg-transparent border-none outline-none text-text-primary placeholder-text-muted pe-2 md:pe-4 md:text-xl font-medium"
                        />

                        <button
                            type="submit"
                            className="h-full px-5 md:px-8 relative left-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center transition-all shadow-md hover:shadow-primary-500/25 active:scale-95 shrink-0"
                        >
                            <Search className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="hidden md:block text-lg ms-2">بحث</span>
                        </button>
                    </div>
                </motion.form>

                {/* Quick Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0"
                >
                    <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 min-w-max pb-2">
                        {CATEGORIES.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={cat.href}
                                className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-full bg-surface dark:bg-elevated/40 border border-primary-600/10 dark:border-border-subtle hover:bg-primary-50 dark:hover:bg-elevated hover:shadow-lg hover:shadow-primary-900/5 dark:hover:shadow-primary-500/10 md:hover:-translate-y-1 hover:border-primary-500/30 transition-all duration-300 whitespace-nowrap"
                            >
                                <span className="text-base md:text-lg">{cat.icon}</span>
                                <span className="text-sm md:text-base font-bold text-text-primary dark:text-text-secondary">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
