'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContextMenuItem {
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    variant?: 'default' | 'destructive' | 'active' | 'success';
    disabled?: boolean;
}

export interface ContextMenuProps {
    trigger: React.ReactNode;
    items: ContextMenuItem[];
    align?: 'left' | 'right' | 'center';
    className?: string; // Wrapper class
    menuClassName?: string; // Dropdown menu class
    openDirection?: 'down' | 'up';
    zIndex?: number;
}

export function ContextMenu({
    trigger,
    items,
    align = 'right',
    className = '',
    menuClassName = '',
    openDirection = 'down',
    zIndex = 50
}: ContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleTriggerClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleItemClick = (e: React.MouseEvent, item: ContextMenuItem) => {
        if (item.disabled) return;
        e.stopPropagation();
        item.onClick(e);
        setIsOpen(false);
    };

    // Alignment classes
    const alignClasses = {
        left: 'left-0 origin-top-left',
        right: 'right-0 origin-top-right',
        center: 'left-1/2 -translate-x-1/2 origin-top',
    };

    // Animation settings
    const animScale = 0.95;
    const animDistance = openDirection === 'down' ? 10 : -10;

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            <div onClick={handleTriggerClick} className="cursor-pointer">
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: animDistance, scale: animScale }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: animDistance, scale: animScale }}
                        className={`
                            absolute ${openDirection === 'down' ? 'mt-2' : 'mb-2 bottom-full'} 
                            ${alignClasses[align]}
                            w-48 bg-surface/95 backdrop-blur-xl border border-border-subtle 
                            rounded-2xl shadow-2xl overflow-hidden
                            ${menuClassName}
                        `}
                        style={{ zIndex }}
                    >
                        <div className="p-1.5 space-y-1">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => handleItemClick(e, item)}
                                    disabled={item.disabled}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-black
                                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        ${item.variant === 'destructive' 
                                            ? 'text-red-500 hover:bg-red-500/10' 
                                            : item.variant === 'active'
                                                ? 'bg-primary/10 text-primary'
                                                : item.variant === 'success'
                                                    ? 'text-emerald-500 hover:bg-emerald-500/10'
                                                    : 'text-text-primary hover:bg-background'}
                                        text-right justify-end
                                    `}
                                    dir="rtl"
                                >
                                    <span>{item.label}</span>
                                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                                    {item.variant === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-primary mr-auto" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
