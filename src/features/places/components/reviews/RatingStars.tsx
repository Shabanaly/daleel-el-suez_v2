'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
    rating: number;
    max?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function RatingStars({
    rating,
    max = 5,
    onChange,
    readonly = false,
    size = 'md'
}: RatingStarsProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-5 h-5',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex gap-1" dir="ltr">
            {[...Array(max)].map((_, i) => {
                const starIndex = i + 1;
                const active = (hoverRating || rating) >= starIndex;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={readonly}
                        onMouseEnter={() => !readonly && setHoverRating(starIndex)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        onClick={() => !readonly && onChange?.(starIndex)}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110 active:scale-95'} ${active ? 'text-primary' : 'text-border-subtle hover:text-primary/50'}`}
                    >
                        <Star className={`${sizes[size]} ${active ? 'fill-current' : ''}`} />
                    </button>
                );
            })}
        </div>
    );
}
