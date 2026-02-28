"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Send, User } from "lucide-react";
import Image from "next/image";
const MOCK_COMMENTS: any[] = [];

interface Props {
  postId: string | null;
  onClose: () => void;
}

export default function CommentsSheet({ postId, onClose }: Props) {
  const dragControls = useDragControls();
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsAtTop(e.currentTarget.scrollTop <= 0);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90"
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
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface rounded-t-3xl z-100 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col"
            style={{ touchAction: "none" }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full flex justify-center p-4 cursor-grab active:cursor-grabbing"
            >
              <div className="w-16 h-1.5 bg-border-subtle rounded-full" />
            </div>

            {/* Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="px-6 pb-4 flex items-center justify-between border-b border-border-subtle/30"
            >
              <h2 className="text-lg font-semibold text-text-primary">
                التعليقات
              </h2>

              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-text-muted hover:text-text-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onPointerDown={(e) => {
                if (isAtTop) {
                  dragControls.start(e, { snapToCursor: false });
                }
              }}
              className="flex-1 overflow-y-auto p-6 space-y-6"
              style={{ touchAction: isAtTop ? "none" : "pan-y" }}
            >
              {MOCK_COMMENTS.map((comment) => (
                <div key={comment.id} className="space-y-3">

                  {/* Comment */}
                  <div className="flex gap-3 items-start">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`}
                        alt={comment.author}
                        fill
                      />
                    </div>

                    <div className="bg-background p-3 rounded-2xl border border-border-subtle/30 max-w-[85%]">
                      <h4 className="text-sm font-semibold text-primary mb-1">
                        {comment.author}
                      </h4>
                      <p className="text-sm text-text-primary leading-relaxed">
                        {comment.content}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {comment.time}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="mr-12 space-y-3 border-r border-border-subtle/30 pr-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3 items-start">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author}`}
                              alt={reply.author}
                              fill
                            />
                          </div>

                          <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 max-w-[85%]">
                            <h4 className="text-xs font-semibold text-accent mb-1">
                              {reply.author}
                            </h4>
                            <p className="text-xs text-text-primary leading-relaxed">
                              {reply.content}
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                              {reply.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle/30 bg-surface">
              <div className="relative">
                <input
                  type="text"
                  placeholder="اكتب تعليقاً..."
                  className="w-full h-12 pr-4 pl-12 rounded-xl bg-background border border-border-subtle text-text-primary focus:border-primary outline-none"
                />
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}