'use client';

import { Phone, MessageCircle } from 'lucide-react';

interface AdStickyActionsBarProps {
    phoneNumber: string;
}

export function AdStickyActionsBar({ phoneNumber }: AdStickyActionsBarProps) {
    // Format the phone number for WhatsApp (remove leading 0 and add +20 if it's an Egyptian number)
    let whatsappNumber = phoneNumber;
    if (whatsappNumber.startsWith('0')) {
        whatsappNumber = '+20' + whatsappNumber.substring(1);
    }

    return (
        <div className="fixed bottom-4 left-0 right-0 z-100 px-4 pointer-events-none">
            <div className="max-w-lg mx-auto h-16 rounded-2xl bg-background/80 dark:bg-card/90 backdrop-blur-xl border border-border-subtle/50 shadow-2xl shadow-black/20 flex items-center gap-2 p-2 pointer-events-auto">
                <a
                    href={`tel:${phoneNumber}`}
                    className="flex-1 h-full rounded-xl bg-primary text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                >
                    <Phone className="w-4 h-4" />
                    <span>اتصال بالبائع</span>
                </a>

                {phoneNumber && (
                    <a
                        href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-full rounded-xl bg-green-500 text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                    >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>الواتساب</span>
                    </a>
                )}
            </div>
        </div>
    );
}
