"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import CommunityComments from "./CommunityComments";

interface Props {
  postId: string | null;
  onClose: () => void;
}

export default function CommentsSheet({ postId, onClose }: Props) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (postId) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setDragOffset(0);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [postId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // ONLY allow drag if we are strictly at the top of the comments
    if (isAtTop) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only drag down
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null) {
      if (dragOffset > 100) {
        onClose();
      } else {
        setDragOffset(0);
      }
      touchStartY.current = null;
    }
  };

  return (
    <AnimatePresence>
      {postId && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: dragOffset }}
            exit={{ y: "100%", transition: { duration: 0.2 } }}
            transition={
              dragOffset > 0
                ? { duration: 0 }
                : { type: "spring", damping: 25, stiffness: 400, mass: 0.5 }
            }
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            dir="rtl"
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface rounded-t-2xl z-201 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] h-[85vh] flex flex-col overflow-hidden border-t border-border-subtle"
            style={{ touchAction: dragOffset > 0 ? "none" : "pan-y" }}
          >
            {/* Drag Handle Container (Safe Drag Area) */}
            <div
              className="w-full flex justify-center py-4 shrink-0 touch-none"
            >
              <div className="w-12 h-1.5 bg-border-subtle/50 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-border-subtle/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background border border-primary/20">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary tracking-tight">التعليقات</h2>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-background border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-all active:scale-75 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List Content */}
            <div
              ref={contentRef}
              className={`flex-1 overflow-y-auto px-6 scrollbar-hide no-scrollbar ${isAtTop ? 'overscroll-none' : 'overscroll-contain'}`}
              onScroll={(e) => {
                const scrollTop = e.currentTarget.scrollTop;
                setIsAtTop(scrollTop <= 0);
              }}
            >
              <CommunityComments postId={postId} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}