'use client';

import { Lightbox } from '@/app/places/_components/Lightbox';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import { Camera, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const galleryItems = [
    {
        id: 1,
        title: 'بورتوفيق واللقاء مع القناة',
        category: 'معالم',
        image: '/images/gallery/port.png',
        span: 'md:col-span-2 md:row-span-2'
    },
    {
        id: 2,
        title: 'طريق الملاحة والجمال الهادئ',
        category: 'طبيعة',
        image: '/images/gallery/marina.png',
        span: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 3,
        title: 'مسجد الغريب التاريخي',
        category: 'تراث',
        image: '/images/gallery/mosque.png',
        span: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 4,
        title: 'شواطئ العين السخنة',
        category: 'سياحة',
        image: '/images/gallery/sokhna.png',
        span: 'md:col-span-2 md:row-span-1'
    }
];

export default function SuezGallery() {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 py-6 md:py-16 mb-6 md:mb-10 overflow-hidden relative border-t border-border-subtle/30">
            <SectionHeader
                title="عدسة السويس"
                subtitle="جمال المدينة بعيون أهلها وزوارها"
                icon={Camera}
                href="/"
                viewAllText=""
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
                {galleryItems.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`relative rounded-3xl overflow-hidden group cursor-pointer ${item.span}`}
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute bottom-6 right-6 left-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                                {item.category}
                            </span>
                            <h3 className="text-lg md:text-xl font-bold leading-tight">
                                {item.title}
                            </h3>
                        </div>

                        {/* Interactive indicator */}
                        <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
