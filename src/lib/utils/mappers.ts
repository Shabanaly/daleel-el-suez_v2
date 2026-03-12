import { Category } from "../types/category";
import { Place } from "../types/places";

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
        rating: Number(p.avg_rating) || 0,
        reviews: typeof p.reviews_count === 'number' ? p.reviews_count : (p.reviews_count?.[0]?.count || 0),
        area: typeof p.areas?.name === 'string' ? p.areas.name : 'السويس',
        icon: p.categories?.icon || '📍',
        tags: p.tags || [],
        imageUrl: p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : p.images[0]) : '',
        images: Array.isArray(p.images) ? p.images.map((img: string) => {
            if (!img) return '';
            // If it's a full URL and contains non-ascii characters, it might need encoding
            // However, usually Cloudinary/Supabase URLs are already encoded or handle it.
            // But if they are raw paths, we need to be careful.
            try {
                // If it's already a valid URL, we don't want to double encode
                new URL(img);
                return img;
            } catch (e) {
                // Not a full URL or invalid, if it has Arabic characters, encodeURIComponent might be needed for the path
                return img;
            }
        }) : (p.images ? [p.images] : []),
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
        name: c.name,
        icon: c.icon || '📍',
        count: `${c.places?.[0]?.count || 0}+ مكان`,
        rawCount: c.places?.[0]?.count || 0
    };
}
