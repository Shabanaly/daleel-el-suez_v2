import { MarketAd } from '@/lib/types/market';
import { Eye, Pencil, Trash2, Loader2, MoreVertical, CheckCircle2, AlertCircle, Tag, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SafeImage } from '@/components/common/SafeImage';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { useRouter } from 'next/navigation';

interface MyAdCardProps {
    ad: MarketAd;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, newStatus: string) => void;
    isProcessing: boolean;
    index: number;
}

export function MyAdCard({ ad, onDelete, onUpdateStatus, isProcessing, index }: MyAdCardProps) {
    const router = useRouter();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-EG').format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const isSold = ad.status === 'sold';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className={`flex flex-col bg-surface hover:bg-elevated border border-border-subtle rounded-2xl overflow-hidden shadow-sm transition-all duration-300 w-full ${isSold ? 'opacity-75 grayscale-[0.3]' : ''}`}
        >
            <div className="p-3">
                {/* Top Section: Image & Main Details */}
                <div className="flex gap-4 relative">
                    {/* Image */}
                    <Link href={`/market/${ad.slug}`} className="block relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-background">
                        <SafeImage
                            src={ad.images[0]}
                            alt={ad.title}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-700"
                        />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
                        <Link href={`/market/${ad.slug}`}>
                            <h3 className="text-sm font-black text-text-primary line-clamp-1 hover:text-primary transition-colors">
                                {ad.title}
                            </h3>
                        </Link>
                        
                        <div className="text-base font-black text-primary mt-1.5 flex items-baseline gap-1">
                            {formatPrice(ad.price)}
                            <span className="text-[10px] font-bold opacity-80">ج.م</span>
                        </div>
                        
                        <div className="text-xs font-bold text-text-muted mt-1 bg-surface-elevated inline-block self-start px-2 py-0.5 rounded-md">
                            {ad.category_name}
                        </div>
                    </div>

                    {/* Left Menu Area */}
                    <div className="absolute top-0 left-0">
                         <ContextMenu
                            trigger={
                                <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-elevated">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            }
                            items={[
                                {
                                    label: 'تعديل الإعلان',
                                    icon: <Pencil className="w-4 h-4" />,
                                    onClick: () => router.push(`/market/edit/${ad.id}`)
                                },
                                {
                                    label: isSold ? 'تنشيط الإعلان' : 'تغيير لـ تم بيعه',
                                    icon: isSold ? <RefreshCcw className="w-4 h-4" /> : <Tag className="w-4 h-4" />,
                                    onClick: () => onUpdateStatus(ad.id, isSold ? 'active' : 'sold')
                                },
                                {
                                    label: isProcessing ? 'جاري الحذف...' : 'حذف الإعلان نهائياً',
                                    icon: isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />,
                                    variant: 'destructive',
                                    disabled: isProcessing,
                                    onClick: () => onDelete(ad.id)
                                }
                            ]}
                            align="left"
                            openDirection="down"
                            className="pl-2"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border-subtle/50 my-3" />

                {/* Middle Section: Stats & Status & Date */}
                <div className="flex flex-col gap-3">
                    {/* Date */}
                    <div className="text-[11px] font-bold text-text-muted text-left">
                        نُشر في {formatDate(ad.created_at)}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <Eye className="w-4 h-4 opacity-70" />
                            <span className="text-xs font-black">{ad.views_count} المشاهدات</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                                ad.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : ad.status === 'sold'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                                : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                            }`}>
                            {ad.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : ad.status === 'sold' ? <Tag className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {ad.status === 'active' ? 'نشط' : ad.status === 'sold' ? 'مُباع' : 'قيد المراجعة'}
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 mt-4">
                    <button 
                        onClick={() => router.push(`/market/edit/${ad.id}`)}
                        className="flex-1 bg-surface-elevated hover:bg-border-subtle text-text-primary rounded-xl py-2.5 text-sm font-black transition-colors border border-border-subtle"
                    >
                        تعديل الإعلان
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(ad.id, isSold ? 'active' : 'sold')}
                        disabled={isProcessing}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            isSold 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20' 
                            : 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20'
                        }`}
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isSold ? <RefreshCcw className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        {isProcessing ? 'جاري التنفيذ...' : isSold ? 'تنشيط الإعلان' : 'تم بيعه'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
