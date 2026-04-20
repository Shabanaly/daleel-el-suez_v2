import { getHomeDistricts } from "@/features/taxonomy/actions/districts";
import DistrictsExplorerClient, { District } from "./DistrictsExplorerClient";

export default async function DistrictsExplorer() {
    const districts = await getHomeDistricts();
    
    if (!districts || districts.length === 0) return null;

    return <DistrictsExplorerClient districts={districts as District[]} />;
}
