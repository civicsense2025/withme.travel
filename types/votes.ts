import { Profile } from './profile';

/**
 * NOTE: Emoji reactions are now handled by ItineraryItemReaction (see types/database.types.ts)
 * This file is for up/down votes only.
 */

/**
 * Consolidated ProcessedVotes interface that uses the Profile from types/profile.ts
 */
export interface ProcessedVotes {
  up: number;
  down: number;
  upVoters: Profile[];
  downVoters: Profile[];
  userVote: 'up' | 'down' | null;
}

export interface Vote {
  id: string;
  user_id: string;
  itinerary_item_id: string; // Foreign key to itinerary_items (not item_id)
  vote_type: 'up' | 'down';
  created_at: string;
}
