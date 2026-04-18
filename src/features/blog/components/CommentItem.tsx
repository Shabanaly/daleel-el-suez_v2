'use client';

import { useState, memo } from 'react';
import { User, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useDialog } from '@/components/providers/DialogProvider';
import { BlogComment } from '../types';

interface CommentItemProps {
  comment: BlogComment;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

const CommentItem = memo(function CommentItem({
  comment,
  onDelete,
  currentUserId
}: CommentItemProps) {
  const isAuthor = currentUserId === comment.user_id;
  const { showConfirm } = useDialog();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    showConfirm({
      title: "حذف التعليق؟",
      message: "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "حذف",
      type: "error",
      onConfirm: async () => {
        setIsDeleting(true);
        if (onDelete) await onDelete(comment.id);
        setIsDeleting(false);
      }
    });
  };

  const fullName = comment.author?.full_name || 'زائر من السويس';

  return (
    <div className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-border-subtle overflow-hidden relative shadow-sm ring-4 ring-background">
          {comment.author?.avatar_url ? (
            <Image
              src={comment.author.avatar_url}
              alt={fullName}
              fill
              sizes="48px"
              className="object-cover transition-transform group-hover:scale-110 duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <User className="w-6 h-6 text-primary/30" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="bg-surface-secondary border border-border-subtle/50 rounded-2xl p-4 shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-text-primary">
              {fullName}
              {isAuthor && <span className="mr-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">أنت</span>}
            </h4>
            <span className="text-[10px] font-bold text-text-muted/60">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ar })}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary/80 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {isAuthor && onDelete && (
          <div className="flex justify-start px-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-[10px] font-black text-red-500/70 hover:text-red-500 hover:scale-105 transition-all active:scale-95 py-1 px-2 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              حذف التعليق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
    return (
        prev.comment.id === next.comment.id &&
        prev.comment.content === next.comment.content &&
        prev.currentUserId === next.currentUserId
    );
});

export default CommentItem;
