'use client';

import { Send, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import HoneypotField from '@/components/common/HoneypotField';

interface CommentFormProps {
    onSubmit: (content: string, honeypot?: string) => Promise<void>;
    isSubmitting: boolean;
    user: SupabaseUser | null;
    onAuthRequired: () => void;
}

export interface CommentFormHandle {
    reset: () => void;
    focus: () => void;
}

const CommentForm = forwardRef<CommentFormHandle, CommentFormProps>(({
    onSubmit,
    isSubmitting,
    user,
    onAuthRequired
}, ref) => {
    const [text, setText] = useState('');
    
    useImperativeHandle(ref, () => ({
        reset: () => setText(''),
        focus: () => {
            const el = document.getElementById('blog-comment-input');
            el?.focus();
        }
    }), []);

    if (!user) {
        return (
            <button
                onClick={onAuthRequired}
                className="w-full text-center p-4 rounded-2xl bg-surface-secondary border border-dashed border-border-subtle hover:bg-surface-elevated transition-all group"
            >
                <p className="text-sm font-bold text-text-muted group-hover:text-primary transition-colors">
                    سجل دخولك لتتمكن من إضافة تعليق.. شارك برأيك الآن ✨
                </p>
            </button>
        );
    }

    const userMetadata = user?.user_metadata || {};
    const userAvatar = userMetadata.avatar_url;
    const userName = userMetadata.first_name || userMetadata.full_name || 'أنت';

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isSubmitting) return;

        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const hpValue = formData.get('hp_field_check') as string;

        await onSubmit(text.trim(), hpValue);
    };

    return (
        <form 
            onSubmit={handleFormSubmit} 
            className="group relative flex flex-col gap-3 p-4 bg-surface-secondary border border-border-subtle focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 rounded-2xl transition-all"
        >
            <HoneypotField />
            
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 relative rounded-full overflow-hidden ring-2 ring-background border border-border-subtle shadow-sm">
                    {userAvatar ? (
                        <Image src={userAvatar} alt={userName} fill sizes="40px" className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    )}
                </div>
                
                <textarea
                    id="blog-comment-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    rows={3}
                    className="flex-1 bg-transparent text-text-primary outline-none font-medium text-sm placeholder:text-text-muted/50 py-2 resize-none"
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex justify-end pt-2 border-t border-border-subtle/30">
                <button
                    type="submit"
                    disabled={!text.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري النشر...</span>
                        </>
                    ) : (
                        <>
                            <span>نشر التعليق</span>
                            <Send className="w-4 h-4 rtl:rotate-180" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;
