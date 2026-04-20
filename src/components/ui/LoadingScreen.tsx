"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Simulated progress logic
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return Math.min(90, prev + Math.random() * 15);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle initial load
  useEffect(() => {
    const handleInitialLoad = () => {
      if (document.readyState !== "complete") {
        setIsLoading(true);
        window.addEventListener("load", () => {
          setProgress(100);
          setTimeout(() => setIsLoading(false), 300);
        });
      }
    };
    handleInitialLoad();
  }, []);

  // Intercept Link clicks to show loader instantly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ignore clicks inside buttons, inputs, or elements explicitly marked with data-no-loader
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("[data-no-loader]")
      ) {
        return;
      }

      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.target &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        anchor.getAttribute("href") !== pathname // Avoid same page reloads
      ) {
        // It's an internal link
        setIsLoading(true);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center p-6 overflow-hidden select-none"
        >
          {/* Glassmorphism Backdrop */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl" />

          {/* Organic Mesh Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[140px] rounded-full"
            />
            <motion.div
              animate={{
                x: [0, -40, 0],
                y: [0, 60, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[140px] rounded-full"
            />
          </div>

          {/* Subtle Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')] bg-size-[128px_128px]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* High-End Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="relative"
            >
              {/* Outer Glow Rings */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -inset-1 bg-linear-to-tr from-primary/20 to-accent/20 rounded-full blur-md" />

              <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full p-[2px] bg-linear-to-tr from-white/30 via-white/10 to-transparent border border-white/20 shadow-2xl backdrop-blur-md overflow-hidden group">
                <div className="w-full h-full rounded-full bg-linear-to-b from-white/10 to-black/5 overflow-hidden relative inner-shadow-lg">
                  <Image
                    src="/favicon-circular.ico"
                    alt="Suez Guide Logo"
                    fill
                    sizes="(max-width: 768px) 128px, 176px"
                    className="object-contain p-5 drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                    priority
                  />
                  {/* Glass Shine */}
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* Text Information */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 text-center"
            >
              <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tighter mb-2 drop-shadow-lg">
                دليل السويس
              </h2>
              <p className="text-xs md:text-sm font-bold text-primary animate-pulse tracking-widest uppercase mb-4">
                جاري التحميل...
              </p>
            </motion.div>

            {/* Main Progress Bar - Prominent & Aesthetic */}
            <div className="mt-10 w-48 md:w-64">
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 backdrop-blur-md shadow-inner">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 25, stiffness: 80 }}
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-primary via-accent to-primary shadow-[0_0_15px_rgba(0,102,255,0.6)] rounded-full"
                />
                {/* Progress Glow Overlay */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-white/20 blur-[2px]"
                />
              </div>

              <div className="mt-4 flex justify-between items-center px-1">
                <motion.span
                  className="text-[9px] font-black text-primary/60 uppercase tracking-widest"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  برجاء الانتظار...
                </motion.span>
                <span className="text-[10px] font-black text-text-primary/70 tabular-nums">
                  {Math.floor(progress)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
