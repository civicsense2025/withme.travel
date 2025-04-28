import { User } from './user'
import { Destination } from './destination'
import { TripRole, TripStatus, TripType } from "@/utils/constants";
import { Database } from "./database.types";

// Define the complex budget object type
export interface TripBudgetObject { 
  total: number;
  currency: string;
  categories?: { // Made categories optional as it might not always be present
    accommodation?: number;
    transportation?: number;
    activities?: number;
    food?: number;
    shopping?: number;
    other?: number;
  };
}

// Modify the existing interface Trip
export interface Trip {
  id: string
  name: string
  description: string | null
  created_by: string | null // Allow null
  start_date: string | null
  end_date: string | null
  destination_id: string | null
  destination_name: string | null
  cover_image_url: string | null | undefined // Allow undefined
  created_at: string
  updated_at: string | null // Allow null
  status: TripStatus | null
  is_public: boolean
  vibe: string | null
  trip_type: TripType | null
  // Add/Ensure missing fields are present
  slug: string | null;
  public_slug: string | null; // Keep if needed elsewhere
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null;
  duration_days: number | null;
  playlist_url: string | null;
  // Update budget type
  budget: TripBudgetObject | number | null; // Allow number for simpler budget or the object

  // Keep existing relationship fields if they were there
  // creator?: User // Example
  // destination?: Destination // Example
  // Add other fields if they were part of the original interface
} 