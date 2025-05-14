export interface Destination {
  id: string;
  name?: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  continent: string | null;
  description: string | null;
  best_season?: string | null;
  avg_cost_per_day?: number | null;
  local_language?: string | null;
  time_zone?: string | null;
  cuisine_rating?: number | null;
  cultural_attractions?: number | null;
  nightlife_rating?: number | null;
  family_friendly?: boolean | null;
  outdoor_activities?: number | null;
  beach_quality?: number | null;
  shopping_rating?: number | null;
  safety_rating?: number | null;
  wifi_connectivity?: number | null;
  public_transportation?: number | null;
  eco_friendly_options?: number | null;
  walkability?: number | null;
  instagram_worthy_spots?: number | null;
  off_peak_appeal?: number | null;
  digital_nomad_friendly?: number | null;
  lgbtq_friendliness?: number | null;
  accessibility?: number | null;
  highlights?: string | null;
  tourism_website?: string | null;
  image_url?: string | null;
  image_metadata?: {
    alt_text?: string | null;
    attribution?: string | null;
    attributionHtml?: string | null;
    photographer_name?: string | null;
    photographer_url?: string | null;
    source?: string | null;
    source_id?: string | null;
    url?: string | null;
  };
  emoji?: string | null;
  viator_destination_id?: string | null; // Viator's numeric destination ID
}
