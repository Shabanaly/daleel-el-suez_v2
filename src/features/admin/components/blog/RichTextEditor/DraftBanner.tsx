import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";

interface DraftBannerProps {
  hasDraft: boolean;
  onRestore: () => void;
  onClear: () => void;
}

export const DraftBanner = ({
  hasDraft,
  onRestore,
  onClear,
}: DraftBannerProps) => {
  return (
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
              onClick={onRestore}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white shadow shadow-primary/20 hover:bg-primary-hover transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              استعادة
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-border-subtle hover:border-error/40 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-error transition-colors"
            >
              تجاهل
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
