'use client';

import { motion } from 'framer-motion';
import { ChevronRight, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface SubPageHeaderProps {
    user: User | null;
    title: string;
}

export function SubPageHeader({ user, title }: SubPageHeaderProps) {
    const router = useRouter();
    if (!user) return null;

    const profileData = user.user_metadata || {};
    const fullName = profileData.full_name || profileData.name || 'مستخدم';
    const avatarUrl = profileData.avatar_url || profileData.picture || null;

    return (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
            <div className="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">

                {/* Right: Page Title (Back handled by layout) */}
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="lg:hidden w-10 md:w-0" /> {/* Spacer for floating button */}
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-text-primary tracking-tight">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Left: Compact User Info */}
                <div className="flex items-center gap-2 md:gap-3 bg-surface/50 border border-border-subtle py-1 md:py-1.5 pl-3 md:pl-4 pr-1 md:pr-1.5 rounded-full">
                    <div className="text-left hidden sm:block">
                        <p className="text-[9px] md:text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none mb-0.5">الملف الشخصي</p>
                        <p className="text-xs font-black text-text-primary leading-none">{fullName}</p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background overflow-hidden bg-elevated shrink-0">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={fullName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10">
                                <UserIcon className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
