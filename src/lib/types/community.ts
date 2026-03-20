export interface CommunityPost {
    id: string;
    content: string;
    created_at: string;
    author?: {
        full_name: string | null;
        avatar_url: string | null;
        username?: string | null;
    } | null;
    category?: {
        name: string;
        icon: string;
    } | null;
    author_id: string;
    category_id?: number | string;
    images?: string[];
    public_ids?: string[];
    likes_count?: number;
    comments_count?: { count: number }[] | number;
    isLiked?: boolean;
}

export interface CommunityCategory {
    id: number;
    name: string;
    icon: string;
    slug: string;
}
export interface CommunityComment {
    id: string;
    post_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    author_id: string;
    author?: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    isOptimistic?: boolean;
}
