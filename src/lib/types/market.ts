export type AdStatus = 'active' | 'sold' | 'pending_approval' | 'rejected' | 'archived';
export type AdCondition = 'new' | 'used' | 'na';

export interface MarketAd {
    id: string; // UUID
    title: string;
    description: string;
    price: number;
    currency: string;
    condition: AdCondition;
    images: string[];
    category_id: string; // UUID
    category_name?: string;
    category_slug?: string;
    area_id?: number;
    area_name?: string;
    seller_id: string; // auth.users UUID
    seller_name: string;
    seller_phone: string;
    seller_photo?: string;
    status: AdStatus;
    location: string; // Area name
    views_count: number;
    created_at: string;
    updated_at?: string;
}

export interface MarketCategory {
    id: string;
    slug: string;
    name: string;
    icon: string;
    adCount: number;
}
