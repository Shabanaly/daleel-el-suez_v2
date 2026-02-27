export interface Place {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    area: string;
    color: string;
    icon: string;
    tags: string[];
    imageUrl: string;
    address: string;
    phoneNumber: string;
    isVerified: boolean;
    openHours: string;
    description?: string;
}

export type SortOption = 'rating' | 'reviews' | 'name';
