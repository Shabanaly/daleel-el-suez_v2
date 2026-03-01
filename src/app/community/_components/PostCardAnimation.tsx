'use client';

import { motion } from 'framer-motion';

interface PostCardAnimationProps {
    children: React.ReactNode;
    id?: string;
}

export default function PostCardAnimation({ children, id }: PostCardAnimationProps) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border-subtle rounded-2xl overflow-hidden mb-6 shadow-sm scroll-mt-24"
        >
            {children}
        </motion.div>
    );
}
