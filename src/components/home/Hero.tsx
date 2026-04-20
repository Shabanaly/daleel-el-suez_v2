import { getHomeCategories } from "@/features/taxonomy/actions/categories";
import { getActiveHeroAds } from "@/features/marketing/actions/hero.server";
import HeroClient from "./HeroClient";

export default async function Hero() {
    // 🔥 Fetch data inside the component to allow the page shell to render immediately
    const [categories, ads] = await Promise.all([
        getHomeCategories(),
        getActiveHeroAds(),
    ]);

    return <HeroClient categories={categories} ads={ads} />;
}
