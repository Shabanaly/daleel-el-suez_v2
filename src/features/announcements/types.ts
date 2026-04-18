export interface Announcement {
  id: string;
  content: string;
  label: string;
  link: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface AnnouncementFormValues {
  content: string;
  label: string;
  link?: string;
  is_active: boolean;
  order_index: number;
}

