export type HeroAdIconType = 'verified' | 'offer' | 'new';
export type HeroAdMediaType = 'image' | 'video' | 'gif' | 'none';

export interface HeroAd {
  id: string;
  title: string;
  description: string | null;
  tag_text: string | null;
  action_url: string;
  icon_type: HeroAdIconType | null;
  media_url: string | null;
  media_type: HeroAdMediaType;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface HeroAdFormValues {
  title: string;
  description?: string;
  tag_text?: string;
  action_url: string;
  icon_type?: HeroAdIconType | null;
  media_url?: string;
  media_type: HeroAdMediaType;
  is_active: boolean;
  order_index: number;
}
