import { CheckCircle2 } from "lucide-react";

interface EditorFooterProps {
  wordCount: number;
  charCount: number;
}

export const EditorFooter = ({ wordCount, charCount }: EditorFooterProps) => {
  return (
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
  );
};
