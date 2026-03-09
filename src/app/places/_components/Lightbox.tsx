'use client';

import { useState, useEffect } from 'react';
import LightboxComponent from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';

// CSS imports
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface LightboxProps {
    images: string[];
    index: number;
    isOpen: boolean;
    onClose: () => void;
}

export function Lightbox({ images, index: initialIndex, isOpen, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Format images for the lightbox
    const slides = images.map((src) => ({ src }));

    return (
        <LightboxComponent
            open={isOpen}
            close={onClose}
            index={currentIndex}
            slides={slides}
            plugins={[Zoom, Thumbnails]}
            on={{
                view: ({ index }) => setCurrentIndex(index),
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
                } as any,
            }}
        />
    );
}
