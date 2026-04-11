import {
  getHomeCategories,
  getSmartCategoryHighlights,
} from "@/features/taxonomy/actions/categories";
import { getHomeDistricts } from "@/features/taxonomy/actions/districts";
import { getHomeUnifiedStats } from "@/features/stats/actions/stats.server";
import Hero from "@/components/home/Hero";
import SuezStats from "@/features/stats/components/SuezStats";
import SuezGallery from "@/features/gallery/components/SuezGallery";
import CommunityTeaser from "@/features/community/components/CommunityTeaser";
import CategoryHighlight from "@/features/places/components/CategoryHighlight";
import BestOfSuezHome from "@/features/places/components/BestOfSuezHome";
import { getCommunityPosts } from "@/features/community/actions/posts.server";
import { getMarketHomePageData } from "@/features/market/actions/market.server";
import { createClient } from "@/lib/supabase/server";
import { getTopGalleryImages } from "@/features/gallery/actions/gallery.server";
import type { Metadata } from "next";
import DistrictsExplorer from "@/features/places/components/DistrictsExplorer";
import HomeMarketSection from "@/features/market/components/HomeMarketSection";
import NewPlaces from "@/features/places/components/NewPlaces";
import TrendingPlaces from "@/features/places/components/TrendingPlaces";
import CommunityPulse from "@/features/places/components/pulse/CommunityPulse";
import CustomLink from "@/components/customLink/customLink";
import { getActiveHeroAds } from "@/features/marketing/actions/hero.server";
import { APP_CONFIG, ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: `${APP_CONFIG.NAME} | ${APP_CONFIG.TAGLINE}`,
  description: APP_CONFIG.DESCRIPTION,
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🧠 Fetch shared data needed by Home Page

  const [
    categories,
    districts,
    communityPosts,
    smartCategoryData,
    unifiedStats,
    marketData,
    topGalleryImages,
    heroAds,
  ] = await Promise.all([
    getHomeCategories(),
    getHomeDistricts(),
    getCommunityPosts(undefined, undefined, 1, 2, user?.id),
    getSmartCategoryHighlights(),
    getHomeUnifiedStats(),
    getMarketHomePageData(),
    getTopGalleryImages(5),
    getActiveHeroAds(),
  ]);

  const homeMarketAds = [
    ...marketData.trendingAds,
    ...marketData.latestAds,
  ].slice(0, 8); // Top 8 combined

  // Map unified stats to specific component needs
  const bestOfStats = {
    verifiedCount: unifiedStats.verifiedCount,
    reviewsCount: unifiedStats.reviewsCount,
    totalViews: unifiedStats.formattedReach,
  };

  const suezStats = {
    places: unifiedStats.places,
    areas: unifiedStats.areas,
    reach: unifiedStats.totalReachRaw,
  };

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <Hero categories={categories} ads={heroAds} />

      <TrendingPlaces />
      <NewPlaces />
      <HomeMarketSection ads={homeMarketAds} />
      <BestOfSuezHome stats={bestOfStats} />
      {smartCategoryData && <CategoryHighlight data={smartCategoryData} />}
      <CommunityPulse />
      <SuezGallery initialImages={topGalleryImages} />
      <DistrictsExplorer districts={districts} />
      <CommunityTeaser posts={communityPosts} />

      {/* Call to action banner at the end */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-6 md:pb-12">
        <div className="w-full rounded-[32px] md:rounded-[48px] bg-linear-to-br from-surface via-surface to-primary/5 border border-primary/15 p-8 md:p-16 text-center flex flex-col items-center shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full mix-blend-screen filter blur-[80px] opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-1000" />

          <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-4 relative z-10">
            أضف نشاطك في {APP_CONFIG.NAME}
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mb-8 relative z-10">
            انضم لآلاف الأماكن والأنشطة التجارية في {APP_CONFIG.NAME}، واصل لعملاء
            أكثر في منطقتك. التسجيل مجاني وسهل!
          </p>
          <CustomLink
            href={ROUTES.PLACES_ADD}
            className="px-8 py-4 rounded-full bg-linear-to-r from-accent to-primary text-white font-bold text-lg shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all relative z-10"
          >
            سجل نشاطك الآن
          </CustomLink>
        </div>
      </section>

      <SuezStats stats={suezStats} />
    </div>
  );
}
