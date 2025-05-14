import { GroupPlanIdeaType, VoteType } from '@/utils/constants/status';

// Position of an idea in a whiteboard/canvas
export interface IdeaPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Position of an idea in a column layout
export interface ColumnPosition {
  columnId: ColumnId;
  index: number;
}

// Column IDs for different sections of the idea board
export type ColumnId = 'destination' | 'date' | 'place' | 'activity' | 'notes' | 'other';

// Group Idea model
export interface GroupIdea {
  id: string;
  group_id: string;
  plan_id?: string | null;
  created_by: string | null;
  guest_token?: string | null;
  title: string;
  description: string;
  type: ColumnId;
  position: IdeaPosition | ColumnPosition;
  votes_up: number;
  votes_down: number;
  selected: boolean;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_vote?: VoteType | null;
}

// GroupIdeas in the board layout
export interface GroupIdeaMap {
  [key: string]: GroupIdea;
}

// View modes for the ideas board
export type ViewMode = 'board' | 'grid' | 'columns';
