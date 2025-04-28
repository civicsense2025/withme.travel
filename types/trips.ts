import { Tag } from "@/types/tags";

export interface Trip {
  id: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  name: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  destination_id: number | null;
  status: 'draft' | 'published' | 'archived' | null;
  budget: number | null;
  is_public: boolean;
  slug: string | null;
} 