'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Camera, MapPin, CalendarDays } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ProfileHeaderProps {
    user: User | null;
    isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
    if (!user) return null;

    const profileData = user.user_metadata || {};
    const fullName = profileData.full_name || profileData.name || 'مستخدم جديد';
    const avatarUrl = profileData.avatar_url || profileData.picture || null;

    // Format join date
    const joinDateStr = user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }) : 'قريباً';

    return (
        <div className="relative pt-24 pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 max-w-7xl mx-auto">


            {/* Cover Photo Area - Visual only for now */}
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-primary/20 via-primary/5 to-transparent z-0 overflow-hidden">
                <div className="absolute inset-0  opacity-10 bg-repeat bg-size-[100px]" />
                <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
            </div>

            {/* Avatar */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 w-32 h-32 md:w-40 md:h-40 shrink-0"
            >
                <div className="w-full h-full rounded-full border-4 border-background bg-surface shadow-2xl relative overflow-hidden group">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={fullName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black uppercase">
                            {fullName.charAt(0)}
                        </div>
                    )}

                    {isOwnProfile && (
                        <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                            <Camera className="w-8 h-8 text-white" />
                        </button>
                    )}
                </div>

                {/* Active Status Indicator */}
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 bg-green-500 border-4 border-background rounded-full shrink-0 shadow-lg" title="نشط الآن" />
            </motion.div>

            {/* User Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-right w-full"
            >
                <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
                    {fullName}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-sm font-bold text-text-muted">
                    <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-border-subtle shadow-xs">
                        <MapPin className="w-4 h-4 text-primary" />
                        السويس، مصر
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-border-subtle shadow-xs">
                        <CalendarDays className="w-4 h-4 text-accent" />
                        انضم في {joinDateStr}
                    </span>
                </div>
            </motion.div>

            {/* Action Buttons Removed per user request */}

        </div>
    );
}
