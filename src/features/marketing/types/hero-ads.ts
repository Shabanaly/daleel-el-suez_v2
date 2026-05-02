export interface HeroAd {
    id: string;
    title: string;
    description: string | null;
    tag_text: string | null;
    action_url: string;
    icon_type: 'verified' | 'offer' | 'new' | null;
    media_url: string | null;
    media_type: 'image' | 'video' | 'gif' | 'none';
    is_active: boolean;
    order_index: number;
}
