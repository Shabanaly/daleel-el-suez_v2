'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface NativeBackButtonProps {
    className?: string;
}

export function NativeBackButton({ className = '' }: NativeBackButtonProps) {
    const router = useRouter();

    return (
        <button 
            onClick={() => router.back()}
            className={`flex items-center justify-center text-text-muted hover:text-text-primary transition-all active:scale-75 ${className}`}
            title="رجوع"
        >
            <ChevronRight className="w-10 h-10" />
        </button>
    );
}
