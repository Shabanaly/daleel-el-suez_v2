'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithIdToken } from '@/lib/actions/auth';

interface GoogleOneTapProps {
    clientId: string;
}

export function GoogleOneTap({ clientId }: GoogleOneTapProps) {
    const router = useRouter();

    useEffect(() => {
        const initializeOneTap = () => {
            if (!window.google) return;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    const result = await loginWithIdToken(response.credential);
                    if (result.success) {
                        router.push('/');
                        router.refresh();
                    } else {
                        console.error('One Tap Error:', result.error);
                    }
                },
                cancel_on_tap_outside: false,
            });

            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                } else if (notification.isSkippedMoment()) {
                    console.log('One Tap skipped:', notification.getSkippedReason());
                } else if (notification.isDismissedMoment()) {
                    console.log('One Tap dismissed:', notification.getDismissedReason());
                }
            });
        };

        // Check if script is already loaded
        if (window.google) {
            initializeOneTap();
        } else {
            // Wait for script to load if it's in the layout
            const interval = setInterval(() => {
                if (window.google) {
                    clearInterval(interval);
                    initializeOneTap();
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [clientId, router]);

    return null;
}

// Add global type for Google
declare global {
    interface Window {
        google: any;
    }
}
