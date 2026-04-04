'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { loginWithIdToken } from '../actions/auth.server';

interface GoogleOneTapProps {
    clientId: string;
}

export function GoogleOneTap({ clientId }: GoogleOneTapProps) {
    const router = useRouter();
    const { user, isLoading, refreshSession } = useAuth();
    const initialized = useRef(false);



    useEffect(() => {
        // 🛑 CRITICAL: Exit immediately and cancel any prompt if user is already logged in
        if (user || isLoading) {
            if (window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.cancel();
                } catch {
                    // Ignore if google script isn't fully ready yet
                }
            }
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const initializeOneTap = () => {
            if (!window.google || initialized.current || user) return;

            // Diagnostic log for local IP issues
            if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.protocol.includes('https')) {
                console.warn(`[GSI] Detect non-secure origin: ${window.location.origin}. Google One Tap (GSI) will likely fail with "origin_not_allowed". Please use localhost or a secure HTTPS domain.`);
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        try {
                            const result = await loginWithIdToken(response.credential);
                            if (result?.success || !result?.error) {
                                await refreshSession();
                                router.refresh();
                                router.push(`/?t=${Date.now()}`);
                            } else {
                                console.error('One Tap Error:', result.error);
                            }
                        } catch (err: unknown) {
                            console.error('One Tap Login Failed:', err);
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: true, // Enable FedCM for better browser support
                });

                // Small delay to let the page settle
                timeoutId = setTimeout(() => {
                    if (window.google && !user) {
                        try {
                            window.google.accounts.id.prompt();
                        } catch (promptErr) {
                            console.error('[GSI] One Tap Prompt Error:', promptErr);
                        }
                    }
                }, 1500);

                initialized.current = true;
            } catch (error) {
                console.error('[GSI] Error initializing Google One Tap:', error);
            }
        };

        // Check if google is loaded, otherwise poll
        if (window.google) {
            initializeOneTap();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    clearInterval(interval);
                    initializeOneTap();
                }
            }, 500);

            return () => {
                clearInterval(interval);
                if (timeoutId) clearTimeout(timeoutId);
                if (window.google?.accounts?.id) window.google.accounts.id.cancel();
            };
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (window.google?.accounts?.id) window.google.accounts.id.cancel();
        };
    }, [clientId, router, isLoading, user, refreshSession]);

    // Don't run One Tap if user is already logged in or auth is still loading
    if (isLoading || user) return null;

    return null;
}

// Add global type for Google
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => Promise<void>;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                        use_fedcm_for_prompt?: boolean;
                    }) => void;
                    prompt: () => void;
                    cancel: () => void;
                };
            };
        };
        __GSI_INITIALIZED__?: boolean;
    }
}
