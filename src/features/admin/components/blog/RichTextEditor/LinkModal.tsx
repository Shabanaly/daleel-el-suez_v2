import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}

export const LinkModal = ({ isOpen, onClose, onSave }: LinkModalProps) => {
  const [linkUrl, setLinkUrl] = useState("");

  const handleSave = useCallback(() => {
    if (linkUrl) {
      onSave(linkUrl);
    }
    setLinkUrl("");
    onClose();
  }, [linkUrl, onSave, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="https://..."
              className="w-full rounded-2xl border border-border-subtle bg-elevated px-4 py-3 text-sm outline-none mb-4"
              dir="ltr"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-2xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
              >
                إدراج
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 rounded-2xl border border-border-subtle text-text-secondary hover:text-error transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
