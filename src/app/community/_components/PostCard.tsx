'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Clock, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toggleLikePost, deletePost } from '@/lib/actions/posts';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import CategoryIcon from './CategoryIcon';
import CommunityLightbox from './CommunityLightbox';
import { useDialog } from '@/components/providers/DialogProvider';
import ShareButton from '@/components/ui/ShareButton';

interface PostCardProps {
  post: any;
  isLikedInitial?: boolean;
  onCommentClick?: () => void;
}

export default function PostCard({ post, isLikedInitial = false, onCommentClick }: PostCardProps) {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Optimistic UI
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev: number) => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const result = await toggleLikePost(post.id);
      if (result.error) {
        // Rollback
        setIsLiked(!newIsLiked);
        setLikesCount((prev: number) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (error) {
      // Rollback
      setIsLiked(!newIsLiked);
      setLikesCount((prev: number) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    onCommentClick?.();
  };

  const handleDelete = async () => {
    showConfirm({
      title: 'حذف المنشور؟',
      message: 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع الصور والتعليقات المرتبطة به.',
      confirmLabel: 'حذف',
      type: 'error',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await deletePost(post.id);
          if (result.error) {
            showAlert({
              title: 'خطأ',
              message: result.error,
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Delete failed:', error);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const isAuthor = user?.id === post.author_id;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <motion.div
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-surface border border-border-subtle rounded-2xl overflow-hidden mb-6 shadow-sm scroll-mt-24"
    >
      {/* Post Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative ring-2 ring-background border border-primary/20">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.full_name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-black">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-text-primary text-base">
              {post.author?.full_name || 'مستشار سويسي'}
            </h3>
            <div className="flex items-center gap-2 text-text-muted text-xs font-bold opacity-60">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-primary font-black">
                    <CategoryIcon name={post.category.icon} className="w-3.5 h-3.5" />
                    <span>{post.category.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl hover:bg-background transition-colors text-text-muted opacity-50"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-surface border border-border-subtle rounded-2xl shadow-xl z-20 overflow-hidden"
                >
                  <ShareButton
                    title="دليل السويس - منشور في المجتمع"
                    text={post.content || 'اكتشف هذا المنشور في مجتمع السويس'}
                    url={`${window.location.origin}/community#post-${post.id}`}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background transition-colors"
                    onSuccess={() => {
                      setIsMenuOpen(false);
                      showAlert({
                        title: 'تم النسخ!',
                        message: 'تم نسخ رابط المنشور للحافظة بنجاح. ✨',
                        type: 'success'
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة المنشور</span>
                  </ShareButton>
                  {isAuthor && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleDelete();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-border-subtle/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف المنشور</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>


      <CommunityLightbox
        images={post.images}
        initialIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        post={post}
        isLiked={isLiked}
        likesCount={likesCount}
        onLike={handleLike}
        onComment={() => {
          setIsLightboxOpen(false);
          handleCommentClick({ preventDefault: () => { } } as any);
        }}
      />

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-text-primary text-base leading-relaxed font-bold whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className={`px-4 md:px-6 pb-4 grid gap-1.5 ${post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
          {post.images.slice(0, 4).map((img: string, idx: number) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className={`relative rounded-xl overflow-hidden bg-background border border-border-subtle group cursor-pointer transition-transform active:scale-[0.98] ${post.images.length === 1 ? 'aspect-4/3 md:aspect-video' :
                post.images.length === 3 && idx === 0 ? 'col-span-2 aspect-2/1' :
                  'aspect-square'
                }`}
            >
              <Image
                src={img}
                alt={`Post Image ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {idx === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-2xl">
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-border-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`group flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-accent' : 'text-text-muted opacity-80 hover:text-accent'
              }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-black">{likesCount}</span>
          </button>

          <button
            onClick={handleCommentClick}
            className="flex items-center gap-2 text-text-muted opacity-80 hover:text-primary transition-all active:scale-90"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-black">{post.comments_count?.[0]?.count || 0}</span>
          </button>
        </div>

        <ShareButton
          title="دليل السويس - منشور في المجتمع"
          text={post.content || 'اكتشف هذا المنشور في مجتمع السويس'}
          url={`${window.location.origin}/community#post-${post.id}`}
          className="flex items-center gap-2 p-2 px-4 rounded-xl hover:bg-primary/5 text-text-muted transition-all active:scale-90"
          onSuccess={() => showAlert({
            title: 'تم بنجاح!',
            message: 'تم نسخ رابط المنشور للمشاركة. ✨',
            type: 'success'
          })}
        >
          <Share2 className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="text-sm font-bold group-hover:text-primary transition-colors">مشاركة</span>
        </ShareButton>
      </div>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="تسجيل الدخول مطلوب"
        description="يجب تسجيل الدخول للتفاعل مع المنشورات والمجتمع"
      />
    </motion.div>
  );
}