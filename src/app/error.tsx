"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative w-20 h-20 bg-background border border-border rounded-2xl flex items-center justify-center shadow-xl">
          <AlertTriangle className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h1 className="text-2xl font-black text-text-primary mb-3">
        عذراً، حدث خطأ غير متوقع
      </h1>
      <p className="text-text-muted text-sm max-w-md mb-8 leading-relaxed">
        يبدو أن هناك مشكلة فنية حدثت أثناء محاولة عرض هذه الصفحة. 
        فريق الدعم الفني يعمل دائماً على تحسين تجربة الاستخدام.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <RefreshCcw className="w-4 h-4" />
          إعادة المحاولة
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-text-primary font-bold rounded-xl hover:bg-muted transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>

      {error.digest && (
        <span className="mt-8 text-[10px] text-text-muted opacity-50 font-mono">
          Ref: {error.digest}
        </span>
      )}
    </div>
  );
}
