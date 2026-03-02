"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import CommunityComments from "./CommunityComments";

interface Props {
  postId: string | null;
  onClose: () => void;
}

export default function CommentsSheet({ postId, onClose }: Props) {
  const dragControls = useDragControls();
  const [isAtTop, setIsAtTop] = useState(true);

  // 🔒 Lock background scroll
  useEffect(() => {
    if (postId) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [postId]);

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
            onDragEnd={(_, info: any) => {
              if (info.offset.y > 80 || info.velocity.y > 400) {
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
              className="flex-1 overflow-y-auto px-6 scrollbar-hide no-scrollbar"
              onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
              style={{ touchAction: isAtTop ? "none" : "pan-y" }}
              onPointerDown={(e) => {
                if (isAtTop) {
                  dragControls.start(e, { snapToCursor: false });
                }
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