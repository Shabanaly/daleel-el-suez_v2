import { Place } from "@/lib/types/places";
import { Star, MapPin, Award, CheckCircle2, TrendingUp, Trophy, Medal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TopPlaceCardProps {
    place: Place;
    rank: number;
}

export default function TopPlaceCard({ place, rank }: TopPlaceCardProps) {
    // Rank-specific color themes using semantic/standard colors
    const rankThemes = {
        1: {
            border: "border-amber-500/30",
            icon: Trophy,
            accent: "text-amber-500",
            bg: "bg-amber-500/5",
            label: "الأفضل"
        },
        2: {
            border: "border-slate-400/30",
            icon: Medal,
            accent: "text-slate-400",
            bg: "bg-slate-400/5",
            label: "مميز"
        },
        3: {
            border: "border-orange-500/30",
            icon: Medal,
            accent: "text-orange-500",
            bg: "bg-orange-500/5",
            label: "رائع"
        }
    };

    const theme = rankThemes[rank as keyof typeof rankThemes] || {
        border: "border-border-subtle",
        icon: Award,
        accent: "text-primary",
        bg: "bg-primary/5",
        label: "موثق"
    };

    const ThemeIcon = theme.icon;

    return (
        <Link 
            href={`/places/${encodeURIComponent(place.slug)}`}
            className={`group relative flex flex-col md:flex-row gap-6 p-5 rounded-3xl border border-border-subtle bg-surface shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
            dir="rtl"
        >
            {/* Rank Visual Indicator */}
            <div className={`absolute top-0 left-0 w-16 h-16 ${theme.bg} rounded-br-3xl flex items-center justify-center`}>
                <span className={`text-xl font-black ${theme.accent}`}>{rank}</span>
            </div>
            
            {/* Image Container */}
            <div className="relative w-full md:w-64 h-48 md:h-auto aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0">
                <Image 
                    src={place.imageUrl || "/images/placeholder.jpg"}
                    alt={place.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute top-3 right-3">
                    <div className={`px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-md border ${theme.border} ${theme.accent} text-[10px] font-black flex items-center gap-1.5 shadow-sm`}>
                        <ThemeIcon className="w-3 h-3" />
                        {theme.label}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center py-1">
                <div className="flex items-center gap-2 mb-2 text-[10px] md:text-xs">
                    <span className="flex items-center gap-1 text-text-muted font-bold">
                        <MapPin className="w-3 h-3 text-primary/70" />
                        {place.area}
                    </span>
                    {place.isVerified && (
                        <div className="flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            موثق
                        </div>
                    )}
                </div>

                <h3 className="text-xl md:text-2xl font-black text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {place.name}
                </h3>
                
                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed mb-4 opacity-80">
                    {place.description || `يعتبر ${place.name} من أفضل الوجهات في ${place.area} لعام ${new Date().getFullYear()}.`}
                </p>

                <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
                        <Star className="w-4 h-4 fill-current text-amber-500" />
                        <span className="text-base font-black">{place.rating}</span>
                        <span className="text-[10px] opacity-60">({place.reviews})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold">
                        <TrendingUp className="w-4 h-4 text-primary/60" />
                        <span>رائج حالياً</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
