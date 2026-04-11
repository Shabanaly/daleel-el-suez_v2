import { Loader2 } from "lucide-react";

interface SocialButtonsProps {
  onGoogleLogin: () => void;
  isLoading: boolean;
  socialLoading: "google" | "facebook" | null;
}

export function SocialButtons({
  onGoogleLogin,
  isLoading,
  socialLoading,
}: SocialButtonsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4 w-full py-2 relative z-10">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
          أو استمر عبر
        </span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <div className="grid grid-cols-1 gap-3 w-full relative z-10">
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading || socialLoading !== null}
          className="h-12 rounded-xl bg-surface border border-border-subtle flex items-center justify-center gap-3 font-semibold text-text-primary hover:bg-elevated transition-all active:scale-[0.98] group disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.74 24.55c0-1.64-.15-3.22-.44-4.74H24v9h12.75c-.56 3.06-2.29 5.64-4.89 7.39l7.7 5.96C44.07 37.8 46.74 31.78 46.74 24.55z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.7-5.96c-2.21 1.49-5.04 2.37-8.19 2.37-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          )}
          <span className="text-sm">جوجل</span>
        </button>
      </div>
    </div>
  );
}
