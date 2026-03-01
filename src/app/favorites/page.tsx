import { createClient } from '@/lib/supabase/server';
import { getFavoritePlaces } from '@/lib/actions/favorites';
import { redirect } from 'next/navigation';
import { PlaceCard } from '@/app/places/_components/PlaceCard';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'المفضلة - دليل السويس',
    description: 'الأماكن المفضلة الخاصة بك في مدينة السويس',
};

export default async function FavoritesPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    const favoritePlaces = await getFavoritePlaces(user.id);

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-32 text-right" dir="rtl">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-4 py-6 bg-background/60 backdrop-blur-xl border-b border-border-subtle/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/profile"
                        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-primary hover:bg-elevated transition-colors"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-black text-text-primary">المفضلة</h1>
                    <div className="w-10 h-10 invisible" /> {/* Spacer */}
                </div>
            </header>

            <main className="pt-32 max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-text-primary mb-1">الأماكن المفضلة</h2>
                        <p className="text-text-muted font-bold">لديك {favoritePlaces.length} مكان في قائمتك</p>
                    </div>
                </div>

                {favoritePlaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {favoritePlaces.map((place, index) => (
                            place && <PlaceCard key={place.id} place={place} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-[32px] border border-dashed border-border-subtle/50">
                        <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center text-accent/30 mb-6">
                            <Heart className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-text-primary mb-2">قائمة المفضلة فارغة</h3>
                        <p className="text-text-muted font-bold mb-8 text-center max-w-sm px-6">
                            لم تقم بإضافة أي أماكن للمفضلة بعد. ابدأ باستكشاف أفضل الأماكن في السويس الآن!
                        </p>
                        <Link
                            href="/places"
                            className="px-8 h-14 rounded-2xl bg-primary text-white font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                            <MapPin className="w-5 h-5" />
                            <span>استكشف الأماكن</span>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
