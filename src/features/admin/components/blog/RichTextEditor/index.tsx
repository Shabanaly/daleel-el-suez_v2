"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RichContent } from "@/features/blog/components/RichContent";
import { useToast } from "@/features/notifications/hooks/useToast";
import { useDialog } from "@/components/providers/DialogProvider";

import { Toolbar } from "./Toolbar";
import { LinkModal } from "./LinkModal";
import { DraftBanner } from "./DraftBanner";
import { EditorFooter } from "./EditorFooter";
import { useEditorDraft } from "./useEditorDraft";
import { useEditorActions } from "./useEditorActions";
import { RichTextEditorProps } from "./types";

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  draftKey,
}: RichTextEditorProps) {
  const { showConfirm } = useDialog();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft System
  const { hasDraft, handleRestoreDraft, handleClearDraft } = useEditorDraft(
    content,
    onChange,
    draftKey,
  );

  // Editor Actions
  const {
    insertText,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleClearAll,
    addImage,
    openLinkModal,
  } = useEditorActions({
    textareaRef,
    onChange,
    showToast,
    showConfirm,
    setIsUploading,
    setLinkModalOpen,
  });

  const saveLink = useCallback(
    (url: string) => {
      insertText(`[`, `](${url})`);
    },
    [insertText],
  );

  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const charCount = content ? content.length : 0;

  return (
    <div className="flex flex-col border border-border-subtle rounded-[32px] overflow-hidden bg-surface group focus-within:border-primary/40 transition-all shadow-sm">
      <DraftBanner
        hasDraft={hasDraft}
        onRestore={handleRestoreDraft}
        onClear={handleClearDraft}
      />

      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={saveLink}
      />

      <Toolbar
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        insertText={insertText}
        openLinkModal={openLinkModal}
        addImage={addImage}
        isUploading={isUploading}
        handleCopy={handleCopy}
        handlePaste={handlePaste}
        handleClearAll={handleClearAll}
        isPreview={isPreview}
        setIsPreview={setIsPreview}
      />

      {/* Editor Content Area */}
      <div className="min-h-[500px] w-full bg-surface">
        <AnimatePresence mode="wait">
          {isPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="p-8 prose-rtl max-w-none bg-surface-secondary/20 min-h-[500px]"
            >
              <RichContent content={content} />
            </motion.div>
          ) : (
            <textarea
              ref={textareaRef}
              dir="ltr"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                placeholder || "اكتب مقالك هنا باستخدام المارك داون..."
              }
              className="w-full min-h-[500px] p-6 bg-surface font-mono text-sm leading-relaxed outline-none focus:bg-elevated/30 transition-colors text-text-primary resize-none border-none"
            />
          )}
        </AnimatePresence>
      </div>

      <EditorFooter wordCount={wordCount} charCount={charCount} />
    </div>
  );
}

// Named export for convenience
export default RichTextEditor;
