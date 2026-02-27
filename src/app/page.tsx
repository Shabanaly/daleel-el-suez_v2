import { getPlaces } from '@/lib/actions/places';
import Hero from '@/components/home/Hero';
import BentoCategories from '@/components/home/BentoCategories';
import TrendingPlaces from '@/components/home/TrendingPlaces';
import DistrictsExplorer from '@/components/home/DistrictsExplorer';

export default async function Home() {
  const places = await getPlaces();
  const trendingPlaces = places.slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <Hero />
      <BentoCategories />
      <TrendingPlaces places={trendingPlaces} />
      <DistrictsExplorer />

      {/* Call to action banner at the end */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24 md:pb-32">
        <div className="w-full rounded-3xl bg-linear-to-r from-elevated to-surface border border-primary-600/25 p-8 md:p-12 text-center flex flex-col items-center shadow-[0_0_50px_rgba(8,145,178,0.12)] relative overflow-hidden">
          {/* Canal teal orb top-right */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-25 pointer-events-none" />
          {/* Desert amber orb bottom-left */}
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-4 relative z-10">
            أضف نشاطك في دليل السويس
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mb-8 relative z-10">
            انضم لآلاف الأماكن والأنشطة التجارية في دليل السويس، واصل لعملاء أكثر في منطقتك. التسجيل مجاني وسهل!
          </p>
          <button className="px-8 py-4 rounded-full bg-linear-to-r from-accent to-primary-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] hover:scale-105 transition-all relative z-10">
            سجل نشاطك الآن
          </button>
        </div>
      </section>
    </div>
  );
}
