'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { GroupIdeaWithCreator, GroupIdeaWithVotes } from '@/types/group-ideas';
import IdeaCard from './idea-card';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES, ENUMS } from '@/utils/constants/database';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddIdeaModal } from './add-idea-modal';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { clientGuestUtils } from '@/utils/guest';
import { IdeaPosition } from './store/idea-store';

// Make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

interface IdeaBoardProps {
  groupId: string;
  initialIdeas: GroupIdeaWithCreator[];
  isAuthenticated: boolean;
}

export function IdeaBoard({ groupId, initialIdeas = [], isAuthenticated }: IdeaBoardProps) {
  const router = useRouter();
  const supabase = getBrowserClient();
  
  // Setup state
  const [ideas, setIdeas] = useState<GroupIdeaWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layouts, setLayouts] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Load ideas from the API
  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/groups/${groupId}/ideas`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ideas: ${response.statusText}`);
      }
      
      const data = (await response.json()) as { ideas: GroupIdeaWithVotes[] };
      setIdeas(((data.ideas || []) as GroupIdeaWithVotes[]).map(idea => ({ ...idea, created_by: idea.created_by ?? null })));
    } catch (err) {
      console.error('Error loading ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  
  // Subscribe to realtime updates from Supabase
  useEffect(() => {
    if (!supabase) return;
    
    // Subscribe to idea changes in this group
    const channel = supabase
      .channel(`group_ideas_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.GROUP_IDEAS,
          filter: `group_id=eq.${groupId}`
        },
        () => {
          // Reload ideas when there's a change
          loadIdeas();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, groupId, loadIdeas]);
  
  // Initial load
  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);
  
  // Initialize layouts from saved positions
  useEffect(() => {
    const initialLayouts = {
      lg: ideas.map(idea => ({
        i: idea.id,
        x: idea.position?.x || 0,
        y: idea.position?.y || 0,
        w: idea.position?.w || 3,
        h: idea.position?.h || 2,
        minW: 2,
        minH: 2
      }))
    };
    
    setLayouts(initialLayouts);
  }, [ideas]);
  
  // Handle layout changes
  const handleLayoutChange = useCallback(
    (currentLayout: any, allLayouts: any) => {
      setLayouts(allLayouts);
      
      // Create a batch of position updates
      const positions = currentLayout.map((item: any) => ({
        id: item.i,
        position: {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      }));
      
      // Debounce the API call to prevent too many requests
      const debouncedUpdate = setTimeout(async () => {
        try {
          await fetch(`/api/groups/${groupId}/ideas`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ positions })
          });
        } catch (err) {
          console.error('Error updating positions:', err);
        }
      }, 1000);
      
      return () => clearTimeout(debouncedUpdate);
    },
    [groupId]
  );
  
  // Handle idea creation
  const handleCreateIdea = useCallback(
    async (ideaData: any) => {
      try {
        const response = await fetch(`/api/groups/${groupId}/ideas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ideaData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create idea: ${response.statusText}`);
        }
        
        // Reload ideas to get the new one
        loadIdeas();
        
        // Close the modal
        setAddModalOpen(false);
      } catch (err) {
        console.error('Error creating idea:', err);
        setError(err instanceof Error ? err.message : 'Failed to create idea');
      }
    },
    [groupId, loadIdeas]
  );
  
  // Handle voting
  const handleVote = useCallback(
    async (ideaId: string, voteType: 'up' | 'down', shouldRemove = false) => {
      try {
        // First check if this client is a guest and doesn't have a token yet
        if (!isAuthenticated) {
          const guestToken = clientGuestUtils.getToken();
          
          if (!guestToken) {
            // Create a guest token client-side
            const response = await fetch('/api/guest/token', { method: 'POST' });
            const data = await response.json();
            
            if (data.token) {
              clientGuestUtils.setToken(data.token);
            }
          }
        }
        
        // Send the vote
        const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vote_type: voteType,
            remove: shouldRemove
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to vote: ${response.statusText}`);
        }
        
        // No need to reload as real-time updates should handle it
        // but we can optimistically update the UI here if needed
      } catch (err) {
        console.error('Error voting:', err);
        setError(err instanceof Error ? err.message : 'Failed to vote');
      }
    },
    [groupId, loadIdeas, isAuthenticated]
  );
  
  // Handle remove vote
  const handleRemoveVote = useCallback(
    async (ideaId: string) => {
      try {
        const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to remove vote: ${response.statusText}`);
        }
        
        // No need to reload as real-time updates should handle it
      } catch (err) {
        console.error('Error removing vote:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove vote');
      }
    },
    [groupId]
  );
  
  // If loading or error, show appropriate UI
  if (loading) {
    return <div className="p-4 text-center">Loading idea board...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <div>Error: {error}</div>
        <Button onClick={loadIdeas} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      className="idea-board-container relative min-h-[600px] border rounded-lg p-4 md:gap-6 lg:gap-8"
    >
      {/* Responsive Grid Layout for idea cards */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        containerPadding={[24, 24]}
        margin={[24, 24]}
      >
        {ideas.map(idea => {
          // Type guard for IdeaPosition
          const isValidIdeaPosition = (pos: any): pos is IdeaPosition => pos && typeof pos.columnId === 'string' && typeof pos.index === 'number';
          const position: IdeaPosition = isValidIdeaPosition(idea.position) ? idea.position : { columnId: 'destination', index: 0 };
          return (
            <div key={idea.id}>
              <IdeaCard
                idea={{ ...idea, created_by: idea.created_by ?? null, position: isValidIdeaPosition(idea.position) ? idea.position : { columnId: 'destination', index: 0 } }}
                position={position}
                onDelete={() => {}}
                onEdit={() => {}}
                onPositionChange={() => {}}
                userId={idea.created_by || 'unknown'}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
      
      {/* Add idea button */}
      <div className="fixed bottom-4 right-4">
        <Button 
          onClick={() => setAddModalOpen(true)}
          className="rounded-full w-12 h-12 p-0"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Add idea modal */}
      {addModalOpen && (
        <AddIdeaModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreateIdea}
        />
      )}
    </div>
  );
} 