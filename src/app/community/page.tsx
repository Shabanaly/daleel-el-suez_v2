"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    MessageCircle,
    Heart,
    Share2,
    MoreHorizontal,
    MapPin,
    Image as ImageIcon,
    Send,
    X,
    Smile,
    User
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

// --- Mock Data ---
const MOCK_POSTS = [
    {
        id: '1',
        author: {
            name: 'أحمد محمد',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
            location: 'بور توفيق'
        },
        content: 'يا جماعة حد يعرف مطعم سمك كويس في منطقة بور توفيق يكون بيعمل سنجاري حلو؟ 🐟 عايز مكان يكون قعدته هادية ونضيف.',
        timestamp: 'منذ ساعتين',
        likes: 120,
        commentsCount: 45,
        shares: 5,
        hasImage: false
    },
    {
        id: '2',
        author: {
            name: 'نور الهدى',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nour',
            location: 'الكورنيش الجديد'
        },
        content: 'منظر الغروب النهاردة من الكورنيش تحفة فنية! السويس جميلة بجد ❤️🌅',
        timestamp: 'منذ 5 ساعات',
        likes: 342,
        commentsCount: 12,
        shares: 28,
        hasImage: true,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '3',
        author: {
            name: "دكتورة منى إبراهيم",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mona",
            location: "حي السويس"
        },
        content: "تجربتي اليوم في ممشى بورتوفيق المطور كانت مذهلة بكل المقاييس. السويس فعلاً بدأت تستعيد رونقها الجمالي كمحافظة سياحية وتاريخية هامة. الممشى أصبح مكاناً مثالياً للعائلات والشباب للاستمتاع بمنظر القناة الخلاب. أنصح الجميع بزيارته وقت الغروب لرؤية السفن وهي تعبر القناة في مشهد مهيب لا يتكرر إلا في مدينتنا الجميلة. أتمنى من الجميع الحفاظ على نظافة المكان والمرافق العامة ليبقى واجهة مشرفة لنا جميعاً وللزوار من خارج المحافظة. السويس في القلب دائماً وأبداً ونحن نفخر بكل إنجاز جديد يتم على أرض الغريب.",
        likes: 210,
        commentsCount: 45,
        shares: 12,
        timestamp: "منذ ٣ ساعات",
        hasImage: true,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
    }
];

const MOCK_COMMENTS = [
    {
        id: 'c1',
        author: 'محمد علي',
        content: 'جرب مطعم كنوز في بور توفيق، السنجاري عنده تحفة!',
        time: 'منذ ساعة',
        replies: [
            { id: 'r1', author: 'محمود سامي', content: 'فعلاً كنوز عالمي!', time: 'منذ ٣٠ دقيقة' }
        ]
    },
    {
        id: 'c2',
        author: 'سارة حسن',
        content: 'في مطعم اسمه "البحر" برضه كويس جداً وقعدته رايقة.',
        time: 'منذ ٤٥ دقيقة',
        replies: []
    },
    {
        id: 'c3',
        author: 'عمر خالد',
        content: 'اتفق مع محمد، كنوز أحسن واحد بيعمل سنجاري هناك.',
        time: 'منذ ٣٠ دقيقة',
        replies: []
    },
];

