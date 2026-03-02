import { getPlaces, getNewPlaces, getTrendingPlaces, getHomePageData } from '@/lib/actions/places';
import { getHomeCategories } from '@/lib/actions/categories';
import { getHomeDistricts } from '@/lib/actions/areas';
import Hero from '@/components/home/Hero';
import TrendingPlaces from '@/components/home/TrendingPlaces';
import DistrictsExplorer from '@/components/home/DistrictsExplorer';
import SuezStats from '@/components/home/SuezStats';
import SuezGallery from '@/components/home/SuezGallery';
import CommunityTeaser from '@/components/home/CommunityTeaser';
import AppPromoSection from '@/components/home/AppPromoSection';
import NewPlaces from '@/components/home/NewPlaces';
import { getCommunityPosts } from '@/lib/actions/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "دليل السويس | Suez Guide - كل مكان في السويس في مكان واحد",
  description: "اكتشف أفضل الأماكن، الخدمات، والمطاعم في محافظة السويس. دليل السويس هو رفيقك الموثوق لاستكشاف المدينة والوصول لكل ما تحتاجه.",
};

export default async function Home() {

  // 🧠 Fetch data using the centralized home page action (logic moved to server)
  const [categories, districts, homeData, communityPosts] = await Promise.all([
    getHomeCategories(),
    getHomeDistricts(),
    getHomePageData(),
    getCommunityPosts(undefined, undefined, 1, 2)
  ]);

  const { trending, newPlaces } = homeData;

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <Hero categories={categories} />

      <TrendingPlaces places={trending} />
      <NewPlaces places={newPlaces} />
      <SuezGallery />
      <DistrictsExplorer districts={districts} />
      <CommunityTeaser posts={communityPosts} />


      {/* Call to action banner at the end */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24 md:pb-32">
        <div className="w-full rounded-[32px] md:rounded-[48px] bg-linear-to-br from-surface via-surface to-primary/5 border border-primary/15 p-8 md:p-16 text-center flex flex-col items-center shadow-2xl shadow-primary/5 relative overflow-hidden group">
          {/* Canal teal orb top-right */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-1000" />
          {/* Desert amber orb bottom-left */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full mix-blend-screen filter blur-[80px] opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-1000" />

          <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-4 relative z-10">
            أضف نشاطك في دليل السويس
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mb-8 relative z-10">
            انضم لآلاف الأماكن والأنشطة التجارية في دليل السويس، واصل لعملاء أكثر في منطقتك. التسجيل مجاني وسهل!
          </p>
          <button className="px-8 py-4 rounded-full bg-linear-to-r from-accent to-primary text-white font-bold text-lg shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all relative z-10">
            سجل نشاطك الآن
          </button>
        </div>
      </section>
      <SuezStats />
      <AppPromoSection />
    </div>
  );
}
