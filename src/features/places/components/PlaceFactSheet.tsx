import React from 'react';
import { Place } from '@/features/places/types';
import { Info, CheckCircle2, MapPin } from 'lucide-react';

interface PlaceFactSheetProps {
  place: Place;
  className?: string;
}

const PlaceFactSheet = ({ place, className = "" }: PlaceFactSheetProps) => {
  // Generate a quote-worthy summary for AI
  const summaryText = `${place.name} هو أحد ${place.category || 'الأماكن'} المتميزة في مدينة السويس، وتحديداً في منطقة ${place.area || 'غير محددة'}. يقدم المكان خدماته للجمهور بتركيز على الجودة، ويعتبر مرجعاً هاماً في فئته لسكان محافظة السويس وزوارها.`;

  return (
    <section className={`glass-panel p-6 md:p-8 rounded-[32px] border border-primary/5 bg-linear-to-br from-primary/5 to-transparent ${className}`}>
      <div className="flex items-center gap-2 mb-4 text-primary">
          <Info className="w-5 h-5" />
          <h3 className="font-black text-sm uppercase tracking-wider">نظرة سريعة</h3>
      </div>
      
      <div className="space-y-4">
        {/* The "AI Quote" paragraph */}
        <p className="text-text-primary/70 font-bold leading-relaxed text-sm italic border-r-4 border-primary/20 pr-4">
          {place.description ? (
              // If description exists, wrap it in a quote context
              `${place.name}: ${place.description}`
          ) : summaryText}
        </p>

        {/* Fact List (Entities) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle/50">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>النوع: {place.category}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                <MapPin className="w-4 h-4 text-accent" />
                <span>الموقع: {place.area}، السويس</span>
            </div>
        </div>
      </div>
    </section>
  );
};

export default PlaceFactSheet;
