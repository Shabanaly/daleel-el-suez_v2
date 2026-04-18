'use client';

import React from 'react';
import { useDialog } from '@/components/providers/DialogProvider';

/**
 * ShareButton Component
 * 
 * A reusable client component that provides native sharing functionality
 * with a fallback to clipboard copying. Follows best practices for 
 * performance and reliability.
 */

interface ShareButtonProps {
    /** The title of the share dialog */
    title: string;
    /** The text content to share */
    text: string;
    /** The URL to share (optional, defaults to current window location) */
    url?: string;
    /** Optional CSS classes for the button */
    className?: string;
    /** Optional custom children for the button */
    children?: React.ReactNode;
    /** Optional callback for when sharing/copying is successful */
    onSuccess?: () => void;
}

export default function ShareButton({
    title,
    text,
    url,
    className = "",
    children,
    onSuccess
}: ShareButtonProps) {
    const { showAlert } = useDialog();

    const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Only triggers on user interaction (click) - e.preventDefault() if used in <a> or <form>
        e.preventDefault();
        e.stopPropagation();

        // Get the URL lazily at the moment of interaction
        let shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
        
        // If the URL is relative, prepend the origin on the client side
        if (shareUrl.startsWith('/') && typeof window !== 'undefined') {
            shareUrl = `${window.location.origin}${shareUrl}`;
        }

        // The Web Share API must be called in response to a user gesture
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                if (onSuccess) onSuccess();
            } catch (error) {
                // If the user cancels or the API fails, we don't necessarily want to fallback to clipboard
                // unless it's a real failure. AbortError is user cancellation.
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Error with Web Share API:', error);
                    await fallbackCopy(shareUrl);
                }
            }
        } else {
            // Fallback to clipboard if Web Share API is not supported (likely desktop)
            await fallbackCopy(shareUrl);
        }
    };

    const fallbackCopy = async (resolvedUrl?: string) => {
        const shareUrl = resolvedUrl || url || (typeof window !== 'undefined' ? window.location.href : '');
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                // Construct share text and URL for clipboard
                const fullShareContent = `${text ? text + '\n\n' : ''}${shareUrl}`;
                await navigator.clipboard.writeText(fullShareContent);

                if (onSuccess) {
                    onSuccess();
                } else {
                    // Default browser feedback if no success callback provided
                    showAlert({
                        title: 'نجاح',
                        message: 'تم نسخ الرابط للحافظة بنجاح! ✨',
                        type: 'success'
                    });
                }
            } else {
                // Final fallback using a hidden input for legacy/non-secure environments
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = shareUrl;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);

                if (onSuccess) {
                    onSuccess();
                } else {
                    showAlert({
                        title: 'نجاح',
                        message: 'تم نسخ الرابط بنجاح! ✨',
                        type: 'success'
                    });
                }
            }
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={className}
            aria-label="مشاركةContent"
        >
            {children || (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Pure SVG icon to avoid external library dependencies */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span>مشاركة</span>
                </span>
            )}
        </button>
    );
}
