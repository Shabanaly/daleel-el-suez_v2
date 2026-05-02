import { getAllHeroAds } from '@/features/hero-ads/actions';
import HeroAdAdminPanel from '@/features/hero-ads/components/HeroAdAdminPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة إعلانات الهيرو - لوحة التحكم',
  description: 'إدارة البطاقات الإعلانية في قسم الهيرو الرئيسي',
};

export default async function HeroAdsAdminPage() {
  const ads = await getAllHeroAds();

  return (
    <div className="pb-10">
      <HeroAdAdminPanel initialAds={ads} />
    </div>
  );
}
