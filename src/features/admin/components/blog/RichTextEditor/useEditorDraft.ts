import { useState, useEffect, useCallback } from "react";

export function useEditorDraft(content: string, onChange: (content: string) => void, draftKey?: string) {
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

  return {
    hasDraft,
    handleRestoreDraft,
    handleClearDraft,
  };
}
