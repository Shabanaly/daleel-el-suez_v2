import React from 'react';

interface PriceTagProps {
    price: number;
    currency?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function PriceTag({ 
    price, 
    currency = 'ج.م', 
    className = '', 
    size = 'md' 
}: PriceTagProps) {
    const formattedPrice = new Intl.NumberFormat('ar-EG').format(price);
    
    const sizeClasses = {
        sm: 'text-sm font-bold',
        md: 'text-base font-extrabold',
        lg: 'text-xl font-black',
    };

    return (
        <div className={`inline-flex items-center gap-1 text-primary ${sizeClasses[size]} ${className}`} dir="rtl">
            <span>{formattedPrice}</span>
            <span className="text-[0.8em] opacity-80 font-medium">{currency}</span>
        </div>
    );
}
