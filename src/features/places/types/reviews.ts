export interface Review {
    id: string;
    place_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}
