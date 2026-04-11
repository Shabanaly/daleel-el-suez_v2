'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const LightboxComponent = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';

// CSS imports
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface LightboxProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
}

export function Lightbox({ images,  isOpen, onClose }: LightboxProps) {

    // Handle browser back button to close lightbox instead of leaving page
    useEffect(() => {
        if (!isOpen) return;

        let popped = false;

        const handlePopState = () => {
            popped = true;
            onClose();
        };

        window.history.pushState({ lightbox: 'open' }, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (!popped) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);

    // ✅ FIX: تثبيت slides
    const slides = useMemo(() => {
        return images.map((src) => ({ src }));
    }, [images]);

    // ✅ FIX: تثبيت plugins (اختياري بس مفيد)
    const plugins = useMemo(() => [Zoom, Thumbnails], []);

    if (images.length === 0) return null;

    return (
        <LightboxComponent
            open={isOpen}
            close={onClose}
            slides={slides}
            plugins={plugins}
            render={{
                buttonPrev: images.length <= 1 ? () => null : undefined,
                buttonNext: images.length <= 1 ? () => null : undefined,
            }}
            zoom={{
                maxZoomPixelRatio: 3,
                zoomInMultiplier: 2,
                doubleTapDelay: 300,
                doubleClickDelay: 300,
                doubleClickMaxStops: 2,
                keyboardMoveDistance: 50,
                wheelZoomDistanceFactor: 100,
                pinchZoomDistanceFactor: 100,
                scrollToZoom: false,
            }}
            thumbnails={{
                position: "bottom",
                width: 120,
                height: 80,
                border: 2,
                gap: 12,
                padding: 4,
                borderRadius: 16,
                showToggle: false,
            }}
            styles={{
                container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
                thumbnail: {
                    borderRadius: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                },
                root: {
                    "--yarl__color_backdrop": "rgba(0, 0, 0, 0.95)",
                    "--yarl__thumbnails_container_background": "transparent",
                    "--yarl__thumbnails_thumbnail_background": "rgba(255, 255, 255, 0.1)",
                    "--yarl__thumbnails_thumbnail_active_border_color": "var(--primary)",
                },
            } as any}
        />
    );
}