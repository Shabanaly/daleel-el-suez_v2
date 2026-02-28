'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithIdToken } from '@/lib/actions/auth';
import { useAuth } from '@/components/providers/AuthProvider';

interface GoogleOneTapProps {
    clientId: string;
}

export function GoogleOneTap({ clientId }: GoogleOneTapProps) {
    const router = useRouter();
    const { user, isLoading, refreshSession } = useAuth();
    const initialized = useRef(false);



    console.log('[GSI] Component mounted with clientId:', clientId ? 'EXISTS' : 'MISSING');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const initializeOneTap = () => {
            console.log('[GSI] initializeOneTap called. google exists:', !!window.google, 'already initialized:', initialized.current);
            if (!window.google || initialized.current) return;

            // Diagnostic log for local IP issues
            if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.protocol.includes('https')) {
                console.warn(`[GSI] Detect non-secure origin: ${window.location.origin}. Google One Tap (GSI) will likely fail with "origin_not_allowed". Please use localhost or a secure HTTPS domain.`);
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: any) => {
                        try {
                            const result = await loginWithIdToken(response.credential);
                            // @ts-ignore - Handle possible result variations
                            if (result?.success || !result?.error) {
                                await refreshSession();
                                router.refresh();
                                router.push(`/?t=${Date.now()}`);
                            } else {
                                console.error('One Tap Error:', result.error);
                            }
                        } catch (err) {
                            console.error('One Tap Login Failed:', err);
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: true, // Enable FedCM for better browser support
                });

                // Small delay to let the page settle
                timeoutId = setTimeout(() => {
                    console.log('[GSI] Attempting to display One Tap prompt...');
                    if (window.google) {
                        try {
                            window.google.accounts.id.prompt((notification: any) => {
                                console.log('[GSI] Prompt notification:', {
                                    moment: notification.getMomentType(),
                                    isDisplayed: notification.isDisplayed(),
                                    isNotDisplayed: notification.isNotDisplayed(),
                                    notDisplayedReason: notification.isNotDisplayed() ? notification.getNotDisplayedReason() : null,
                                    isSkipped: notification.isSkippedMoment(),
                                    skippedReason: notification.isSkippedMoment() ? notification.getSkippedReason() : null,
                                    isDismissed: notification.isDismissedMoment(),
                                    dismissedReason: notification.isDismissedMoment() ? notification.getDismissedReason() : null,
                                });
                            });
                        } catch (promptErr) {
                            console.error('[GSI] One Tap Prompt Error:', promptErr);
                        }
                    }
                }, 1500);

                initialized.current = true;
                console.log('[GSI] Google One Tap initialized successfully');
            } catch (error) {
                console.error('[GSI] Error initializing Google One Tap:', error);
            }
        };

        // Check if google is loaded, otherwise poll
        if (window.google) {
            console.log('[GSI] Google script already loaded');
            initializeOneTap();
        } else {
            console.log('[GSI] Google script not loaded yet, starting interval...');
            const interval = setInterval(() => {
                if (window.google) {
                    console.log('[GSI] Google script loaded via interval');
                    clearInterval(interval);
                    initializeOneTap();
                }
            }, 500);

            return () => {
                clearInterval(interval);
                if (timeoutId) clearTimeout(timeoutId);
            };
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            // We don't call cancel() here normally to avoid breaking GSI on navigation
        };
    }, [clientId, router, isLoading, user]);

    // Don't run One Tap if user is already logged in or auth is still loading
    if (isLoading || user) return null;

    return null;
}

// Add global type for Google
declare global {
    interface Window {
        google: any;
        __GSI_INITIALIZED__?: boolean;
    }
}
