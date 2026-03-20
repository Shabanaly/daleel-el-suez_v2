'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
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

    // Reset error state if src changes (e.g., trying a fallback image)
    useEffect(() => {
        setTimeout(() => setHasError(false), 0);
    }, [src]);

    const handleError = () => {
        setHasError(true);
        if (onErrorAction) {
            onErrorAction();
        }
    };

    // Only show fallback if we have an error AND there's no onErrorAction
    // OR if the parent component decides it's the final fallback based on context.
    // In our case, the parent changes the `src` when onErrorAction is called,
    // which resets `hasError` to false via the useEffect above.
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
            key={typeof src === 'string' ? src : 'img'} 
            {...props}
        />
    );
}
