"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * loading.tsx - Next.js native loading UI
 * 
 * This is automatically shown by Next.js during route transitions.
 * It provides a premium, branded loading experience without the hazards 
 * of manually tracking searchParams or navigation states.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-hidden select-none bg-background">
      {/* Glassmorphism Backdrop and Gradients */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl" />

      {/* Organic Mesh Gradients (Static or slightly moving) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[140px] rounded-full"
        />
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')] bg-size-[128px_128px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-[2px] bg-linear-to-tr from-white/30 via-white/10 to-transparent border border-white/20 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="w-full h-full rounded-full bg-linear-to-b from-white/10 to-black/5 flex items-center justify-center p-5">
              <Image
                src="/favicon-circular.ico"
                alt="Suez Guide"
                width={120}
                height={120}
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Text Information */}
        <div className="mt-8 text-center" dir="rtl">
          <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">
            دليل السويس
          </h2>
          <div className="flex gap-1 justify-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Progress bar (Simulated loop) */}
        <div className="mt-10 w-40 md:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 backdrop-blur-md shadow-inner relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-primary to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
