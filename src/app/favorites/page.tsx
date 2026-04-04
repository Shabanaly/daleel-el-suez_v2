import { createClient } from '@/lib/supabase/server';
import { getFavoritePlaces, getFavoriteAds } from '@/features/favorites/actions/favorites.server';
import { redirect } from 'next/navigation';
import { PlaceCard } from '@/features/places/components/PlaceCard';
import AdCard from '@/features/market/components/AdCard';
import { Heart, MapPin, Store, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { AppBar } from '@/components/ui/AppBar';

export const metadata = {
    title: 'المفضلة - دليل السويس',
    description: 'الأماكن والإعلانات المفضلة الخاصة بك في مدينة السويس',
};

export default async function FavoritesPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    const params = await searchParams;
    const activeTab = params.tab || 'places';

    if (error || !user) {
        redirect('/login');
    }

    const favoritePlaces = activeTab === 'places' ? await getFavoritePlaces(user.id) : [];
    const favoriteAds = activeTab === 'market' ? await getFavoriteAds(user.id) : [];

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-32 text-right" dir="rtl">
            <AppBar title="المفضلة" backHref="/profile" />

            <main className="pt-14 md:pt-24 max-w-7xl mx-auto px-4 mt-4">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-text-primary mb-1">قائمة المفضلة</h2>
                        <p className="text-text-muted font-bold">كل ما قمت بحفظه من أماكن وإعلانات</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1.5 bg-surface border border-border-subtle rounded-2xl mb-8 w-fit">
                    <Link
                        href="/favorites?tab=places"
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'places'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <MapIcon className="w-4 h-4" />
                        الأماكن
                    </Link>
                    <Link
                        href="/favorites?tab=market"
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'market'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Store className="w-4 h-4" />
                        السوق
                    </Link>
                </div>

                {activeTab === 'places' ? (
                    favoritePlaces.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {favoritePlaces.map((place, index) => (
                                place && <PlaceCard key={place.id} place={place} index={index} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            title="لا توجد أماكن مفضلة" 
                            desc="لم تقم بإضافة أي أماكن للمفضلة بعد." 
                            btnLink="/places" 
                            btnText="استكشف الأماكن"
                            icon={<MapPin className="w-10 h-10" />}
                        />
                    )
                ) : (
                    favoriteAds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {favoriteAds.map((ad: any) => (
                                ad && <AdCard key={ad.id} ad={ad as any} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            title="لا توجد إعلانات مفضلة" 
                            desc="لم تقم بحفظ أي إعلانات من السوق بعد." 
                            btnLink="/market" 
                            btnText="الذهاب للسوق"
                            icon={<Store className="w-10 h-10" />}
                        />
                    )
                )}
            </main>
        </div>
    );
}

interface EmptyStateProps {
    title: string;
    desc: string;
    btnLink: string;
    btnText: string;
    icon: React.ReactNode;
}

function EmptyState({ title, desc, btnLink, btnText, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-[32px] border border-dashed border-border-subtle/50">
            <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center text-accent/30 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black text-text-primary mb-2">{title}</h3>
            <p className="text-text-muted font-bold mb-8 text-center max-w-sm px-6">
                {desc}
            </p>
            <Link
                href={btnLink}
                className="px-8 h-14 rounded-2xl bg-primary text-white font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
                {btnText}
            </Link>
        </div>
    );
}
