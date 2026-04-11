"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import {
  BadgeCheck,
  Sparkles,
  Megaphone,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { MapPinPlus } from "lucide-react";
import CustomLink from "@/components/customLink/customLink";
import Image from "next/image";
import type { HeroAd } from "@/features/marketing/types/hero-ads";
import { ROUTES } from "@/constants";

interface HeroAdsCarouselProps {
  ads?: HeroAd[];
}

export default function HeroAdsCarousel({ ads = [] }: HeroAdsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index],
  );

  const goPrev = useCallback(() => {
    goTo((index - 1 + ads.length) % ads.length);
  }, [index, ads.length, goTo]);

  const goNext = useCallback(() => {
    goTo((index + 1) % ads.length);
  }, [index, ads.length, goTo]);

  useEffect(() => {
    if (!ads || ads.length <= 1 || isHovered) return;
    const timer = setInterval(goNext, 8000);
    return () => clearInterval(timer);
  }, [isHovered, ads, goNext]);

  if (!ads || ads.length === 0) return null;

  const activeAd = ads[index];

  const hasMedia =
    (activeAd.media_type === "image" || activeAd.media_type === "video") &&
    activeAd.media_url;

  const renderBadge = (type: string | null) => {
    const icons: Record<string, React.ReactNode> = {
      verified: <BadgeCheck className="w-3.5 h-3.5" />,
      offer: <Sparkles className="w-3.5 h-3.5" />,
      new: <Megaphone className="w-3.5 h-3.5" />,
    };
    const colors: Record<string, string> = {
      verified: "bg-primary/90 border-primary/40",
      offer: "bg-amber-500/90 border-amber-400/40",
      new: "bg-emerald-500/90 border-emerald-400/40",
    };
    const key = type ?? "offer";
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white backdrop-blur-sm border ${colors[key] ?? colors["offer"]}`}
      >
        {icons[key] ?? icons["offer"]}
        {activeAd.tag_text}
      </span>
    );
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.97 }),
  };

  return (
    <div
      className="w-full mt-6 mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Outer wrapper: edge-to-edge on mobile, max-w + rounded on desktop ── */}
      <div className="relative mx-0 md:mx-auto md:max-w-6xl md:px-4">
        <div
          className={`relative overflow-hidden
            h-[200px] sm:h-[240px] md:h-[300px]
            rounded-t-1xl md:rounded-t-4xl
            group
          `}
        >
          {/* ── Background ── */}
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <m.div
              key={activeAd.id + "-bg"}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {hasMedia ? (
                activeAd.media_type === "video" ? (
                  <video
                    src={activeAd.media_url!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
                  />
                ) : (
                  <Image
                    src={activeAd.media_url!}
                    alt={activeAd.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1152px, 1152px"
                    className="object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
                    priority
                  />
                )
              ) : (
                /* Fallback gradient when no media */
                <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-surface to-elevated" />
              )}

              {/* Light overlay — keeps media visible, text readable */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
            </m.div>
          </AnimatePresence>

          {/* ── Centered Content ── */}
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <m.div
              key={activeAd.id + "-content"}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.05,
              }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5 gap-2 md:gap-3"
            >
              {/* Badge */}
              {activeAd.tag_text && renderBadge(activeAd.icon_type)}

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight max-w-2xl drop-shadow-lg">
                {activeAd.title}
              </h2>

              {/* Description */}
              {activeAd.description && (
                <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed drop-shadow line-clamp-2">
                  {activeAd.description}
                </p>
              )}

              {/* CTA Button — أضف مكانك */}
              <CustomLink href={activeAd.action_url}>
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-xs md:text-sm rounded-full
                             shadow-lg shadow-black/20
                             hover:bg-primary hover:text-white
                             transition-colors duration-300 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  اضغط هنا
                </m.button>
              </CustomLink>
            </m.div>
          </AnimatePresence>

          {/* ── Arrow Navigation (Desktop) ── */}
          {ads.length > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="السابق"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                           hidden md:flex items-center justify-center
                           w-10 h-10 rounded-full
                           bg-black/30 hover:bg-black/60
                           text-white backdrop-blur-sm border border-white/10
                           transition-all duration-200
                           opacity-0 group-hover:opacity-100"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                aria-label="التالي"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                           hidden md:flex items-center justify-center
                           w-10 h-10 rounded-full
                           bg-black/30 hover:bg-black/60
                           text-white backdrop-blur-sm border border-white/10
                           transition-all duration-200
                           opacity-0 group-hover:opacity-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </>
          )}

          {/* ── Dots Navigation (inside image, bottom) ── */}
          {ads.length > 1 && (
            <div
              className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2"
              onTouchStart={(e) => e.stopPropagation()}
            >
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`الإعلان ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-400 ${
                    i === index
                      ? "w-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ── Swipe support (Mobile) ── */}
          <m.div
            className="absolute inset-0 z-5 touch-pan-y"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) goPrev();
              else if (info.offset.x < -50) goNext();
            }}
          />
          </LazyMotion>
        </div>
      </div>
    </div>
  );
}
