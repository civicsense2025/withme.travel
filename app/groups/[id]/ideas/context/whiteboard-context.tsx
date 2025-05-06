'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';

type ViewMode = 'grid' | 'kanban';

interface Idea {
  id?: string;
  title: string;
  description: string;
  position?: { x: number; y: number };
  tags?: string[];
  metadata?: Record<string, any>;
  // Other properties as needed
}

interface Destination {
  id: string;
  name: string;
  description?: string;
  // Other properties as needed
}

interface WhiteboardContextProps {
  ideas: Idea[];
  loading: boolean;
  error: Error | null;
  destination: Destination | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  searchIdeas: (query: string) => void;
  filterIdeas: (tags: string[]) => void;
}

const WhiteboardContext = createContext<WhiteboardContextProps | undefined>(undefined);

interface WhiteboardProviderProps {
  children: React.ReactNode;
  groupId: string;
  planId: string;
}

export function WhiteboardProvider({ children, groupId, planId }: WhiteboardProviderProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Fetch ideas for this board
  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      try {
        const supabase = getBrowserClient();
        
        // Fetch the group to get destination info
        const { data: groupData, error: groupError } = await supabase
          .from(TABLES.GROUPS)
          .select('destination_id, destinations:destination_id(id, name, description)')
          .eq('id', groupId)
          .single();
        
        if (groupError) throw groupError;
        
        if (groupData?.destinations) {
          setDestination(groupData.destinations as unknown as Destination);
        }
        
        // Fetch ideas for this plan
        const { data, error: ideasError } = await supabase
          .from(TABLES.GROUP_IDEAS)
          .select('*')
          .eq('group_id', groupId)
          .eq('plan_id', planId)
          .order('created_at', { ascending: false });
        
        if (ideasError) throw ideasError;
        
        setIdeas(data || []);
        setFilteredIdeas(data || []);
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
  const addIdea = useCallback(async (idea: Idea) => {
    try {
      const supabase = getBrowserClient();
      
      const newIdea = {
        group_id: groupId,
        plan_id: planId,
        title: idea.title,
        description: idea.description,
        position: idea.position || { x: 0, y: 0 },
        tags: idea.tags || [],
        metadata: idea.metadata || {}
      };
      
      const { data, error } = await supabase
        .from(TABLES.GROUP_IDEAS)
        .insert(newIdea)
        .select()
        .single();
      
      if (error) throw error;
      
      setIdeas(prev => [data, ...prev]);
      setFilteredIdeas(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error adding idea:', err);
      setError(err instanceof Error ? err : new Error('Failed to add idea'));
      return null;
    }
  }, [groupId, planId]);
  
  // Update an existing idea
  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    try {
      const supabase = getBrowserClient();
      
      const { data, error } = await supabase
        .from(TABLES.GROUP_IDEAS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, ...updates } : idea));
      setFilteredIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, ...updates } : idea));
      
      return data;
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
      
      const { error } = await supabase
        .from(TABLES.GROUP_IDEAS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      setFilteredIdeas(prev => prev.filter(idea => idea.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting idea:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete idea'));
      return false;
    }
  }, []);
  
  // Search ideas
  const searchIdeas = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredIdeas(ideas);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = ideas.filter(idea => {
      return (
        idea.title?.toLowerCase().includes(lowerQuery) ||
        idea.description?.toLowerCase().includes(lowerQuery) ||
        idea.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
    
    setFilteredIdeas(results);
  }, [ideas]);
  
  // Filter ideas by tags
  const filterIdeas = useCallback((tags: string[]) => {
    if (!tags.length) {
      setFilteredIdeas(ideas);
      return;
    }
    
    const results = ideas.filter(idea => {
      return tags.some(tag => idea.tags?.includes(tag));
    });
    
    setFilteredIdeas(results);
  }, [ideas]);
  
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
    filterIdeas
  };
  
  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
}

export function useWhiteboardContext() {
  const context = useContext(WhiteboardContext);
  
  if (context === undefined) {
    throw new Error('useWhiteboardContext must be used within a WhiteboardProvider');
  }
  
  return context;
} 