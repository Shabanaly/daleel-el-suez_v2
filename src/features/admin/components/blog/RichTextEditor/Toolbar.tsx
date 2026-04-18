import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  Loader2,
  Edit3,
  Eye,
} from "lucide-react";
import { MenuButton, Divider } from "./MenuButton";

interface ToolbarProps {
  handleUndo: () => void;
  handleRedo: () => void;
  insertText: (before: string, after?: string) => void;
  openLinkModal: () => void;
  addImage: () => void;
  isUploading: boolean;
  handleCopy: () => void;
  handlePaste: () => void;
  handleClearAll: () => void;
  isPreview: boolean;
  setIsPreview: (preview: boolean) => void;
}

export const Toolbar = ({
  handleUndo,
  handleRedo,
  insertText,
  openLinkModal,
  addImage,
  isUploading,
  handleCopy,
  handlePaste,
  handleClearAll,
  isPreview,
  setIsPreview,
}: ToolbarProps) => {
  return (
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
  );
};
