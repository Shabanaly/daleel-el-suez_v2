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
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            // Show current and its neighbors
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="mt-12 md:mt-16 flex items-center justify-center gap-2 md:gap-4 px-2 select-none">
            {/* Previous Button */}
            <button
                disabled={currentPage === 1 || isPending}
                onClick={() => onPageChange(currentPage - 1)}
                className="group flex items-center justify-center h-11 w-11 rounded-xl bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm rtl:rotate-180 md:rtl:rotate-0"
                aria-label="Previous Page"
            >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform md:hidden" />
                <span className="hidden md:flex items-center gap-2 font-bold text-sm px-4">
                    <ChevronRight className="w-4 h-4" />
                    السابق
                </span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 md:gap-2">
                {getPageNumbers().map((p, i) => {
                    if (typeof p === 'string') {
                        return (
                            <div key={p + i} className="w-8 h-10 flex items-center justify-center text-text-muted/50">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                        );
                    }

                    const isActive = p === currentPage;

                    return (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            disabled={isPending}
                            className={`relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border ${
                                isActive
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
                className="group flex items-center justify-center h-11 w-11 rounded-xl bg-surface/80 border border-border-subtle hover:border-primary/40 hover:bg-surface text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm rtl:rotate-180 md:rtl:rotate-0"
                aria-label="Next Page"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform md:hidden" />
                <span className="hidden md:flex items-center gap-2 font-bold text-sm px-4">
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                </span>
            </button>
        </div>
    );
}
