"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  onErrorAction?: () => void;
  fallback?: React.ReactNode;
}

/**
 * A robust wrapper around Next.js Image component that handles loading errors.
 * It provides a fallback or calls an action if the image fails to load.
 */
export function SafeImage({
  src,
  alt,
  onErrorAction,
  fallback,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset error state if src changes
  useEffect(() => {
    setTimeout(() => setHasError(false), 0);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    if (onErrorAction) {
      onErrorAction();
    }
  };

  // Prevent hydration mismatch by returning a stable placeholder during SSR
  if (!isMounted) {
    // Return a simple div that matches the layout of an image with 'fill' or dimensions
    return (
      <div 
        className={props.className} 
        style={props.fill ? { position: 'absolute', inset: 0 } : { width: props.width, height: props.height }} 
      />
    );
  }

  // Only show fallback if we have an error AND there's no onErrorAction
  if (hasError && !onErrorAction) {
    return <>{fallback || null}</>;
  }

  // Ensure src is not empty
  if (!src) {
    return <>{fallback || null}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={handleError}
      // Add a key based on src so React forces a remount/reload of the img tag when src changes
      key={typeof src === "string" ? src : "img"}
      // Default sizes for optimization if fill is used
      sizes={
        props.fill
          ? props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          : undefined
      }
      {...props}
    />
  );
}
