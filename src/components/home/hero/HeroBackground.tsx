'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function HeroBackground() {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        // Generate particles only on the client
        const newParticles = [...Array(6)].map((_, i) => ({
            id: i,
            duration: 5 + Math.random() * 5,
            delay: Math.random() * 5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full filter blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-accent/15 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Floating Particles */}
            {mounted && particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                        scale: [1, 2, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay
                    }}
                    style={{
                        left: p.left,
                        top: p.top
                    }}
                />
            ))}
        </div>
    );
}
