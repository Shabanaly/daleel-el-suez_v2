'use client';

import { useEffect, useRef } from 'react';
import { incrementPlaceViews } from '@/features/places/actions/places.server';

interface ViewTrackerProps {
    placeId: string;
}

export function ViewTracker({ placeId }: ViewTrackerProps) {
    const viewIncremented = useRef(false);

    useEffect(() => {
        if (viewIncremented.current) return;

        const trackView = async () => {
            const storageKey = `viewed_${placeId}`;
            const lastViewed = localStorage.getItem(storageKey);
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (!lastViewed || (now - parseInt(lastViewed)) > ONE_DAY) {
                viewIncremented.current = true;
                localStorage.setItem(storageKey, now.toString());
                try {
                    await incrementPlaceViews(placeId);
                } catch (error) {
                    console.error('Failed to track view:', error);
                }
            }
        };

        trackView();
    }, [placeId]);

    return null;
}
