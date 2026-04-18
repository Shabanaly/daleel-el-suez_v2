export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  draftKey?: string;
}

export interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  variant?: "default" | "primary" | "error" | "success";
  className?: string;
}
