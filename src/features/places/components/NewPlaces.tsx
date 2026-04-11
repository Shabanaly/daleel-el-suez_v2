import SectionHeader from "@/components/ui/SectionHeader";
import { Flame } from "lucide-react";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { getHomePageData } from "@/features/places/actions/places.server";
import { ROUTE_HELPERS } from '@/constants';

export default async function NewPlaces() {
  const { newPlaces } = await getHomePageData();
  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-0 pb-8 md:pt-0 md:pb-16 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/2 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/2 rounded-full blur-[120px] pointer-events-none" />

      <SectionHeader
        title="أُضيف حديثاً"
        subtitle="اكتشف أحدث الانضمامات لدليل السويس بمختلف التصنيفات"
        icon={Flame}
        href={ROUTE_HELPERS.PLACES_SORT('newest')}
      />

      <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-6 md:gap-8 pb-10">
        {newPlaces.slice(0, 9).map((place, idx) => (
          <PlaceCard
            key={place.id}
            place={place}
            index={idx}
            className="min-w-[280px] md:min-w-0 flex-1"
          />
        ))}
      </div>
    </section>
  );
}
