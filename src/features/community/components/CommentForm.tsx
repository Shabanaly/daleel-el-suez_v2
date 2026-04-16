'use client';

import { Send, User, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { CommunityComment } from '@/features/community/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import HoneypotField from '@/components/common/HoneypotField';


interface CommentFormProps {
    onSubmit: (content: string, honeypot?: string) => Promise<void>;

    isSubmitting: boolean;
    user: SupabaseUser | null;
    replyTo?: CommunityComment | null;
    onCancelReply?: () => void;
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
    replyTo,
    onCancelReply,
    onAuthRequired
}, ref) => {
    const [text, setText] = useState('');
    const inputRef = useImperativeHandle(ref, () => ({
        reset: () => setText(''),
        focus: () => {
            const el = document.getElementById('comment-input');
            el?.focus();
        }
    }), []);

    if (!user) {
        return (
            <button
                onClick={onAuthRequired}
                className="w-full text-center p-2 rounded-xl bg-background border border-dashed border-border-subtle hover:bg-elevated/50 transition-all group"
            >
                <p className="text-xs font-black text-text-muted group-hover:text-primary transition-colors">يجب تسجيل الدخول للمشاركة في النقاش .. سجل الآن ✨</p>
            </button>
        );
    }

    const userAvatar = (user?.user_metadata?.avatar_url as string) || (user as { avatar_url?: string } | null)?.avatar_url;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isSubmitting) return;

        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const hpValue = formData.get('hp_field_check') as string;

        await onSubmit(text.trim(), hpValue);
        setText('');
    };


    return (
        <div className="space-y-2">
            {replyTo && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold text-primary">الرد على {replyTo.author?.full_name || 'مستشار سويسي'}</p>
                    <button onClick={onCancelReply} className="text-text-muted hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            <form 
                onSubmit={handleFormSubmit} 
                className="relative flex items-center gap-2 p-1 bg-background border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl shadow-sm transition-all group"
            >
                <HoneypotField />

                <div className="shrink-0 w-7 h-7 sm:w-9 sm:h-9 relative rounded-full overflow-hidden ring-2 ring-background border border-border-subtle/50 mr-1">
                    {userAvatar ? (
                        <Image src={userAvatar} alt="User" fill sizes="36px" className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                    )}
                </div>

                <input
                    id="comment-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={replyTo ? "اكتب ردك..." : "اكتب تعليقاً..."}
                    className="flex-1 h-10 w-full bg-transparent text-text-primary outline-none font-semibold text-sm placeholder:text-text-muted/70 px-2"
                />

                <button
                    type="submit"
                    disabled={!text.trim() || isSubmitting}
                    className="shrink-0 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:bg-surface-elevated disabled:text-text-muted disabled:shadow-none disabled:hover:scale-100 ml-0.5"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-0.5 rtl:ml-0 rtl:-mr-0.5 transform -rotate-90 " />}
                </button>
            </form>
        </div>
    );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;

