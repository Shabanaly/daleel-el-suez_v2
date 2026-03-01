'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatePostModal from './CreatePostModal';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import Image from 'next/image';
import { User } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CreatePostTriggerProps {
    categories: Category[];
    userAvatar?: string | null;
}

export default function CreatePostTrigger({ categories, userAvatar }: CreatePostTriggerProps) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleCreateClick = () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                onClick={handleCreateClick}
                className="bg-surface border border-border-subtle rounded-2xl p-3.5 mb-6 shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative shrink-0 ring-2 ring-background border border-primary/20">
                        {userAvatar ? (
                            <Image
                                src={userAvatar}
                                alt="User"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-background border border-border-subtle rounded-xl px-5 h-11 text-text-muted/40 font-bold text-sm transition-all group-hover:bg-elevated/50 flex items-center justify-between overflow-hidden">
                        <span className="truncate ml-2">بماذا تفكر يا سويسي؟ شاركنا الآن...</span>
                        <ImageIcon className="w-5 h-5 opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
            />

            <AuthRequiredModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                title="سجل دخولك للنشر"
                description="يجب تسجيل الدخول لتتمكن من مشاركة منشوراتك مع المجتمع."
            />
        </>
    );
}
