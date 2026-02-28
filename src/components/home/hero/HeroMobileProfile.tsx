'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroMobileProfileProps {
    user: any;
}

export default function HeroMobileProfile({ user }: HeroMobileProfileProps) {
    return (
        <AnimatePresence>
            {user ? (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden w-full mb-6"
                >
                    <div className="p-5 rounded-3xl bg-elevated/50 backdrop-blur-xl border border-primary/20 flex items-center gap-4 relative overflow-hidden group transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative shrink-0 z-10">
                            <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-20" />
                            <div className="relative w-14 h-14 rounded-full p-0.5 bg-linear-to-tr from-primary via-accent to-primary-hover">
                                <div className="w-full h-full rounded-full bg-background overflow-hidden border-2 border-background">
                                    {user.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            fill
                                            className="object-cover rounded-full w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col min-w-0 z-10">
                            <span className="text-[10px] font-bold text-primary/80 block uppercase tracking-widest mb-1">أهلاً بك مجدداً</span>
                            <h3 className="text-base font-black text-text-primary truncate leading-tight">
                                {user.user_metadata?.full_name?.split(' ')[0] || 'مستخدم'} 👋
                            </h3>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden w-full mb-6"
                >
                    <div className="p-5 rounded-3xl bg-elevated/50 backdrop-blur-xl border border-primary/10 flex items-center gap-4 relative overflow-hidden group transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="w-14 h-14 rounded-full bg-background border border-border-subtle flex items-center justify-center shrink-0 relative z-10">
                            <User className="w-7 h-7 text-text-muted/40" />
                        </div>

                        <div className="flex flex-col flex-1 z-10">
                            <span className="text-[10px] font-bold text-text-muted/60 block uppercase tracking-widest mb-1">استكشف مدينتك</span>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-text-primary leading-tight">مرحباً بك في السويس</h3>
                                <Link
                                    href="/login"
                                    className="px-5 py-2 rounded-xl bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
                                >
                                    دخول
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
