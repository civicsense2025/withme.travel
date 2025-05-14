export interface TemplateMetadata {
  tags?: string[];
  author?: string;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  price_level?: 1 | 2 | 3 | 4 | 5;
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  highlights?: string[];
  best_for?: string[];
  [key: string]: any;
}

export interface Destination {
  id: string;
  name: string;
}

export interface TemplateData {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  destination_id?: string;
  destinations?: {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
  } | null;
  duration_days?: number;
  category?: string;
  featured?: boolean;
  is_published?: boolean;
  is_draft?: boolean;
  view_count?: number;
  use_count?: number;
  like_count?: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  profiles?: {
    id: string;
    username?: string | null;
    name?: string | null;
  } | null;
  cover_image_url?: string;
  groupsize?: string;
  tags?: string[];
  template_type?: string;
  source_trip_id?: string;
  version?: number;
  copied_count?: number;
  last_copied_at?: string;
  metadata?: TemplateMetadata;
}

export interface TemplateSection {
  id: string | number;
  template_id: string;
  day_number: number;
  title?: string;
  description?: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  date?: string;
}

export interface TemplateItem {
  id: string;
  template_id: string;
  section_id?: string | number;
  day?: number;
  day_number?: number;
  item_order?: number;
  position?: number;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  category?: string;
  item_type?: string;
  created_at?: string;
  updated_at?: string;
  estimated_cost?: number;
  currency?: string;
  duration_minutes?: number;
  cover_image_url?: string;
}
