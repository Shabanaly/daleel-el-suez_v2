import React from 'react';
import { User } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';

interface SellerInfoProps {
    name: string;
    photo?: string;
    showAvatar?: boolean;
    className?: string;
}

export default function SellerInfo({ 
    name, 
    photo, 
    showAvatar = true, 
    className = '' 
}: SellerInfoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`} dir="rtl">
            {showAvatar && (
                <div className="w-6 h-6 rounded-full bg-elevated border border-border-subtle overflow-hidden flex items-center justify-center shrink-0 text-text-muted">
                    {photo ? (
                        <SafeImage 
                            src={photo} 
                            alt={name} 
                            fill
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <User className="w-3.5 h-3.5" />
                    )}
                </div>
            )}
            <span className="text-xs font-medium text-text-secondary truncate">{name}</span>
        </div>
    );
}
