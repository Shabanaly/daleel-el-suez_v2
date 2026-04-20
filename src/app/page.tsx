 
 
import CategoryHighlight from "@/features/places/components/CategoryHighlight";
import BestOfSuezHome from "@/features/places/components/BestOfSuezHome";
import type { Metadata } from "next";
import DistrictsExplorer from "@/features/places/components/DistrictsExplorer";
import HomeMarketSection from "@/features/market/components/HomeMarketSection";
import NewPlaces from "@/features/places/components/NewPlaces";
import TrendingPlaces from "@/features/places/components/TrendingPlaces";
import CommunityPulse from "@/features/places/components/pulse/CommunityPulse";
import CustomLink from "@/components/customLink/customLink";
import { APP_CONFIG, ROUTES } from "@/constants";
import { Suspense } from "react";
import CommunityTeaserWrapper from "@/features/community/components/CommunityTeaserWrapper";
import AdSlot from "@/components/common/AdSlot";
import { Banner320x50, Banner728x90, ContainerAd } from "@/components/common/ThirdPartyAds";
import HomeBlogSection from "@/features/blog/components/HomeBlogSection";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import SuezEncyclopedia from "@/components/home/SuezEncyclopedia";

export const metadata: Metadata = {
  title: `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`,
  description: APP_CONFIG.DESCRIPTION,
};

// ⚡ Optimization: Enable ISR (Revalidate every 2 hours)
export const revalidate = 7200;

import { SectionSkeleton, MarketSectionSkeleton, StatsSkeleton, DistrictsSkeleton } from "@/components/home/HomeSkeletons";
import SuezStats from "@/features/stats/components/SuezStats";
import Hero from "@/components/home/Hero";

export default async function Home() {
  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <FaqJsonLd />
      
      <Suspense fallback={<div className="w-full h-[60vh] animate-pulse bg-surface/50" />}>
        <Hero />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TrendingPlaces />
      </Suspense>

      {/* ✅ Desktop Banner - بعد الأماكن الرائجة */}
      <AdSlot exactPaths={[ROUTES.HOME]} device="desktop" className="w-full px-4">
        <Banner728x90 containerId="ad-home-top-desktop" />
      </AdSlot>

      <Suspense fallback={<SectionSkeleton />}>
        <NewPlaces />
      </Suspense>

      {/* ✅ Mobile Banner - بعد الأماكن الجديدة */}
      <AdSlot exactPaths={[ROUTES.HOME]} device="mobile" className="w-full px-4">
        <Banner320x50 containerId="ad-home-middle" />
      </AdSlot>

      <Suspense fallback={<MarketSectionSkeleton />}>
        <HomeMarketSection />
      </Suspense>

      <Suspense fallback={<div className="h-64 w-full px-4 mb-20 animate-pulse bg-surface/50 rounded-[48px]" />}>
        <BestOfSuezHome />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CategoryHighlight />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CommunityPulse />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeBlogSection />
      </Suspense>

      <Suspense fallback={<DistrictsSkeleton />}>
        <DistrictsExplorer />
      </Suspense>
      
      {/* 🤖 AI Content Layer: Visible Encyclopedia */}
      <SuezEncyclopedia />
      
      {/* 🚀 Auth-decoupled section: Wrapped in Suspense to keep the rest of the page static/cacheable */}
      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-surface rounded-3xl" />}>
        <CommunityTeaserWrapper />
      </Suspense>

      {/* ✅ Container Ad - قبل CTA (كل الأجهزة) */}
      <AdSlot exactPaths={[ROUTES.HOME]} className="w-full px-4">
        <ContainerAd />
      </AdSlot>

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

      <Suspense fallback={<StatsSkeleton />}>
        <SuezStats />
      </Suspense>

    </div>
  );
}
