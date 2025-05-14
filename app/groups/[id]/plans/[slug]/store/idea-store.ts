'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Column types for the new layout
export type ColumnId = 'destination' | 'date' | 'activity' | 'budget' | 'other';

// Position is only column-based now
export type IdeaPosition = {
  columnId: ColumnId;
  index: number;
};

export interface GroupIdea {
  id: string;
  group_id: string;
  created_by: string | null;
  guest_token: string | null;
  type: ColumnId;
  title: string;
  description: string | null;
  position: IdeaPosition | null;
  votes_up: number | null;
  votes_down: number | null;
  selected: boolean;
  meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  start_date?: string | null; // For date ideas
  end_date?: string | null; // For date ideas
  link?: string | null; // Optional hyperlink for the idea
  link_meta?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
  } | null;
  comment_count?: number; // Number of comments on the idea
  collaborators?: Array<{
    id?: string;
    name?: string;
    avatar_url?: string;
  }>; // Users who have collaborated on this idea
}

interface IdeaStoreState {
  ideas: GroupIdea[];
  loading: boolean;
  error: Error | null;

  // Actions
  setIdeas: (ideas: GroupIdea[]) => void;
  addIdea: (idea: GroupIdea) => void;
  updateIdea: (ideaId: string, updates: Partial<GroupIdea>) => void;
  updateIdeaPosition: (ideaId: string, position: IdeaPosition) => void;
  removeIdea: (ideaId: string) => void;
  voteForIdea: (ideaId: string, voteType: 'up' | 'down') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useIdeaStore = create<IdeaStoreState>()(
  immer((set) => ({
    // Initial state
    ideas: [],
    loading: false,
    error: null,

    // Actions
    setIdeas: (ideas) => set({ ideas }),

    addIdea: (idea) =>
      set((state) => {
        state.ideas.push(idea);
      }),

    updateIdea: (ideaId, updates) =>
      set((state) => {
        const ideaIndex = state.ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex !== -1) {
          Object.assign(state.ideas[ideaIndex], updates);
        }
      }),

    updateIdeaPosition: (ideaId, position) =>
      set((state) => {
        const idea = state.ideas.find((i) => i.id === ideaId);
        if (idea) {
          idea.position = position;
        }
      }),

    removeIdea: (ideaId) =>
      set((state) => {
        const ideaIndex = state.ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex !== -1) {
          state.ideas.splice(ideaIndex, 1);
        }
      }),

    voteForIdea: (ideaId, voteType) =>
      set((state) => {
        const idea = state.ideas.find((i) => i.id === ideaId);
        if (!idea) return;

        if (voteType === 'up') {
          idea.votes_up = (idea.votes_up || 0) + 1;
        } else if (voteType === 'down') {
          idea.votes_down = (idea.votes_down || 0) + 1;
        }
      }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),
  }))
);
