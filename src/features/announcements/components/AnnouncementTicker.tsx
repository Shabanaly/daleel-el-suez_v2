"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Announcement } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementTickerProps {
  announcements: Announcement[];
}

export default function AnnouncementTicker({ announcements }: AnnouncementTickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // Check if user dismissed this session
    const isDismissed = sessionStorage.getItem("announcement-dismissed");
    if (!isDismissed && announcements.length > 0) {
      // Defer to avoid cascading renders
      Promise.resolve().then(() => setIsVisible(true));
    }
  }, [announcements]);

  // Handle CSS variable for ticker height to sync with sidebars
  useEffect(() => {
    const root = document.documentElement;
    if (isVisible && height > 0) {
      root.style.setProperty("--ticker-height", `${height}px`);
    } else {
      root.style.setProperty("--ticker-height", "0px");
    }
    
    return () => {
      root.style.setProperty("--ticker-height", "0px");
    };
  }, [isVisible, height]);

  const onRefChange = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  const nextAnnouncement = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, [announcements.length]);


  const prevAnnouncement = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  }, [announcements.length]);

  useEffect(() => {
    if (!isVisible || isPaused || announcements.length <= 1) return;

    // Increased interval to account for word-by-word reveal time
    const timer = setInterval(nextAnnouncement, 7000); 
    return () => clearInterval(timer);
  }, [isVisible, isPaused, announcements.length, nextAnnouncement]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  // Ensure currentIndex is always within bounds (important when items are deleted)
  // Adjusted during render to avoid cascading renders
  if (currentIndex >= announcements.length && announcements.length > 0) {
    setCurrentIndex(0);
  }

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  if (!current) return null; // Safety check


  return (
    <AnimatePresence>
      <motion.div
        ref={onRefChange}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative isolate flex items-center bg-elevated/80 backdrop-blur-md px-2 sm:px-4 py-2 border-b border-border-subtle z-60"
      >

        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-1 sm:gap-4">
          
          {/* Controls - Previous */}
          {announcements.length > 1 && (
            <button 
              onClick={prevAnnouncement}
              className="p-1 text-text-muted hover:text-text-primary transition-colors shrink-0"
              aria-label="السابق"
            >
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          )}

          {/* Content Area */}
          <div className="flex-1 min-h-[24px] flex items-center justify-center overflow-hidden py-1 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full text-center"
              >
                <StaggeredAnnouncement item={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls - Next & Close */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {announcements.length > 1 && (
              <button 
                onClick={nextAnnouncement}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                aria-label="التالي"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            ) }
            
            <div className="w-px h-3 sm:h-4 bg-border-subtle mx-0.5 sm:mx-1" />
            
            <button
              onClick={handleDismiss}
              className="p-1 text-text-muted hover:text-error transition-colors"
              aria-label="إغلاق"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StaggeredAnnouncement({ item }: { item: Announcement }) {
  // Split content into words
  const words = useMemo(() => item.content.split(" "), [item.content]);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 }, // Delay words slightly for label flip
    }),
  };

  // Special variant for the label: Vertical Flip
  const labelVariant = {
    hidden: { 
      opacity: 0, 
      y: 15,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 150,
        duration: 0.5
      },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: 10, // Slide in from right for RTL feel
      y: 0,
    },
  };


  const content = (
    <motion.span 
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center gap-x-1.5 text-xs sm:text-sm font-medium text-text-primary/90 whitespace-nowrap overflow-hidden"
    >
      <motion.span 
        variants={labelVariant} 
        className="shrink-0 flex items-center justify-center px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20 ml-1 origin-center"
      >
        <strong className="text-[10px] uppercase font-bold text-primary tracking-wider">
          {item.label || "هام"}
        </strong>
      </motion.span>
      
      <div className="flex items-center gap-x-1.5 overflow-hidden text-ellipsis">
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block shrink-0"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.span>
  );


  if (item.link) {
    return (
      <a href={item.link} className="hover:underline hover:text-primary transition-all decoration-primary/30 underline-offset-4">
        {content}
      </a>
    );
  }

  return content;
}
