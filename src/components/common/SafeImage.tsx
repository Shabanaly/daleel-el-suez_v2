'use client';

import { useState } from 'react';
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

    const handleError = () => {
        setHasError(true);
        if (onErrorAction) {
            onErrorAction();
        }
    };

    if (hasError) {
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
            {...props}
        />
    );
}
