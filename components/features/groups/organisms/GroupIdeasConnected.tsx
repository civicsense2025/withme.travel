/**
 * GroupIdeasConnected Component (Organism)
 * 
 * A connected version of the GroupIdeas component that uses hooks
 * to manage group idea data from the API.
 *
 * @module groups/organisms
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useGroupIdeas } from '@/lib/features/groups/hooks';
import { Button } from '@/components/ui/button';
import { GroupIdeaCard } from '../molecules/GroupIdeaCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
// Import from the client where the hook gets its type
import { GroupIdea as ClientGroupIdea } from '@/lib/client/groupPlans';
// Also import types from the types directory for the card component
import type { GroupIdea as TypesGroupIdea, IdeaType } from '@/types/group-ideas';

// Define the same ExtendedGroupIdea interface used in GroupIdeaCard
// Based on the types/group-ideas.ts definition
interface ExtendedGroupIdea extends TypesGroupIdea {
  comment_count?: number;
  link?: string | null; 
  start_date?: string | null;
  end_date?: string | null;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface GroupIdeasConnectedProps {
  /** ID of the group */
  groupId: string;
  /** Whether user can add/edit/delete ideas */
  canEdit?: boolean;
  /** Optional user ID */
  userId?: string;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Optional custom class names */
  className?: string;
  /** Callback when a new idea is added */
  onIdeaAdded?: (ideaId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupIdeasConnected({
  groupId,
  canEdit = false,
  userId = '',
  isAuthenticated = false,
  className,
  onIdeaAdded,
}: GroupIdeasConnectedProps) {
  // Use the hook with groupId parameter to automatically fetch data
  const { ideas: hookIdeas, loading, error, createIdea, voteOnIdea, deleteIdea, refetch } = useGroupIdeas(groupId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtered ideas based on search
  const filteredIdeas = hookIdeas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const handleVoteUp = useCallback(async (ideaId: string) => {
    try {
      const success = await voteOnIdea(ideaId, 'up');
    } catch (err) {
      console.error('Error voting on idea:', err);
    }
  }, [voteOnIdea]);
  
  const handleVoteDown = useCallback(async (ideaId: string) => {
    try {
      const success = await voteOnIdea(ideaId, 'down');
    } catch (err) {
      console.error('Error voting on idea:', err);
    }
  }, [voteOnIdea]);
  
  const handleDelete = useCallback(async (ideaId: string) => {
    try {
      const success = await deleteIdea(ideaId);
    } catch (err) {
      console.error('Error deleting idea:', err);
    }
  }, [deleteIdea]);

  // Error state
  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">
      {typeof error === 'string' ? error : 'Failed to load ideas'}
    </div>;
  }
  
  // Loading state
  if (loading && hookIdeas.length === 0) {
    return <div className="p-4 text-muted-foreground">Loading ideas...</div>;
  }

  return (
    <div className={className}>
      {/* Search input */}
      <div className="mb-4 relative">
        <Input
          placeholder="Search ideas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      
      {/* Ideas list */}
      {filteredIdeas.length > 0 ? (
        <div className="space-y-3">
          {filteredIdeas.map((clientIdea) => {
            // Convert from client GroupIdea to the TypesGroupIdea expected by the card
            const extendedIdea: ExtendedGroupIdea = {
              id: clientIdea.id,
              group_id: clientIdea.group_id,
              title: clientIdea.title,
              description: clientIdea.description || null,
              type: (clientIdea.type as IdeaType) || 'other',
              created_by: clientIdea.created_by,
              created_at: clientIdea.created_at,
              updated_at: clientIdea.updated_at,
              votes_up: clientIdea.votes_up || 0,
              votes_down: clientIdea.votes_down || 0,
              // Fields from ExtendedGroupIdea
              comment_count: 0,
              // Add the required fields from TypesGroupIdea
              guest_token: null,
              position: null,
              selected: false,
              meta: null,
              // Add the optional fields from ClientGroupIdea if they exist
              start_date: clientIdea.start_date || null,
              end_date: clientIdea.end_date || null,
            };
            
            return (
              <GroupIdeaCard
                key={clientIdea.id}
                idea={extendedIdea}
                onDelete={canEdit ? () => handleDelete(clientIdea.id) : undefined}
                onEdit={canEdit ? () => console.log('Edit idea', clientIdea.id) : undefined}
                userId={userId}
                isAuthenticated={isAuthenticated}
                groupId={groupId}
                showActions={canEdit}
                onVoteUp={() => handleVoteUp(clientIdea.id)}
                onVoteDown={() => handleVoteDown(clientIdea.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery ? 'No ideas match your search' : 'No ideas yet'}
        </div>
      )}
    </div>
  );
} 