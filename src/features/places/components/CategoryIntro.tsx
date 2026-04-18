import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface CategoryIntroProps {
  categorySlug?: string;
  categoryName?: string;
  className?: string;
}

const CategoryIntro = ({ categorySlug, categoryName, className = "" }: CategoryIntroProps) => {
  if (!categoryName) return null;
  
  // Normalize name for Arabic grammar (handling the "Al-" prefix)
  const formatName = (name: string) => {
    const trimmed = name.trim();
    // If it already starts with "ال", don't add it again
    if (trimmed.startsWith('ال')) return trimmed;
    // Otherwise add it
    return `ال${trimmed}`;
  };

  const nameWithArticle = formatName(categoryName);

  // Dynamic AI-optimized description template
  const dynamicDescription = `دليلك الشامل لاكتشاف أفضل ${nameWithArticle} في محافظة السويس. نوفر لك أدق التفاصيل، العناوين، وتقييمات المستخدمين لضمان أفضل تجربة لك في المدينة.`;


  return (
    <div className={`w-full ${className}`}>
      <div className="glass-panel p-6 md:p-8 rounded-[32px] border border-primary/10 bg-linear-to-br from-primary/5 to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-12 h-12 text-primary" />
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-black text-primary uppercase tracking-wider">
              نظرة عامة على {categoryName} في السويس
            </h2>
            <p className="text-text-primary/80 font-bold leading-relaxed text-sm md:text-base">
              {dynamicDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};



export default CategoryIntro;
