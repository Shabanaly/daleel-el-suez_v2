'use client';

import { PlaceStatus } from '@/features/admin/actions/places';
import { PlaceStatusBadge } from './PlaceStatusBadge';
import { MapPin, Phone, Star, User, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';

// Define a safe type instead of any
type PlaceData = Record<string, unknown> & {
    id: string;
    name: string;
    address: string;
    category?: { name: string };
    area: string;
    district: string;
    phone?: string | { primary?: string; whatsapp?: string; others?: string[] };
    rating?: number;
    reviews_count?: number;
    created_at: string;
    status: PlaceStatus;
};

interface PlacesDataTableProps {
    places: PlaceData[] | Record<string, unknown>[];
    isLoading: boolean;
    onUpdateStatus: (placeId: string, status: PlaceStatus) => Promise<{ success: boolean; error?: string }>;
    onDelete: (placeId: string) => Promise<{ success: boolean; error?: string }>;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export function PlacesDataTable({ places, isLoading, onUpdateStatus, onDelete, page, totalPages, onPageChange }: PlacesDataTableProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showConfirm } = useDialog();

    const handleStatusChange = async (placeId: string, status: PlaceStatus) => {
        setActionLoading(placeId);
        await onUpdateStatus(placeId, status);
        setActionLoading(null);
    };

    const handleDelete = (placeId: string) => {
        showConfirm({
            title: 'حذف المكان',
            message: 'هل أنت متأكد من حذف هذا المكان نهائياً؟',
            type: 'confirm',
            confirmLabel: 'حذف',
            cancelLabel: 'إلغاء',
            onConfirm: async () => {
                setActionLoading(placeId);
                await onDelete(placeId);
                setActionLoading(null);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="glass-card rounded-xl shadow-sm p-8 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin glow-primary"></div>
            </div>
        );
    }

    if (places.length === 0) {
        return (
            <div className="glass-card rounded-xl shadow-sm p-12 text-center text-text-muted">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-text-primary">لا توجد أماكن لعرضها</p>
                <p className="text-sm mt-1">لم يتم العثور على أماكن تطابق معايير البحث.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-elevated/50 text-text-secondary border-b border-border-subtle backdrop-blur-sm">
                        <tr>
                            <th className="px-4 py-3 font-semibold">المكان</th>
                            <th className="px-4 py-3 font-semibold hidden md:table-cell">القسم والمنطقة</th>
                            <th className="px-4 py-3 font-semibold hidden lg:table-cell">التواصل والتقييم</th>
                            <th className="px-4 py-3 font-semibold hidden sm:table-cell">التاريخ</th>
                            <th className="px-4 py-3 font-semibold">الحالة</th>
                            <th className="px-4 py-3 font-semibold text-center mt-auto">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {places.map((p) => {
                            const place = p as PlaceData;
                            return (
                                <tr key={place.id} className="hover:bg-primary/5 transition-colors duration-300">
                                    {/* Name & Address */}
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-base text-primary mb-1">{place.name}</div>
                                        <div className="text-xs text-text-muted flex items-start gap-1 max-w-[200px]">
                                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            <span className="truncate">{place.address}</span>
                                        </div>
                                        {/* Mobile Only Metadata */}
                                        <div className="md:hidden mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="bg-background py-0.5 px-2 rounded-md border">{place.category?.name}</span>
                                            <span className="bg-background py-0.5 px-2 rounded-md border">{place.area}</span>
                                        </div>
                                    </td>

                                    {/* Category & Area (Desktop) */}
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="font-medium">{place.category?.name}</div>
                                        <div className="text-xs text-text-muted mt-1">{place.area} - {place.district}</div>
                                    </td>

                                    {/* Contact & Stats (Desktop) */}
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        {place.phone && (
                                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5" dir="ltr">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>
                                                    {typeof place.phone === 'string'
                                                        ? place.phone
                                                        : place.phone.primary || place.phone.whatsapp || 'متاح'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-xs font-medium text-warning">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {(place.rating || 0).toFixed(1)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-text-muted">
                                                <User className="w-3.5 h-3.5" />
                                                {place.reviews_count || 0}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-4 hidden sm:table-cell text-text-muted text-xs">
                                        {format(new Date(place.created_at), 'dd MMM yyyy', { locale: ar })}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <PlaceStatusBadge status={place.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {actionLoading === place.id ? (
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    {place.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleStatusChange(place.id, 'approved')}
                                                            className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors"
                                                            title="قبول"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {place.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleStatusChange(place.id, 'rejected')}
                                                            className="p-1.5 text-error hover:bg-error/10 rounded-md transition-colors"
                                                            title="رفض"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(place.id)}
                                                        className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors ml-2"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages !== undefined && totalPages > 1 && onPageChange && page !== undefined && (
                <div className="flex items-center justify-between p-4 border-t border-border-subtle bg-surface/50 mt-auto">
                    <div className="text-sm text-text-muted font-medium">
                        صفحة {page} من {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className="px-4 py-2 rounded-lg border border-border-subtle bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-elevated transition-colors text-sm font-medium"
                        >
                            السابق
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className="px-4 py-2 rounded-lg border border-border-subtle bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-elevated transition-colors text-sm font-medium"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
