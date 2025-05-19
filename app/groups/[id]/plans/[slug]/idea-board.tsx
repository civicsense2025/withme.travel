'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { GroupIdeaWithCreator, GroupIdeaWithVotes } from '@/types/group-ideas';
import {
  GroupIdea as LocalGroupIdea,
  ColumnId as LocalColumnId,
  IdeaPosition as LocalIdeaPosition,
} from './store/idea-store';
import IdeaCard from './idea-card';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ENUMS } from '@/utils/constants/database';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddIdeaModal } from './add-idea-modal';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import clientGuestUtils from '@/utils/guest';
import { IdeasBoardHelpDialog } from './components/ideas-board-help-dialog';
import { IdeasPresenceContext, useIdeasPresenceContext } from './context/ideas-presence-context';
import { API_ROUTES } from '@/utils/constants/routes';
import { } from '@/lib/features/votes/hooks/use-votes';
import { useGroupIdeas } from '@/lib/hooks/use-group-ideas';
import { useToast } from '@/lib/hooks/use-toast'

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
  const { toast } = useToast();

  // Use our hooks
  const { voteOnGroupIdea, isVoting, error: voteError } = useVotes();
  const {
    ideas: groupIdeasFromHook,
    loading: groupIdeasLoading,
    error: groupIdeasError,
    createIdea: createGroupIdea,
    refetch: refetchIdeas,
  } = useGroupIdeas(groupId);

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
      setIdeas(
        ((data.ideas || []) as GroupIdeaWithVotes[]).map((idea) => ({
          ...idea,
          created_by: idea.created_by ?? null,
        }))
      );
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
          table: 'group_ideas',
          filter: `group_id=eq.${groupId}`,
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
      lg: ideas.map((idea) => ({
        i: idea.id,
        x: idea.position?.x || 0,
        y: idea.position?.y || 0,
        w: idea.position?.w || 3,
        h: idea.position?.h || 2,
        minW: 2,
        minH: 2,
      })),
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
          h: item.h,
        },
      }));

      // Debounce the API call to prevent too many requests
      const debouncedUpdate = setTimeout(async () => {
        try {
          await fetch(`/api/groups/${groupId}/ideas`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ positions }),
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
        // Use our group ideas hook to create an idea instead of direct API call
        const newIdea = await createGroupIdea(ideaData);

        if (newIdea) {
          // Close the modal
          setAddModalOpen(false);
          toast({
            title: 'Success',
            description: 'Idea created successfully',
          });
        }
      } catch (err) {
        console.error('Error creating idea:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create idea',
          variant: 'destructive',
        });
      }
    },
    [groupId, createGroupIdea, toast]
  );

  // Handle voting using the useVotes hook
  const handleVote = useCallback(
    async (ideaId: string, voteType: 'UP' | 'DOWN') => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to vote on ideas',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Use the voting hook instead of direct API call
        const success = await voteOnGroupIdea(
          groupId,
          ideaId,
          voteType.toLowerCase() as 'up' | 'down'
        );

        if (success) {
          // Optimistically update the UI
          setIdeas((prevIdeas) =>
            prevIdeas.map((idea) => {
              if (idea.id === ideaId) {
                if (voteType === 'UP') {
                  return {
                    ...idea,
                    votes_up: (idea.votes_up || 0) + 1,
                  };
                } else {
                  return {
                    ...idea,
                    votes_down: (idea.votes_down || 0) + 1,
                  };
                }
              }
              return idea;
            })
          );
        } else if (voteError) {
          throw voteError;
        }
      } catch (err) {
        console.error('Error voting on idea:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to vote on idea',
          variant: 'destructive',
        });
        // Reload ideas to get the correct vote counts
        loadIdeas();
      }
    },
    [groupId, isAuthenticated, voteOnGroupIdea, voteError, loadIdeas, toast]
  );

  // Handle remove vote
  const handleRemoveVote = useCallback(
    async (ideaId: string) => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch(API_ROUTES.GROUP_PLAN_IDEA_VOTES.DELETE(groupId, ideaId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remove: true }),
        });

        if (!response.ok) {
          throw new Error(`Failed to remove vote: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error removing vote:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove vote');
      }
    },
    [groupId, isAuthenticated]
  );

  // Type guard for IdeaPosition
  const isValidIdeaPosition = (pos: any): pos is LocalIdeaPosition => {
    return (
      pos &&
      typeof pos === 'object' &&
      'columnId' in pos &&
      typeof pos.columnId === 'string' &&
      'index' in pos &&
      typeof pos.index === 'number'
    );
  };

  // Convert GroupIdeaWithVotes to LocalGroupIdea safely
  const convertToLocalGroupIdea = (idea: GroupIdeaWithVotes): LocalGroupIdea => {
    const position: LocalIdeaPosition = isValidIdeaPosition(idea.position)
      ? idea.position
      : { columnId: 'destination' as LocalColumnId, index: 0 };

    return {
      ...idea,
      created_by: idea.created_by ?? null,
      position,
      type: (idea.type || 'destination') as LocalColumnId,
    } as LocalGroupIdea;
  };

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
      <div className="idea-board-container relative min-h-[600px] border rounded-lg p-4 md:gap-6 lg:gap-8">
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
        {ideas.map((idea) => {
          const position: LocalIdeaPosition = isValidIdeaPosition(idea.position)
            ? idea.position
            : { columnId: 'destination' as LocalColumnId, index: 0 };
          return (
            <div key={idea.id}>
              <IdeaCard
                idea={{
                  ...(idea as any),
                  created_by: idea.created_by ?? null,
                  position,
                  type: (idea.type || 'destination') as LocalColumnId,
                }}
                position={position}
                onDelete={() => handleRemoveVote(idea.id)}
                onEdit={() => {}}
                onPositionChange={() => {}}
                userId={idea.created_by || 'unknown'}
                isAuthenticated={isAuthenticated}
                groupId={groupId}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Add idea button */}
      <div className="fixed bottom-4 right-4">
        <Button onClick={() => setAddModalOpen(true)} className="rounded-full w-12 h-12 p-0">
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add idea modal */}
      {addModalOpen && (
        <AddIdeaModal onClose={() => setAddModalOpen(false)} onSubmit={handleCreateIdea} />
      )}
    </div>
  );
}
