import { getCategoryDetails } from '@/lib/actions/categories';
import { ChevronLeft, MapPin, Phone, Star, BadgeCheck, Clock, LayoutGrid, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function CategoryDetailPage({ params }: { params: { id: string } }) {
    const category = await getCategoryDetails(params.id);

    if (!category) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-28 pb-20 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm font-bold text-text-muted mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-primary">{category.name}</span>
                </nav>

                {/* Hero Header */}
                <div className="relative w-full p-8 md:p-16 rounded-[40px] bg-elevated border border-primary/20 overflow-hidden mb-12 shadow-2xl shadow-primary/5">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-background flex items-center justify-center text-5xl md:text-7xl shadow-xl border border-border-subtle animate-bounce-subtle">
                            {category.icon}
                        </div>
                        <div className="text-center md:text-right space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">
                                قسم <span className="text-primary">{category.name}</span>
                            </h1>
                            <p className="text-text-muted text-lg max-w-2xl font-medium leading-relaxed">
                                تصفح أفضل {category.name} في محافظة السويس. نوفر لك قائمة مختارة من الأماكن الموثوقة والمميزة.
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                                    {category.places.length}+ مكان متاح
                                </div>
                                <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold">
                                    تحديث يومي
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Places Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-black text-text-primary flex items-center gap-3">
                            <LayoutGrid className="w-6 h-6 text-primary" />
                            الأماكن المتاحة
                        </h2>
                        <Link href={`/places?category=${encodeURIComponent(category.name)}`} className="text-primary font-bold hover:underline flex items-center gap-2">
                            عرض الكل
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {category.places.map((place: any) => (
                            <Link
                                key={place.id}
                                href={`/places/${place.slug}`}
                                className="group bg-surface rounded-[32px] overflow-hidden border border-border-subtle hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
                            >
                                <div className="relative h-56 w-full overflow-hidden">
                                    {place.imageUrl ? (
                                        <Image
                                            src={place.imageUrl}
                                            alt={place.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-elevated flex items-center justify-center text-4xl grayscale">
                                            {place.icon}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-xs font-bold text-text-primary border border-border-subtle flex items-center gap-1">
                                            <Star className="w-3 h-3 text-accent fill-accent" />
                                            {place.rating}
                                        </div>
                                    </div>
                                    {place.isVerified && (
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-primary/90 backdrop-blur-md p-1.5 rounded-full text-white shadow-lg">
                                                <BadgeCheck className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 text-primary text-xs font-bold uppercase tracking-wider">
                                        <span>{place.category}</span>
                                        <div className="flex items-center gap-1 text-text-muted">
                                            <MapPin className="w-3 h-3" />
                                            <span>{place.area}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-text-primary mb-3 group-hover:text-primary transition-colors leading-tight">
                                        {place.name}
                                    </h3>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-subtle/50">
                                        <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                                            <Clock className="w-4 h-4" />
                                            <span>{place.openHours}</span>
                                        </div>
                                        <div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {category.places.length === 0 && (
                        <div className="py-20 text-center space-y-4 bg-surface rounded-[40px] border border-dashed border-border-subtle">
                            <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                🏙️
                            </div>
                            <h3 className="text-2xl font-black text-text-primary">لا يوجد أماكن مضافة حالياً</h3>
                            <p className="text-text-muted font-medium">نعمل حالياً على إضافة أفضل الأماكن في هذا القسم.</p>
                            <Link href="/categories" className="inline-block mt-4 px-8 py-3 rounded-full bg-primary text-white font-bold hover:scale-105 transition-all">
                                تصفح أقسام أخرى
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