export default function CommunityPage() {
    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
    const dragControls = useDragControls();

    const togglePostExpansion = (postId: string) => {
        setExpandedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const openComments = (postId: string) => {
        setSelectedPost(postId);
        setIsCommentsOpen(true);
    };

    // --- Background Scroll Lock ---
    useEffect(() => {
        if (isCommentsOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isCommentsOpen]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtTop, setIsAtTop] = useState(true);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Use <= 0 to account for mobile rubber-banding/bounce
        setIsAtTop(e.currentTarget.scrollTop <= 0);
    };

    return (
        <div className="min-h-screen bg-base pt-20 pb-24 md:pt-24 md:pb-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* ── Post Creation Card ────────────────────────────────────── */}
                <div className="bg-surface border border-border-subtle rounded-3xl p-4 shadow-xl shadow-black/5 group">
                    <div className="flex gap-4 items-center mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 shrink-0 relative overflow-hidden">
                            <Image
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
                                alt="My Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <button className="flex-1 bg-base text-text-muted text-right h-12 px-6 rounded-2xl font-bold border border-border-subtle/50 hover:border-primary-500/30 transition-all">
                            شارك ما يحدث في السويس...
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30">
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-base rounded-xl text-text-muted hover:text-primary-500 transition-colors">
                                <ImageIcon className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-black hidden sm:inline">صور</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-base rounded-xl text-text-muted hover:text-primary-500 transition-colors">
                                <MapPin className="w-5 h-5 text-rose-500" />
                                <span className="text-sm font-black hidden sm:inline">الموقع</span>
                            </button>
                        </div>
                        <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-black transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                            نشر
                        </button>
                    </div>
                </div>

                {/* ── Social Feed ────────────────────────────────────────────── */}
                <div className="space-y-6">
                    {MOCK_POSTS.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-border-subtle rounded-[44px] overflow-hidden shadow-2xl shadow-black/5"
                        >
                            {/* User Header */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary-500/10 relative overflow-hidden ring-1 ring-secondary-500/20">
                                        <Image src={post.author.avatar} alt={post.author.name} fill />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-text-primary font-black text-lg">{post.author.name}</h3>
                                            <span className="w-4 h-4 rounded-full bg-secondary-500 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-muted text-xs font-bold mt-0.5">
                                            <span>{post.timestamp}</span>
                                            <span className="w-1 h-1 rounded-full bg-border-subtle" />
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-secondary-500" />
                                                <span>{post.author.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-text-muted hover:text-text-primary p-2 bg-base rounded-full transition-colors">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Layout: Image Then Text */}
                            <div className="flex flex-col">
                                {/* Image (Optional) */}
                                {post.hasImage && post.imageUrl && (
                                    <div className="relative aspect-square sm:aspect-video w-full px-6 mb-4">
                                        <div className="relative h-full w-full rounded-[32px] overflow-hidden">
                                            <Image
                                                src={post.imageUrl}
                                                alt="Post Image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Content Under Image */}
                                <div className="px-8 pb-6">
                                    <p
                                        className={`text-text-primary font-bold text-lg leading-relaxed text-right dir-rtl ${!expandedPosts.has(post.id) ? 'line-clamp-4' : ''
                                            }`}
                                    >
                                        {post.content}
                                    </p>

                                    {post.content.length > 150 && (
                                        <button
                                            onClick={() => togglePostExpansion(post.id)}
                                            className="text-primary-500 text-sm font-black mt-2 hover:underline"
                                        >
                                            {expandedPosts.has(post.id) ? 'عرض أقل' : 'عرض المزيد'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Engagement & Actions Grouped */}
                            <div className="px-6 pb-6">
                                <div className="bg-base/50 p-4 rounded-[32px] border border-border-subtle/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center -space-x-2 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-surface flex items-center justify-center z-10 shadow-lg">
                                                <Heart className="w-4 h-4 text-white fill-white" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-surface flex items-center justify-center shadow-lg">
                                                <Smile className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-text-muted text-xs font-bold mr-4">{post.likes} تفاعل</span>
                                        </div>
                                        <div className="flex gap-3 text-text-muted text-xs font-bold">
                                            <span>{post.commentsCount} تعليق</span>
                                            <span>{post.shares} مشاركة</span>
                                        </div>
                                    </div>

                                    {/* Action Pill */}
                                    <div className="bg-surface rounded-2xl border border-border-subtle/50 p-1 flex items-center">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-base rounded-xl text-text-muted hover:text-primary-500 transition-all font-black">
                                            <Heart className="w-5 h-5" />
                                            <span className="text-sm">أعجبني</span>
                                        </button>
                                        <div className="w-px h-6 bg-border-subtle/30" />
                                        <button
                                            onClick={() => openComments(post.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-base rounded-xl text-text-muted hover:text-primary-500 transition-all font-black"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm">تعليق</span>
                                        </button>
                                        <div className="w-px h-6 bg-border-subtle/30" />
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-base rounded-xl text-text-muted hover:text-primary-500 transition-all font-black">
                                            <Share2 className="w-5 h-5" />
                                            <span className="text-sm">مشاركة</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Comments Bottom Sheet ──────────────────────────────────── */}
            <AnimatePresence>
                {isCommentsOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCommentsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                                mass: 0.8
                            }}
                            drag="y"
                            dragControls={dragControls}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.7}
                            dragListener={false}
                            onDrag={(_, info) => {
                                // Manual Scroll Support:
                                // If at top and user drags UP (delta.y is negative), manually scroll the list
                                if (isAtTop && info.delta.y < 0 && scrollRef.current) {
                                    scrollRef.current.scrollTop -= info.delta.y;
                                }
                            }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100 || info.velocity.y > 500) {
                                    setIsCommentsOpen(false);
                                }
                            }}
                            whileDrag={{ cursor: 'grabbing' }}
                            dir="rtl"
                            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface rounded-t-[40px] z-101 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col"
                            style={{ touchAction: 'none' }} // Sheet must be touch-none for FM to handle its custom gestures reliably
                        >
                            {/* Handle */}
                            <div
                                onPointerDown={(e) => dragControls.start(e)}
                                className="w-full flex justify-center p-4 cursor-grab active:cursor-grabbing touch-none"
                            >
                                <div className="w-16 h-1.5 bg-border-subtle rounded-full" />
                            </div>

                            {/* Header */}
                            <div
                                onPointerDown={(e) => dragControls.start(e)}
                                className="px-6 pb-6 flex items-center justify-between border-b border-border-subtle/30 cursor-grab active:cursor-grabbing touch-none"
                            >
                                <h2 className="text-xl font-black text-text-primary">التعليقات</h2>
                                <button
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={() => setIsCommentsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-base flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Comments List */}
                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                onPointerDown={(e) => {
                                    if (isAtTop) {
                                        dragControls.start(e, { snapToCursor: false });
                                    }
                                }}
                                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                                style={{ touchAction: isAtTop ? 'none' : 'pan-y' }}
                            >
                                {MOCK_COMMENTS.map((comment) => (
                                    <div key={comment.id} className="space-y-4">
                                        <div className="flex flex-col items-start">
                                            <div className="bg-base p-4 rounded-3xl rounded-tl-none border border-border-subtle/30 inline-block max-w-[90%] shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-xl bg-secondary-500/10 shrink-0 relative overflow-hidden border border-border-subtle/20">
                                                        <User className="absolute inset-0 m-auto w-5 h-5 text-text-muted/40" />
                                                        <Image
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`}
                                                            alt={comment.author}
                                                            fill
                                                            className="object-cover z-10"
                                                        />
                                                    </div>
                                                    <h4 className="font-black text-sm text-primary-500">{comment.author}</h4>
                                                </div>
                                                <p className="text-text-primary font-bold text-sm leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 ml-2">
                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{comment.time}</p>
                                                <button className="text-secondary-500 text-sm font-bold hover:text-secondary-600 transition-colors py-1 px-2 -mx-2 rounded-lg hover:bg-secondary-500/5">رد</button>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-8 space-y-4 border-l-2 border-border-subtle/30 pl-4 mr-0 border-r-0 pr-0">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex flex-col items-start">
                                                        <div className="bg-primary-500/5 p-3 rounded-2xl rounded-tl-none border border-primary-500/10 inline-block max-w-[90%]">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-6 h-6 rounded-lg bg-secondary-500/10 shrink-0 relative overflow-hidden">
                                                                    <User className="absolute inset-0 m-auto w-4 h-4 text-text-muted/40" />
                                                                    <Image
                                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author}`}
                                                                        alt={reply.author}
                                                                        fill
                                                                        className="object-cover z-10"
                                                                    />
                                                                </div>
                                                                <h4 className="font-black text-xs text-secondary-500">{reply.author}</h4>
                                                            </div>
                                                            <p className="text-text-primary font-bold text-xs leading-relaxed">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                        <p className="text-[9px] text-text-muted font-black mt-1 ml-1">{reply.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Comment Input */}
                            <div className="p-6 border-t border-border-subtle/30 bg-surface">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="اكتب تعليقاً..."
                                        className="w-full h-14 pl-4 pr-14 rounded-2xl bg-base border border-border-subtle text-text-primary font-bold focus:border-primary-500 outline-none transition-all"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
