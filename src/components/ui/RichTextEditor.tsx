"use client";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  X,
  Clock,
  RefreshCw,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  Type,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { getCloudinarySignature } from "@/lib/actions/media";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RichContent } from "@/features/blog/components/RichContent";
import { useToast } from "@/features/notifications/hooks/useToast";

import { useDialog } from "@/components/providers/DialogProvider";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  draftKey?: string;
}

const MenuButton = ({
  onClick,
  children,
  title,
  variant = "default",
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  variant?: "default" | "primary" | "error" | "success";
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
      variant === "primary"
        ? "bg-primary/10 text-primary hover:bg-primary/20"
        : variant === "error"
          ? "hover:bg-error/10 text-text-secondary hover:text-error"
          : variant === "success"
            ? "hover:bg-emerald-500/10 text-text-secondary hover:text-emerald-500"
            : "hover:bg-elevated text-text-secondary hover:text-text-primary"
    } ${className}`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-border-subtle/60 mx-1 shrink-0" />
);

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
  const [linkUrl, setLinkUrl] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft System State
  const [hasDraft, setHasDraft] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  // Handle Draft Loading
  useEffect(() => {
    if (draftKey) {
      const saved = localStorage.getItem(draftKey);
      if (saved && saved.trim() !== "" && saved !== content) {
        setHasDraft(true);
        setDraftContent(saved);
      }
    }
  }, [draftKey, content]);

  // Handle Autosave Drafts
  useEffect(() => {
    if (draftKey && content && content.trim() !== "") {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, content);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [content, draftKey]);

  const handleRestoreDraft = useCallback(() => {
    if (draftContent) {
      onChange(draftContent);
      setHasDraft(false);
    }
  }, [draftContent, onChange]);

  const handleClearDraft = useCallback(() => {
    if (draftKey) localStorage.removeItem(draftKey);
    setHasDraft(false);
  }, [draftKey]);

  const insertText = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);

      const newText =
        text.substring(0, start) +
        before +
        selectedText +
        after +
        text.substring(end);

      onChange(newText);

      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    },
    [onChange],
  );

  // Actions Handlers
  const handleUndo = () => {
    textareaRef.current?.focus();
    document.execCommand("undo");
  };

  const handleRedo = () => {
    textareaRef.current?.focus();
    document.execCommand("redo");
  };

  const handleCopy = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    document.execCommand("copy");
    showToast({
      title: "تم النسخ",
      message: "تم نسخ النص المختار إلى الحافظة بنجاح.",
      type: "INFO",
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertText(text, "");
        showToast({
          title: "تم اللصق",
          message: "تم لصق النص من الحافظة.",
          type: "INFO",
        });
      }
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  const handleClearAll = () => {
    showConfirm({
      title: "مسح محتوى المقال",
      message:
        "هل أنت متأكد من رغبتك في مسح كافة المحتويات؟ لا يمكن التراجع عن هذه الخطوة.",
      type: "confirm",
      confirmLabel: "نعم، امسح الكل",
      cancelLabel: "إلغاء",
      onConfirm: () => {
        onChange("");
      },
    });
  };

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        setIsUploading(true);
        try {
          const {
            signature,
            timestamp,
            apiKey,
            cloudName,
            uploadPreset,
            folder,
          } = await getCloudinarySignature("blog-content");

          const formData = new FormData();
          formData.append("file", file);
          formData.append("signature", signature);
          formData.append("timestamp", timestamp.toString());
          formData.append("api_key", apiKey || "");
          formData.append("upload_preset", uploadPreset || "");
          if (folder) formData.append("folder", folder);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData },
          );

          const data = await response.json();
          if (data.secure_url) {
            insertText(`\n![وصف الصورة](${data.secure_url})\n`, "");
          }
        } catch (error) {
          console.error("Image upload failed:", error);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  }, [insertText]);

  const openLinkModal = useCallback(() => {
    setLinkModalOpen(true);
  }, []);

  const saveLink = useCallback(() => {
    if (linkUrl) {
      insertText(`[`, `](${linkUrl})`);
    }
    setLinkUrl("");
    setLinkModalOpen(false);
  }, [insertText, linkUrl]);

  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const charCount = content ? content.length : 0;

  return (
    <div className="flex flex-col border border-border-subtle rounded-[32px] overflow-hidden bg-surface group focus-within:border-primary/40 transition-all shadow-sm">
      {/* Draft Notification */}
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/5 border-b border-primary/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 font-bold text-primary">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>يوجد مسودة سابقة غير محفوظة</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white shadow shadow-primary/20 hover:bg-primary-hover transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                استعادة
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="rounded-lg border border-border-subtle hover:border-error/40 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-error transition-colors"
              >
                تجاهل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Modal */}
      <AnimatePresence>
        {linkModalOpen && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLinkModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-surface rounded-[32px] p-6 shadow-2xl border border-border-subtle"
            >
              <h3 className="mb-4 text-lg font-black text-text-primary">
                إدراج رابط
              </h3>
              <input
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveLink()}
                placeholder="https://..."
                className="w-full rounded-2xl border border-border-subtle bg-elevated px-4 py-3 text-sm outline-none mb-4"
                dir="ltr"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveLink}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                  إدراج
                </button>
                <button
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 rounded-2xl border border-border-subtle text-text-secondary hover:text-error transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 p-2.5 border-b border-border-subtle bg-elevated/40 backdrop-blur-xl sticky top-16 lg:top-0 z-10"
        dir="rtl"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Group 1: History */}
          <MenuButton onClick={handleUndo} title="تراجع">
            <Undo2 className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={handleRedo} title="إعادة">
            <Redo2 className="w-4 h-4" />
          </MenuButton>

          <Divider />

          {/* Group 2: Formatting */}
          <MenuButton onClick={() => insertText("**", "**")} title="خط عريض">
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => insertText("_", "_")} title="خط مائل">
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => insertText("# ", "")} title="عنوان رئيسي">
            <Heading1 className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => insertText("## ", "")} title="عنوان فرعي">
            <Heading2 className="w-4 h-4" />
          </MenuButton>

          <Divider />

          {/* Group 3: Lists & Quotes */}
          <MenuButton onClick={() => insertText("- ", "")} title="قائمة نقطية">
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => insertText("1. ", "")} title="قائمة رقمية">
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={() => insertText("> ", "")} title="اقتباس">
            <Quote className="w-4 h-4" />
          </MenuButton>

          <Divider />

          {/* Group 4: Assets */}
          <MenuButton onClick={openLinkModal} title="إضافة رابط">
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={addImage} title="إضافة صورة" variant="primary">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </MenuButton>

          <Divider />

          {/* Group 5: Clipboard */}
          <MenuButton onClick={handleCopy} title="نسخ">
            <Copy className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={handlePaste} title="لصق">
            <ClipboardPaste className="w-4 h-4" />
          </MenuButton>

          <Divider />

          {/* Group 6: Utils */}
          <MenuButton onClick={handleClearAll} title="مسح الكل" variant="error">
            <Trash2 className="w-4 h-4" />
          </MenuButton>
        </div>

        {/* Global Action: Preview */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            isPreview
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary-subtle"
          }`}
        >
          {isPreview ? (
            <>
              <Edit3 className="w-4 h-4" /> العودة للتعديل
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> معاينة المقال
            </>
          )}
        </button>
      </div>

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

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border-subtle bg-elevated/30 flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
        <div className="flex gap-4">
          <span>{wordCount} كلمة</span>
          <span>{charCount} حرف</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            متصل ومؤمن
          </div>
          <span className="opacity-40">|</span>
          <span>Unified Toolbar v3.0</span>
        </div>
      </div>
    </div>
  );
}
