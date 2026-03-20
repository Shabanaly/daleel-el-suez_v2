import { Award, Star, TrendingUp, Users, MessageSquare, LucideIcon } from "lucide-react";

const IconMap: Record<string, LucideIcon> = {
    award: Award,
    star: Star,
    trending: TrendingUp,
    users: Users,
    message: MessageSquare
};

interface BestOfHeroProps {
    title: string;
    description: string;
    stats?: {
        label: string;
        value: string | number;
        iconName: "award" | "star" | "trending" | "users" | "message";
    }[];
}

export default function BestOfHero({ title, description, stats }: BestOfHeroProps) {
    return (
        <section className="relative pt-12 pb-20 overflow-hidden">
            {/* Background elements - more dynamic and layered */}
            <div className="absolute top-0 right-0 w-240 h-240 bg-linear-to-bl from-primary/5 via-primary/2 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-200 h-200 bg-linear-to-tr from-accent/5 via-transparent to-transparent rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="max-w-4xl text-right" dir="rtl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                        <Award className="w-3 h-3" />
                        القائمة الذهبية لعام {new Date().getFullYear()}
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-6 tracking-tight">
                        {title}
                    </h1>
                    
                    <p className="text-base md:text-lg font-bold text-text-muted leading-relaxed mb-10 max-w-2xl">
                        {description}
                    </p>

                    {stats && (
                        <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 flex-wrap">
                            {stats.map((stat, i) => {
                                const Icon = IconMap[stat.iconName] || Star;
                                return (
                                    <div 
                                        key={i} 
                                        className="flex items-center gap-4 bg-surface/40 backdrop-blur-xl p-5 rounded-4xl border border-border-subtle/20 shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all duration-300 group/stat"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover/stat:scale-110 transition-transform">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-text-primary leading-none mb-1.5 tabular-nums">
                                                {stat.value}
                                            </div>
                                            <div className="text-[11px] font-black text-text-muted/80 uppercase tracking-[0.2em]">
                                                {stat.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
