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
    socialLinks?: {
        platform: string;
        url: string;
    }[];
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
