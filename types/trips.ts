// Since we now know FIELDS has export issues, let's import it differently or comment it out
// 
import { Tag } from '@/types/tags';

/**
 * Trip interface aligned with database schema
 * Based on TABLES.TRIPS fields in utils/constants/database.ts
 */
export interface Trip {
  // Common fields
  id: string;
  created_at: string;
  updated_at: string;

  // Basic trip information
  name: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  destination_id: number | null;
  destination_name: string | null;
  travelers_count: number | null;
  vibe: string | null;
  budget: number | null;

  // Status and visibility
  is_public: boolean;
  status: 'draft' | 'published' | 'archived' | null;
  privacy_setting: string | null;
  deleted: boolean | null;
  featured: boolean | null;

  // URLs and slugs
  slug: string | null;
  public_slug: string | null;
  shared_url: string | null;

  // Media
  cover_image_url: string | null;
  trip_emoji: string | null;

  // Location data
  location: string | null;
  latitude: number | null;
  longitude: number | null;

  // Metrics
  like_count: number | null;
  view_count: number | null;
  use_count: number | null;
  comments_count: number | null;
  member_count: number | null;

  // Metadata
  trip_type: string | null;
  created_by: string | null;
  duration_days: number | null;
  date_flexibility: string | null;

  // Relationship fields (not directly in DB schema but used in app)
  tags?: Tag[];
  creator_id?: string; // For backward compatibility
}
