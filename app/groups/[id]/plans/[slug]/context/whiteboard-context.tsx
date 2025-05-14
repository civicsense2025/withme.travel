'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import type { GroupIdea } from '@/types/group-ideas';

type ViewMode = 'grid' | 'kanban';

interface Idea {
  id?: string;
  title: string;
  description?: string | null;
  position?: { x: number; y: number } | null;
  tags?: string[];
  metadata?: Record<string, any>;
  group_id?: string;
  plan_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface Destination {
  id: string;
  name: string;
  description?: string | null;
}

interface GroupData {
  id: string;
  name: string;
  description?: string | null;
  primary_city_id?: string | null;
  // Add other properties as needed
}

interface WhiteboardContextProps {
  ideas: Idea[];
  loading: boolean;
  error: Error | null;
  destination: Destination | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  addIdea: (idea: Idea) => Promise<any>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<any>;
  deleteIdea: (id: string) => Promise<boolean>;
  searchIdeas: (query: string) => void;
  filterIdeas: (tags: string[]) => void;
}

const WhiteboardContext = createContext<WhiteboardContextProps | undefined>(undefined);

interface WhiteboardProviderProps {
  children: React.ReactNode;
  groupId: string;
  planId: string;
}

// Helper function to transform database response to our Idea interface
const transformToIdea = (item: any): Idea => {
  return {
    id: item.id,
    title: item.title || '',
    description: item.description,
    // Safely handle position data which might be in various formats
    position:
      item.position && typeof item.position === 'object'
        ? {
            x: typeof item.position.x === 'number' ? item.position.x : 0,
            y: typeof item.position.y === 'number' ? item.position.y : 0,
          }
        : null,
    // Handle tags which might not exist
    tags: Array.isArray(item.tags) ? item.tags : [],
    // Use metadata or meta, whichever exists
    metadata: item.metadata || item.meta || {},
    group_id: item.group_id,
    plan_id: item.plan_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

export function WhiteboardProvider({ children, groupId, planId }: WhiteboardProviderProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch ideas when component mounts
  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      try {
        const supabase = getBrowserClient();

        // Fetch the group to get destination info
        const { data: groupData, error: groupError } = await supabase
          .from(TABLES.GROUPS)
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        // Fetch destination info if available
        // Use the primary_city_id property from the group
        const destinationId = groupData?.primary_city_id;
        if (destinationId) {
          const { data: destData, error: destError } = await supabase
            .from(TABLES.DESTINATIONS)
            .select('id, name, description')
            .eq('id', destinationId)
            .single();

          if (!destError && destData) {
            setDestination(destData as Destination);
          }
        }

        // Fetch ideas for this plan
        const { data, error: ideasError } = await supabase
          .from(TABLES.GROUP_PLAN_IDEAS)
          .select('*')
          .eq('group_id', groupId)
          .eq('plan_id', planId)
          .order('created_at', { ascending: false });

        if (ideasError) throw ideasError;

        // Transform the data to match our Idea interface
        const transformedIdeas: Idea[] = (data || []).map(transformToIdea);

        setIdeas(transformedIdeas);
        setFilteredIdeas(transformedIdeas);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ideas'));
      } finally {
        setLoading(false);
      }
    }

    if (groupId && planId) {
      fetchIdeas();
    }
  }, [groupId, planId]);

  // Add a new idea
  const addIdea = useCallback(
    async (idea: Idea) => {
      try {
        const supabase = getBrowserClient();

        const newIdea = {
          group_id: groupId,
          plan_id: planId,
          title: idea.title,
          description: idea.description,
          position: idea.position || { x: 0, y: 0 },
          tags: idea.tags || [],
          metadata: idea.metadata || {},
        };

        const { data, error } = await supabase
          .from(TABLES.GROUP_PLAN_IDEAS)
          .insert(newIdea)
          .select()
          .single();

        if (error) throw error;

        // Transform the response data to our Idea interface
        const transformedIdea = transformToIdea(data);

        setIdeas((prev) => [transformedIdea, ...prev]);
        setFilteredIdeas((prev) => [transformedIdea, ...prev]);

        return transformedIdea;
      } catch (err) {
        console.error('Error adding idea:', err);
        setError(err instanceof Error ? err : new Error('Failed to add idea'));
        return null;
      }
    },
    [groupId, planId]
  );

  // Update an existing idea
  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    try {
      const supabase = getBrowserClient();

      const { data, error } = await supabase
        .from(TABLES.GROUP_PLAN_IDEAS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Transform the response data to our Idea interface
      const transformedIdea = transformToIdea(data);

      setIdeas((prev) => prev.map((idea) => (idea.id === id ? transformedIdea : idea)));
      setFilteredIdeas((prev) => prev.map((idea) => (idea.id === id ? transformedIdea : idea)));

      return transformedIdea;
    } catch (err) {
      console.error('Error updating idea:', err);
      setError(err instanceof Error ? err : new Error('Failed to update idea'));
      return null;
    }
  }, []);

  // Delete an idea
  const deleteIdea = useCallback(async (id: string) => {
    try {
      const supabase = getBrowserClient();

      const { error } = await supabase.from(TABLES.GROUP_PLAN_IDEAS).delete().eq('id', id);

      if (error) throw error;

      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      setFilteredIdeas((prev) => prev.filter((idea) => idea.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting idea:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete idea'));
      return false;
    }
  }, []);

  // Search ideas
  const searchIdeas = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredIdeas(ideas);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results = ideas.filter((idea) => {
        return (
          (idea.title?.toLowerCase() || '').includes(lowerQuery) ||
          (idea.description?.toLowerCase() || '').includes(lowerQuery) ||
          idea.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      });

      setFilteredIdeas(results);
    },
    [ideas]
  );

  // Filter ideas by tags
  const filterIdeas = useCallback(
    (tags: string[]) => {
      if (!tags.length) {
        setFilteredIdeas(ideas);
        return;
      }

      const results = ideas.filter((idea) => {
        return tags.every((tag) => idea.tags?.includes(tag));
      });

      setFilteredIdeas(results);
    },
    [ideas]
  );

  const value = {
    ideas: filteredIdeas,
    loading,
    error,
    destination,
    viewMode,
    setViewMode,
    addIdea,
    updateIdea,
    deleteIdea,
    searchIdeas,
    filterIdeas,
  };

  return <WhiteboardContext.Provider value={value}>{children}</WhiteboardContext.Provider>;
}

export function useWhiteboardContext() {
  const context = useContext(WhiteboardContext);

  if (context === undefined) {
    throw new Error('useWhiteboardContext must be used within a WhiteboardProvider');
  }

  return context;
}
