import { getHomeUnifiedStats } from "@/features/stats/actions/stats.server";
import SuezStatsClient from "./SuezStatsClient";

export default async function SuezStats() {
    const stats = await getHomeUnifiedStats();
    
    const formattedStats = {
        places: stats.places,
        areas: stats.areas,
        reach: stats.totalReachRaw
    };

    return <SuezStatsClient stats={formattedStats} />;
}
