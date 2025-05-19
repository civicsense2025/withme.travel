/**
 * GroupIdeasConnected Component (Organism)
 * 
 * A connected version of the GroupIdeas component that uses hooks
 * to manage group idea data from the API.
 *
 * @module groups/organisms
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGroupIdeas } from '@/lib/features/groups/hooks';
import { Button } from '@/components/ui/button';
import { GroupIdeaCard } from '../molecules/GroupIdeaCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { GroupIdea } from '@/types/group-ideas';

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
  const { ideas, loading, error, fetchIdeas, voteOnIdea, deleteIdea } = useGroupIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch ideas on mount
  useEffect(() => {
    if (groupId) {
      fetchIdeas(groupId).catch(err => {
        console.error('Error fetching ideas:', err);
      });
    }
  }, [groupId, fetchIdeas]);
  
  // Filtered ideas based on search
  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const handleVoteUp = useCallback(async (ideaId: string) => {
    try {
      const result = await voteOnIdea(groupId, ideaId, 'up');
      if (!result.success && result.error) {
        console.error('Error voting on idea:', result.error);
      }
    } catch (err) {
      console.error('Error voting on idea:', err);
    }
  }, [groupId, voteOnIdea]);
  
  const handleVoteDown = useCallback(async (ideaId: string) => {
    try {
      const result = await voteOnIdea(groupId, ideaId, 'down');
      if (!result.success && result.error) {
        console.error('Error voting on idea:', result.error);
      }
    } catch (err) {
      console.error('Error voting on idea:', err);
    }
  }, [groupId, voteOnIdea]);
  
  const handleDelete = useCallback(async (ideaId: string) => {
    try {
      const result = await deleteIdea(groupId, ideaId);
      if (!result.success && result.error) {
        console.error('Error deleting idea:', result.error);
      } else {
        // Refresh ideas after successful deletion
        fetchIdeas(groupId).catch(err => {
          console.error('Error refreshing ideas after deletion:', err);
        });
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
    }
  }, [groupId, deleteIdea, fetchIdeas]);

  // Error state
  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }
  
  // Loading state
  if (loading && ideas.length === 0) {
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
          {filteredIdeas.map((idea) => (
            <GroupIdeaCard
              key={idea.id}
              idea={{
                ...idea,
                comment_count: 0,
                position: idea.position || null,
                guest_token: idea.guest_token || null,
                selected: idea.selected || false
              }}
              onDelete={canEdit ? () => handleDelete(idea.id) : undefined}
              onEdit={canEdit ? () => console.log('Edit idea', idea.id) : undefined}
              userId={userId}
              isAuthenticated={isAuthenticated}
              groupId={groupId}
              showActions={canEdit}
              onVoteUp={() => handleVoteUp(idea.id)}
              onVoteDown={() => handleVoteDown(idea.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery ? 'No ideas match your search' : 'No ideas yet'}
        </div>
      )}
    </div>
  );
} 