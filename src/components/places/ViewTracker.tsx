'use client';

import { useEffect } from 'react';
import { incrementPlaceViews } from '@/lib/actions/places';

interface ViewTrackerProps {
    placeId: string;
}

export function ViewTracker({ placeId }: ViewTrackerProps) {
    useEffect(() => {
        const trackView = async () => {
            const storageKey = `viewed_${placeId}`;
            const lastViewed = localStorage.getItem(storageKey);
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (!lastViewed || (now - parseInt(lastViewed)) > ONE_DAY) {
                try {
                    await incrementPlaceViews(placeId);
                    localStorage.setItem(storageKey, now.toString());
                } catch (error) {
                    console.error('Failed to track view:', error);
                }
            }
        };

        trackView();
    }, [placeId]);

    return null;
}
