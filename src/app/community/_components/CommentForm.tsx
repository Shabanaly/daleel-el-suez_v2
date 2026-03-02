'use client';

import { Send, User, Loader2, X } from 'lucide-react';
import Image from 'next/image';

import { forwardRef } from 'react';

interface CommentFormProps {
    value: string;
    onChange: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    user: any;
    replyTo?: any;
    onCancelReply?: () => void;
    onAuthRequired: () => void;
}

const CommentForm = forwardRef<HTMLInputElement, CommentFormProps>(({
    value,
    onChange,
    onSubmit,
    isSubmitting,
    user,
    replyTo,
    onCancelReply,
    onAuthRequired
}, ref) => {
    if (!user) {
        return (
            <button
                onClick={onAuthRequired}
                className="w-full text-center p-4 rounded-xl bg-background border border-dashed border-border-subtle hover:bg-elevated/50 transition-all group"
            >
                <p className="text-xs font-black text-text-muted group-hover:text-primary transition-colors">يجب تسجيل الدخول للمشاركة في النقاش .. سجل الآن ✨</p>
            </button>
        );
    }

    return (
        <div className="space-y-3">
            {replyTo && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold text-primary">الرد على {replyTo.author?.full_name || 'مستشار سويسي'}</p>
                    <button onClick={onCancelReply} className="text-text-muted hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            <form onSubmit={onSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={replyTo ? "اكتب ردك..." : "اكتب تعليقاً..."}
                        className="w-full h-14 pr-12 pl-4 rounded-xl bg-background border border-border-subtle text-text-primary focus:border-primary outline-none font-bold text-sm shadow-sm transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden ring-1 ring-background border border-border-subtle/50">
                        {user.user_metadata?.avatar_url || user.avatar_url ? (
                            <Image src={user.user_metadata?.avatar_url || user.avatar_url} alt="User" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={!value.trim() || isSubmitting}
                    className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
            </form>
        </div>
    );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;
