export interface Place {
    id: string;
    slug: string;
    name: string;
    category: string;
    categoryId?: number;
    categorySlug?: string;
    rating: number;
    reviews: number;
    area: string;
    color?: string;
    icon: string;
    tags: string[];
    imageUrl: string;
    images: string[];
    address: string;
    phoneNumber: {
        primary: string;
        others: string[];
        whatsapp: string;
    };
    isVerified: boolean;
    openHours: string;
    workingHours?: WeeklySchedule;
    viewsCount: number;
    description?: string;
    createdAt: string;
    district: string;
    publicIds?: string[];
    socialLinks?: {
        platform: string;
        url: string;
    }[];
    favoritesCount: number;
    pulseContext?: {
        newReviews: number;
        avgRating: number;
    };
}

export type SortOption = 'name' | 'newest' | 'trending';

export type DayKey =
    | "saturday"
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday";

export interface DaySchedule {
    isOpen: boolean;
    from: string | null;
    to: string | null;
}

export type WeeklySchedule = Record<DayKey, DaySchedule>;

export interface RawPlace {
    id: string;
    slug: string;
    name: string;
    category_id?: number;
    area_id?: number;
    categories?: {
        name: string;
        slug: string;
        icon: string;
    } | null;
    avg_rating?: number | string;
    reviews_count?: number | { count: number }[];
    areas?: {
        name: string;
        districts?: {
            name: string;
        } | null;
    } | null;
    tags?: string[];
    images?: string[];
    address?: string;
    phone?: unknown;
    is_verified?: boolean;
    working_hours?: unknown;
    views_count?: number | string;
    description?: string;
    created_at?: string;
    public_ids?: string[];
    social_links?: unknown;
    favorites_count?: number | { count: number }[];
}
