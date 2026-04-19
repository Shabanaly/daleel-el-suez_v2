import { useCallback } from "react";
import { getCloudinarySignature } from "@/lib/actions/media";

interface EditorActionsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (content: string) => void;
  showToast: (props: { title: string; message: string; type?: "SUCCESS" | "ERROR" | "INFO" | "DEFAULT" }) => void;
  showConfirm: (props: { title: string; message: string; type?: "confirm" | "error" | "warning"; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void }) => void;
  setIsUploading: (uploading: boolean) => void;
  setLinkModalOpen: (open: boolean) => void;
}

export function useEditorActions({
  textareaRef,
  onChange,
  showToast,
  showConfirm,
  setIsUploading,
  setLinkModalOpen,
}: EditorActionsProps) {
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
    [onChange, textareaRef],
  );

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
  }, [insertText, setIsUploading]);

  const openLinkModal = useCallback(() => {
    setLinkModalOpen(true);
  }, [setLinkModalOpen]);

  return {
    insertText,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleClearAll,
    addImage,
    openLinkModal,
  };
}
