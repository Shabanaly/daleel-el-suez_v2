"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Send, User, Loader2, Reply, MessageCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { addComment, getPostComments, deleteComment } from '@/lib/actions/comments';
import { useDialog } from '@/components/providers/DialogProvider';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';

interface Props {
  postId: string | null;
  onClose: () => void;
}

export default function CommentsSheet({ postId, onClose }: Props) {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const dragControls = useDragControls();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 🔒 Lock background scroll
  useEffect(() => {
    if (postId) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      fetchComments();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      setComments([]);
      setReplyTo(null);
      setNewComment("");
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;
    setIsLoading(true);
    try {
      const data = await getPostComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting || !user || !postId) return;

    setIsSubmitting(true);
    try {
      const result = await addComment(postId, newComment, replyTo?.id);
      if (result.success) {
        setNewComment("");
        setReplyTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        await fetchComments();
      } else {
        showAlert({
          title: "خطأ في الحذف",
          message: result.error || "حدث خطأ غير متوقع أثناء حذف التعليق.",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Delete comment failed:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsAtTop(e.currentTarget.scrollTop <= 0);
  };

  const mainComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <AnimatePresence>
      {postId && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.7}
            dragListener={false}
            onDrag={(_, info) => {
              if (isAtTop && info.delta.y < 0 && scrollRef.current) {
                scrollRef.current.scrollTop -= info.delta.y;
              }
            }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) {
                onClose();
              }
            }}
            whileDrag={{ cursor: "grabbing" }}
            dir="rtl"
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface rounded-t-2xl z-201 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col overflow-hidden border-t border-border-subtle"
            style={{ touchAction: "none" }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0"
            >
              <div className="w-12 h-1.5 bg-border-subtle/50 rounded-full" />
            </div>

            {/* Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="px-6 pb-4 flex items-center justify-between border-b border-border-subtle/30 shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background border border-primary/20">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary tracking-tight">التعليقات</h2>
                  <p className="text-[10px] font-bold text-text-muted">{comments.length} تعليق</p>
                </div>
              </div>

              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-background border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reply Indicator */}
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-6 mt-4 p-3 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Reply className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black text-primary">الرد على {replyTo.author?.full_name || 'مستشار سويسي'}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-primary hover:scale-110 transition-transform">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments List */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onPointerDown={(e) => {
                if (isAtTop) {
                  dragControls.start(e, { snapToCursor: false });
                }
              }}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide no-scrollbar"
              style={{ touchAction: isAtTop ? "none" : "pan-y" }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-20">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-black">جاري التحميل...</span>
                </div>
              ) : mainComments.length > 0 ? (
                mainComments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <CommentItem
                      comment={comment}
                      onReply={() => {
                        if (!user) {
                          setIsAuthModalOpen(true);
                          return;
                        }
                        setReplyTo(comment);
                      }}
                      onDelete={() => handleDeleteComment(comment.id)}
                      currentUserId={user?.id}
                    />

                    {/* Replies */}
                    {getReplies(comment.id).length > 0 && (
                      <div className="mr-8 pr-4 border-r-2 border-primary/10 space-y-4">
                        {getReplies(comment.id).map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            isReply
                            onDelete={() => handleDeleteComment(reply.id)}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-10">
                  <MessageCircle className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-black mb-1">لا توجد تعليقات بعد</h3>
                  <p className="text-xs font-bold">كن أول من يشارك برأيه في هذا الموضوع!</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle bg-surface sticky bottom-0 pb-safe">
              {user ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyTo ? "اكتب ردك..." : "اكتب تعليقاً..."}
                      className="w-full h-14 pr-12 pl-4 rounded-xl bg-background border border-border-subtle text-text-primary focus:border-primary outline-none font-bold text-sm shadow-sm transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden ring-1 ring-background border border-border-subtle/50">
                      {user.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="User" fill className="object-cover" />
                      ) : (
                        <User className="w-full h-full text-text-muted" />
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full text-center p-4 rounded-xl bg-background border border-dashed border-border-subtle hover:bg-elevated/50 transition-all group"
                >
                  <p className="text-xs font-black text-text-muted group-hover:text-primary transition-colors">يجب تسجيل الدخول للمشاركة في النقاش .. سجل الآن ✨</p>
                </button>
              )}
            </div>

            <AuthRequiredModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              title="سجل دخولك للتفاعل"
              description="يجب تسجيل الدخول لتتمكن من إضافة تعليقات أو الرد على الآخرين."
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  isReply = false
}: {
  comment: any,
  onReply?: () => void,
  onDelete?: () => void,
  currentUserId?: string,
  isReply?: boolean
}) {
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
        if (onDelete) await onDelete();
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
          <p className="text-sm font-bold text-text-primary/90 leading-relaxed">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-3 mr-2">
          {!isReply && onReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:scale-105 transition-all active:scale-95 py-1 px-2 hover:bg-primary/5 rounded-lg"
            >
              <Reply className="w-3 h-3" />
              رد
            </button>
          )}

          {isAuthor && (
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