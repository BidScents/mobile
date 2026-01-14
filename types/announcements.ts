export type AnnouncementType = 'info' | 'deal' | 'warning';

export interface Announcement {
  id: number;
  created_at: string;
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  action_text?: string;
  type: AnnouncementType;
  is_active: boolean;
  show_once: boolean;
  starts_at?: string;
  ends_at?: string;
}
