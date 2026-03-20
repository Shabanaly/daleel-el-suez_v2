'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Particle {
    id: number;
    duration: number;
    delay: number;
    left: string;
    top: string;
}

export default function HeroBackground() {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        setTimeout(() => {
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
        }, 0);
    }, []);

    return (
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full filter blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-accent/8 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />

            {/* Floating Particles */}
            {mounted && particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full blur-[1px]"
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: p.duration * 1.5,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
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
