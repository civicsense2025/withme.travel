// Define the place category enum type directly, matching the SQL definition
export type PlaceCategory =
  | 'attraction'
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'landmark'
  | 'shopping'
  | 'transport'
  | 'other';

// Structure to match the 'places' table in your database
export interface Place {
  id: string; // UUID
  google_place_id?: string | null; // Optional: Original Google Place ID
  name: string;
  description: string | null;
  category: PlaceCategory | null; // Use the locally defined type
  address: string | null;
  latitude: number | null; // DECIMAL(9, 6) maps well to number
  longitude: number | null; // DECIMAL(9, 6) maps well to number
  destination_id: string | null; // UUID
  price_level: number | null; // INTEGER CHECK (1-5) -> Assuming 1-4 from Google for now
  rating: number | null; // DECIMAL(2, 1) -> Google provides float
  rating_count: number | null; // INTEGER DEFAULT 0
  images: string[] | null; // TEXT[] -> Will store Google Photo References here
  tags: string[] | null; // TEXT[]
  opening_hours: Record<string, any> | null; // JSONB -> Store Google's opening_hours object
  is_verified: boolean; // DEFAULT FALSE
  suggested_by: string | null; // UUID
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  source: string | null; // TEXT
  source_id: string | null; // TEXT
  website?: string | null; // Add if you store website
  phone_number?: string | null; // Add if you store phone number
}

// You might also want a type for the Google Photo Reference structure
export interface GooglePhotoReference {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}
