'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon from './CategoryIcon';
import CommunityFeed from './CommunityFeed';
import CreatePostTrigger from './CreatePostTrigger';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CommunityClientProps {
    initialPosts: any[];
    categories: Category[];
    userAvatar?: string | null;
}

export default function CommunityClient({ initialPosts, categories, userAvatar }: CommunityClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const q = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const categoryId = categoryParam ? parseInt(categoryParam) : null;

    // Search Toggle State
    const [isSearchOpen, setIsSearchOpen] = useState(!!q);
    const [searchQuery, setSearchQuery] = useState(q);

    // Filter Navigation Handler
    const handleCategorySelect = (id: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('category', id.toString());
        } else {
            params.delete('category');
        }
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery.trim()) {
            params.set('q', searchQuery.trim());
        } else {
            params.delete('q');
        }
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearchOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        router.push(`/community?${params.toString()}`, { scroll: false });
    };

    // Swipeable logic
    const handleDragEnd = (event: any, info: any) => {
        const swipeThreshold = 50;
        // dx is the distance moved. Negative dx = swiped left, Positive dx = swiped right
        // Arabic is RTL. Swiping Right (positive dx) means revealing content from the left (Previous Tab).
        // Swiping Left (negative dx) means revealing content from the right (Next Tab).

        const currentIndex = categoryId === null ? -1 : categories.findIndex(c => c.id === categoryId);

        if (info.offset.x > swipeThreshold) {
            // Swiped Right -> Go to Previous Tab
            if (currentIndex > -1) {
                const prevId = currentIndex === 0 ? null : categories[currentIndex - 1].id;
                handleCategorySelect(prevId);
            }
        } else if (info.offset.x < -swipeThreshold) {
            // Swiped Left -> Go to Next Tab
            if (currentIndex < categories.length - 1) {
                const nextId = categories[currentIndex + 1].id;
                handleCategorySelect(nextId);
            }
        }
    };

    // Combine "All" with categories for the Tabs
    const allTabs = [{ id: null, name: 'الكل', icon: '' }, ...categories];

    return (
        <div className="flex flex-col w-full h-full relative">

            {/* Header & Hidden Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-20">
                <AnimatePresence mode="wait">
                    {!isSearchOpen ? (
                        <motion.div
                            key="header-titles"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className="flex items-center justify-between w-full"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">مجتمع السويس</h1>
                                    <p className="text-text-muted font-bold text-xs md:text-sm mt-0.5">تواصل مع جيرانك واعرف أخبار مدينتك</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 flex items-center justify-center bg-surface hover:bg-elevated rounded-2xl border border-border-subtle hover:border-primary/30 transition-all shadow-sm"
                            >
                                <Search className="w-5 h-5 text-text-secondary" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="header-search"
                            initial={{ opacity: 0, width: '80%' }}
                            animate={{ opacity: 1, width: '100%' }}
                            exit={{ opacity: 0, width: '80%', transition: { duration: 0.2 } }}
                            onSubmit={handleSearchSubmit}
                            className="relative w-full flex items-center shadow-lg shadow-black/5 rounded-2xl"
                        >
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-primary" />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن المنشورات أو الأسئلة..."
                                className="w-full h-14 pr-12 pl-14 bg-surface text-right border-2 border-primary/20 rounded-2xl font-bold text-text-primary placeholder:text-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                dir="rtl"
                            />
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute inset-y-0 left-2 w-10 h-10 my-auto flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-elevated rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            {/* Swipeable Tabs (Modern Architecture) */}
            <div className="relative mb-8 w-full border-b border-border-subtle">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide no-scrollbar relative z-10">
                    {allTabs.map((tab) => {
                        const isActive = categoryId === tab.id;
                        return (
                            <button
                                key={tab.id || 'all'}
                                onClick={() => handleCategorySelect(tab.id)}
                                className={`relative pb-4 px-1 text-sm font-black whitespace-nowrap transition-colors flex items-center gap-2
                                    ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="community-tab-underline"
                                        className="absolute -bottom-px left-0 right-0 h-[3px] bg-primary rounded-t-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {tab.icon && <CategoryIcon name={tab.icon} className="w-4 h-4" />}
                                {tab.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Create Post Area (Refined UI) */}
            <div className="mb-8">
                <CreatePostTrigger categories={categories} userAvatar={userAvatar} />
            </div>

            {/* Swipeable Feed Context */}
            <motion.div
                key={categoryId || 'all'}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-1 touch-pan-y"
            >
                <CommunityFeed initialPosts={initialPosts} categories={categories} />
            </motion.div>

        </div>
    );
}
