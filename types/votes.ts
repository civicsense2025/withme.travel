import { Profile } from './profile';

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
  itinerary_item_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}
