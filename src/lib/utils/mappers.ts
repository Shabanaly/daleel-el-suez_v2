/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from "../types/category";
import { Place } from "../types/places";
import { MarketAd, MarketCategory } from "../types/market";

export function mapPlace(p: any): Place {
    // Robustly handle working_hours (can be JSON object, stringified JSON, or legacy string)
    let workingHoursObj: any = null;
    let openHoursStr = '';

    const rawWorkingHours = p.working_hours;

    if (rawWorkingHours) {
        if (typeof rawWorkingHours === 'object' && rawWorkingHours !== null) {
            workingHoursObj = rawWorkingHours;
            const schedules = Object.values(workingHoursObj as any);
            const isOpenNow = schedules.some((s: any) => s && s.isOpen === true);
            openHoursStr = isOpenNow ? 'مفتوح الآن' : 'مغلق حالياً';
        } else if (typeof rawWorkingHours === 'string') {
            const trimmed = rawWorkingHours.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (typeof parsed === 'object' && parsed !== null) {
                        workingHoursObj = parsed;
                        const schedules = Object.values(workingHoursObj as any);
                        const isOpenNow = schedules.some((s: any) => s && (s.isOpen === true || s.is_open === true));
                        openHoursStr = isOpenNow ? 'مفتوح الآن' : 'مغلق حالياً';
                    } else {
                        openHoursStr = trimmed;
                    }
                } catch (e) {
                    openHoursStr = trimmed;
                }
            } else {
                openHoursStr = trimmed;
            }
        }
    }

    if (!openHoursStr) openHoursStr = 'قريباً';

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.categories?.name || 'عام',
        categoryId: p.category_id,
        categorySlug: p.categories?.slug || '',
        rating: Number(p.avg_rating) || 0,
        reviews: typeof p.reviews_count === 'number' ? p.reviews_count : (p.reviews_count?.[0]?.count || 0),
        area: typeof p.areas?.name === 'string' ? p.areas.name : 'السويس',
        icon: p.categories?.icon || '📍',
        tags: p.tags || [],
        imageUrl: p.images?.[0] || '',
        images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
        address: p.address || '',
        phoneNumber: typeof p.phone === 'object' && p.phone !== null ? {
            primary: p.phone.primary || '',
            others: Array.isArray(p.phone.others) ? p.phone.others : [],
            whatsapp: p.phone.whatsapp || ''
        } : {
            primary: p.phone || '',
            others: [],
            whatsapp: ''
        },
        isVerified: p.is_verified || false,
        openHours: openHoursStr,
        workingHours: workingHoursObj,
        viewsCount: Number(p.views_count) || 0,
        description: p.description || '',
        createdAt: p.created_at || new Date().toISOString(),
        district: typeof p.areas?.districts?.name === 'string' ? p.areas.districts.name : 'السويس',
        socialLinks: Array.isArray(p.social_links) ? p.social_links :
            (typeof p.social_links === 'object' && p.social_links !== null ?
                Object.entries(p.social_links).map(([k, v]) => ({ platform: k, url: v as string })).filter(link => link.url)
                : [])
    };
}


export function mapCategory(c: any): Category {
    return {
        id: c.id,
        slug: c.slug || String(c.id),
        name: c.name,
        icon: c.icon || '📍',
        count: `${c.places?.[0]?.count || 0}+ مكان`,
        rawCount: c.places?.[0]?.count || 0
    };
}

export function mapMarketAd(p: any): MarketAd {
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || '',
        price: Number(p.price) || 0,
        currency: 'ج.م',
        condition: p.condition as any,
        images: Array.isArray(p.images) ? p.images : [],
        category_id: String(p.category_id),
        category_name: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name,
        category_slug: Array.isArray(p.categories) ? p.categories[0]?.slug : p.categories?.slug,
        seller_id: p.seller_id,
        seller_name: p.profiles?.full_name || 'صاحب الإعلان',
        seller_phone: p.contact_phone || '',
        status: p.status as any,
        location: p.areas?.name || 'السويس',
        is_negotiable: p.is_negotiable || false,
        views_count: p.views_count || 0,
        daily_views: (() => {
            const today = new Date().toISOString().split('T')[0];
            const dv = Array.isArray(p.listing_daily_views) ? p.listing_daily_views[0] : p.listing_daily_views;
            return dv?.view_date === today ? dv.count || 0 : 0;
        })(),
        created_at: p.created_at,
        updated_at: p.updated_at
    };
}

export function mapMarketCategory(c: any): MarketCategory {
    return {
        id: String(c.id),
        slug: c.slug,
        name: c.name,
        icon: c.icon || 'ShoppingBag',
        adCount: (() => {
            const listings = c.listings;
            if (Array.isArray(listings)) return listings[0]?.count || 0;
            if (typeof listings === 'object' && listings !== null) return (listings as any).count || 0;
            return 0;
        })()
    };
}
