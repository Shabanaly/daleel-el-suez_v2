'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isPending?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isPending }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // Fixed window size for a unified stable layout

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Case 1: Near the Start
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('ellipsis-end');
                pages.push(totalPages);
            }
            // Case 2: Near the End
            else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('ellipsis-start');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            }
            // Case 3: In the Middle
            else {
                pages.push(1);
                pages.push('ellipsis-start');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('ellipsis-end');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="mt-12 md:mt-16 flex items-center justify-center gap-2 md:gap-4 px-2 select-none">
            {/* Previous Button */}
            <button
                disabled={currentPage === 1 || isPending}
                onClick={() => onPageChange(currentPage - 1)}
                className="group flex items-center justify-center h-9 w-9 md:h-11 md:w-auto md:px-4 rounded-xl bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
                aria-label="Previous Page"
            >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform md:hidden rtl:group-hover:translate-x-1" />
                <span className="hidden md:flex items-center gap-2 font-bold text-sm">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    السابق
                </span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 md:gap-2">
                {getPageNumbers().map((p, i) => {
                    if (typeof p === 'string') {
                        return (
                            <div key={p + i} className="w-6 h-8 md:w-8 md:h-11 flex items-center justify-center text-text-muted/50">
                                <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                        );
                    }

                    const isActive = p === currentPage;

                    return (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            disabled={isPending}
                            className={`relative shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border ${isActive
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                                    : 'bg-surface/50 text-text-muted border-border-subtle hover:bg-surface hover:text-text-primary hover:border-border'
                                } disabled:cursor-not-allowed`}
                        >
                            {p}
                            {isActive && (
                                <motion.div
                                    layoutId="pagination-active"
                                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                disabled={currentPage === totalPages || isPending}
                onClick={() => onPageChange(currentPage + 1)}
                className="group flex items-center justify-center h-9 w-9 md:h-11 md:w-auto md:px-4 rounded-xl bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
                aria-label="Next Page"
            >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform md:hidden rtl:group-hover:-translate-x-1" />
                <span className="hidden md:flex items-center gap-2 font-bold text-sm">
                    التالي
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
            </button>
        </div>
    );
}
