"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Sparkles,
  Megaphone,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import CustomLink from "@/components/customLink/customLink";
import Image from "next/image";
import type { HeroAd } from "@/features/marketing/types/hero-ads";

interface HeroAdsCarouselProps {
  ads?: HeroAd[];
}

export default function HeroAdsCarousel({ ads = [] }: HeroAdsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    if (isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 10000); // 10 ثواني
    return () => clearInterval(timer);
  }, [isHovered, ads]);

  if (!ads || ads.length === 0) return null;

  const activeAd = ads[index];

  const renderIcon = (type: string | null) => {
    switch (type) {
      case "verified":
        return <BadgeCheck className="w-5 h-5 text-white" />;
      case "offer":
        return <Sparkles className="w-5 h-5 text-white" />;
      case "new":
        return <Megaphone className="w-5 h-5 text-white" />;
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  const hasMedia =
    (activeAd.media_type === "image" || activeAd.media_type === "video") &&
    activeAd.media_url;

  return (
    <div
      className="w-full max-w-5xl mx-auto my-2 px-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeAd.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const swipeThreshold = 50;
              if (info.offset.x > swipeThreshold) {
                // Swipe Right (Previous)
                setIndex((prev) => (prev - 1 + ads.length) % ads.length);
              } else if (info.offset.x < -swipeThreshold) {
                // Swipe Left (Next)
                setIndex((prev) => (prev + 1) % ads.length);
              }
            }}
            className="cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <CustomLink 
              href={activeAd.action_url || "#"} 
              className="block pointer-events-none sm:pointer-events-auto"
              onClick={(e) => {
                // منع الانتقال للرابط إذا كان المستخدم يقوم بالسحب
                if (Math.abs(window.getSelection()?.toString().length || 0) > 0) {
                  e.preventDefault();
                }
              }}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-500 shadow-xl shadow-primary/5 hover:shadow-primary/20 hover:border-primary/40 group/card w-full h-[180px] sm:h-[200px] md:h-[240px] flex flex-col justify-end pointer-events-auto ${!hasMedia ? "glass-panel" : "bg-black"}`}
              >
                {/* Background Media (Image / Video) */}
                {hasMedia && (
                  <>
                    {activeAd.media_type === "video" ? (
                      <video
                        src={activeAd.media_url || ""}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/card:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={activeAd.media_url || ""}
                          alt={activeAd.title}
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover/card:scale-110"
                          priority
                        />
                      </div>
                    )}
                    {/* Gradient Overlay for Text Legibility - Balanced for premium look */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  </>
                )}

                {/* Fallback Content if No Media */}
                {!hasMedia && (
                  <>
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent pointer-events-none" />
                  </>
                )}

                {/* Overlay Content Area (Text & CTA) */}
                <div className="relative z-10 p-5 md:p-6 w-full flex items-end justify-between gap-4">
                  {/* Text Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {activeAd.tag_text && (
                        <span
                          className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 ${
                            activeAd.icon_type === "verified"
                              ? "bg-primary/80 text-white"
                              : activeAd.icon_type === "offer"
                                ? "bg-accent/90 text-white"
                                : "bg-success/80 text-white"
                          }`}
                        >
                          {renderIcon(activeAd.icon_type)}
                          {activeAd.tag_text}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-lg sm:text-xl md:text-2xl font-black mb-1 truncate group-hover/card:text-primary transition-colors ${hasMedia ? "text-white" : "text-text-primary"}`}
                    >
                      {activeAd.title}
                    </h3>
                    {activeAd.description && (
                      <p
                        className={`text-xs sm:text-sm font-medium line-clamp-2 ${hasMedia ? "text-white/80" : "text-text-muted"}`}
                      >
                        {activeAd.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CustomLink>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots (Outside the image to not crowd it) */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                    : "w-2 bg-primary/20 hover:bg-primary/50"
                }`}
                aria-label={`Go to ad ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
