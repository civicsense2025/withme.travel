import type { Database } from './.database.types';

// Enum type aliases
export type IdeaType = 'activity' | 'place' | 'note' | 'question' | 'other';
export type PlanningSessionStatus = 'draft' | 'active' | 'voting' | 'complete' | 'archived';
export type VoteType = Database['public']['Enums']['vote_type'];

// Basic group idea type
export type GroupIdea = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  type: IdeaType;
  created_by: string | null;
  guest_token: string | null;
  votes_up: number | null;
  votes_down: number | null;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;
  selected: boolean;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

// Extended group idea with creator details
export type GroupIdeaWithCreator = GroupIdea & {
  creator?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
};

// Group idea with user's vote information
export type GroupIdeaWithVotes = GroupIdeaWithCreator & {
  user_vote: VoteType | null;
};

// Vote on a group idea
export type GroupIdeaVote = {
  id: string;
  idea_id: string;
  user_id: string | null;
  guest_token: string | null;
  vote_type: VoteType;
  created_at: string;
};

// Planning session
export type PlanningSession = {
  id: string;
  group_id: string;
  name: string;
  status: PlanningSessionStatus;
  destination: string | null;
  date_range: {
    start: string;
    end: string;
  } | null;
  budget: string | null;
  activities: string[] | null;
  trip_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  exported_at: string | null;
};

// Planning readiness
export type PlanningReadiness = {
  id: string;
  session_id: string;
  user_id: string | null;
  guest_token: string | null;
  is_ready: boolean;
  ready_at: string | null;
  created_at: string;
  updated_at: string;
};

// User readiness with additional user info
export type UserReadiness = PlanningReadiness & {
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
};

// Planning poll
export type PlanningPoll = {
  id: string;
  session_id: string;
  question: string;
  type: IdeaType;
  multi_select: boolean;
  created_at: string;
  options?: PlanningPollOption[];
};

// Planning poll option
export type PlanningPollOption = {
  id: string;
  poll_id: string;
  text: string;
  idea_id: string | null;
  created_at: string;
  votes_count?: number;
  user_voted?: boolean;
};

// Planning poll vote
export type PlanningPollVote = {
  id: string;
  option_id: string;
  user_id: string | null;
  guest_token: string | null;
  created_at: string;
};

// Guest user info
export type GuestInfo = {
  token: string;
  name: string;
  email?: string;
  avatar_url?: string;
};

// Session summary to be presented after voting
export type PlanningSessionSummary = {
  session: PlanningSession;
  polls: {
    poll: PlanningPoll;
    winningOption: PlanningPollOption & {
      percent: number;
      voters: (string | null)[];
    };
    otherOptions: (PlanningPollOption & {
      percent: number;
      voters: (string | null)[];
    })[];
  }[];
};

// Data structure for drag and drop idea board
export type IdeaBoardLayout = {
  ideas: {
    ideaId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
};

// Form input types for creating and updating ideas
export type IdeaFormInput = {
  title: string;
  description: string;
  type: IdeaType;
  meta?: Record<string, any>;
};

// Form input for creating a planning session
export type PlanningSessionInput = {
  name: string;
  group_id: string;
  selected_ideas?: string[];
};

// WebSocket presence info for collaboration
export type IdeaBoardPresence = {
  user_id: string | null;
  guest_token: string | null;
  cursor: {
    x: number;
    y: number;
  } | null;
  idle: boolean;
  name: string;
  avatar_url: string | null;
  last_active: string;
};
