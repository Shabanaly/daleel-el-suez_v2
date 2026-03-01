'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ShareButton from '@/components/ui/ShareButton';

const latestPosts = [
    {
        id: 1,
        author: 'أحمد السويسي',
        avatar: '/images/avatars/male.png',
        content: 'أجمل وقت في بورتوفيق هو وقت الغروب.. حد جرب كافيه اللؤلؤة الجديد؟ 🌅',
        likes: 42,
        comments: 12,
        time: 'منذ ساعتين'
    },
    {
        id: 2,
        author: 'سارة محمد',
        avatar: '/images/avatars/female.png',
        content: 'يا جماعة محتاجة ترشيح لأفضل دكتور عيون في مدينة السلام.. شكراً مقدماً! 🙏',
        likes: 28,
        comments: 35,
        time: 'منذ 4 ساعات'
    }
];

export default function CommunityTeaser() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-24 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight">نبض مجتمع السويس</h2>
                        <p className="text-text-muted font-bold text-xs md:text-sm mt-1 opacity-70">شارك تجربتك واكتشف ما يقوله أهل المدينة</p>
                    </div>
                </div>
                <Link href="/community" className="px-6 py-3 rounded-full bg-surface border border-border-subtle hover:border-primary/30 text-sm font-bold text-text-primary transition-all flex items-center gap-2 group">
                    انضم للمناقشة <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestPosts.map((post, idx) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-elevated/50 backdrop-blur-md border border-border-subtle/50 rounded-3xl p-6 md:p-8 hover:border-primary/20 transition-all duration-300 shadow-sm"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/10">
                                <Image src={post.avatar} alt={post.author} fill />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-text-primary mb-0.5">{post.author}</h4>
                                <span className="text-xs text-text-muted opacity-60 font-medium">{post.time}</span>
                            </div>
                        </div>

                        <p className="text-text-primary leading-relaxed mb-6 font-medium">
                            {post.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/30">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-text-muted group">
                                    <Heart className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                                    <span className="text-sm font-bold">{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted group">
                                    <MessageSquare className="w-4 h-4 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-bold">{post.comments}</span>
                                </div>
                            </div>
                            <ShareButton
                                title="دليل السويس - منشور في المجتمع"
                                text={post.content}
                                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/community#post-${post.id}`}
                                className="text-text-muted hover:text-primary transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                            </ShareButton>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
