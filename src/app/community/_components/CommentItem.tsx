'use client';

import { useState } from 'react';
import { User, Loader2, Reply, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useDialog } from '@/components/providers/DialogProvider';

interface CommentItemProps {
  comment: any;
  onReply?: (comment: any) => void;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  isReply = false
}: CommentItemProps) {
  const isAuthor = currentUserId === comment.author_id;
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

  return (
    <div className="flex gap-3 group">
      <div className={`rounded-full bg-elevated ring-2 ring-background border border-primary/10 overflow-hidden relative shrink-0 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
        {comment.author?.avatar_url ? (
          <Image
            src={comment.author.avatar_url}
            alt={comment.author.username || 'User'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted opacity-30">
            <User className={isReply ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <div className="bg-background border border-border-subtle/30 rounded-2xl p-4 shadow-xs group-hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-black text-text-primary">
              {comment.author?.full_name || 'مستشار سويسي'}
            </h4>
            <span className="text-[10px] font-bold text-text-muted opacity-50">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ar })}
            </span>
          </div>
          <p className="text-sm font-bold text-text-primary/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-3 mr-2">
          {!isReply && onReply && (
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:scale-105 transition-all active:scale-95 py-1 px-2 hover:bg-primary/5 rounded-lg"
            >
              <Reply className="w-3 h-3" />
              رد
            </button>
          )}

          {isAuthor && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-[10px] font-black text-red-500 hover:scale-105 transition-all active:scale-95 py-1 px-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}