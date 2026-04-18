import { MenuButtonProps } from "./types";

export const MenuButton = ({
  onClick,
  children,
  title,
  variant = "default",
  className = "",
}: MenuButtonProps) => (
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

export const Divider = () => (
  <div className="w-px h-6 bg-border-subtle/60 mx-1 shrink-0" />
);
