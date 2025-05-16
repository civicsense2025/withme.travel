'use client';

/**
 * Task
 *
 * A task component that displays a list of task items with voting, assigning, and status management capabilities.
 *
 * @module ui/features/tasks/organisms/Task
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle } from '@/components/ui/loader-circle';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TaskItem, ItemStatus, ExtendedItemStatus, ProfileBasic } from '../types';

export interface TaskProps {
  /**
   * Initial task items to display
   */
  initialItems: TaskItem[];
  /**
   * Whether the user can edit items (update status, delete)
   * @default false
   */
  canEdit?: boolean;
  /**
   * Callback when an item is deleted
   */
  onItemDelete?: (itemId: string) => Promise<void>;
  /**
   * Callback when an item status is changed
   */
  onStatusChange?: (itemId: string, status: ItemStatus) => Promise<void>;
  /**
   * Callback when a vote is cast
   */
  onVote?: (itemId: string, voteType: 'up' | 'down') => Promise<void>;
  /**
   * Callback when assignee is changed
   */
  onAssign?: (itemId: string, userId: string | null) => Promise<void>;
}

/**
 * Get the initials from a name (first letter of first and last name)
 * @param name Name to extract initials from
 * @returns 1-2 character string of initials
 */
function getInitials(name?: string | null): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Get first letter of first name and first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * A component for displaying and managing task items with voting and status controls
 */
export function Task({
  initialItems,
  canEdit = false,
  onItemDelete,
  onStatusChange,
  onVote,
  onAssign,
}: TaskProps) {
  const [items, setItems] = useState<TaskItem[]>(initialItems);
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [votingItemId, setVotingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    if (votingItemId) return; // Prevent multiple votes at once

    setVotingItemId(itemId);
    const originalItems = [...items];
    const itemIndex = items.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      setVotingItemId(null);
      return;
    }

    const currentVote = items[itemIndex].votes.userVote;
    const newItems = [...items];
    const newVotes = { ...items[itemIndex].votes };

    // Handle voting logic
    if (!currentVote) {
      // New vote
      if (voteType === 'up') {
        newVotes.up += 1;
        newVotes.upVoters = [
          ...newVotes.upVoters,
          { id: 'current-user', name: 'You', avatar_url: null, username: null },
        ];
      } else {
        newVotes.down += 1;
        newVotes.downVoters = [
          ...newVotes.downVoters,
          { id: 'current-user', name: 'You', avatar_url: null, username: null },
        ];
      }
      newVotes.userVote = voteType;
    } else if (currentVote !== voteType) {
      // Change vote
      if (voteType === 'up') {
        newVotes.up += 1;
        newVotes.down -= 1;
        newVotes.upVoters = [
          ...newVotes.upVoters,
          { id: 'current-user', name: 'You', avatar_url: null, username: null },
        ];
        newVotes.downVoters = newVotes.downVoters.filter((voter) => voter.id !== 'current-user');
      } else {
        newVotes.up -= 1;
        newVotes.down += 1;
        newVotes.downVoters = [
          ...newVotes.downVoters,
          { id: 'current-user', name: 'You', avatar_url: null, username: null },
        ];
        newVotes.upVoters = newVotes.upVoters.filter((voter) => voter.id !== 'current-user');
      }
      newVotes.userVote = voteType;
    } else {
      // Remove vote
      if (voteType === 'up') {
        newVotes.up -= 1;
        newVotes.upVoters = newVotes.upVoters.filter((voter) => voter.id !== 'current-user');
      } else {
        newVotes.down -= 1;
        newVotes.downVoters = newVotes.downVoters.filter((voter) => voter.id !== 'current-user');
      }
      newVotes.userVote = null;
    }

    newItems[itemIndex] = { ...items[itemIndex], votes: newVotes };
    setItems(newItems);

    try {
      if (onVote) {
        await onVote(itemId, voteType);
      } else {
        // Simulate API call if no callback provided
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      setItems(originalItems);
      toast({
        title: 'Error Voting',
        description: error instanceof Error ? error.message : 'Could not record vote.',
        variant: 'destructive',
      });
    } finally {
      setVotingItemId(null);
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: ExtendedItemStatus) => {
    if (updatingStatusItemId || !onStatusChange) return;

    setUpdatingStatusItemId(itemId);

    try {
      // Map UI statuses to valid database enum values if needed
      let statusForApi: ItemStatus;

      if (newStatus === 'active') {
        statusForApi = 'suggested'; // Map 'active' to 'suggested'
      } else if (newStatus === 'cancelled') {
        statusForApi = 'rejected'; // Map 'cancelled' to 'rejected'
      } else {
        statusForApi = newStatus; // Already a valid database status
      }

      // Call the API with valid database status
      await onStatusChange(itemId, statusForApi);

      // Update local state with the UI status for immediate feedback
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatusItemId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!onItemDelete || deletingItemId) return;

    setDeletingItemId(itemId);
    const originalItems = [...items];

    // Optimistically update the UI
    setItems(items.filter((item) => item.id !== itemId));

    try {
      await onItemDelete(itemId);
    } catch (error) {
      // Restore items on error
      setItems(originalItems);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const getStatusBadge = (status: ExtendedItemStatus) => {
    switch (status) {
      case 'suggested':
      case 'active':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            High Priority
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Medium Priority
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Low Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No tasks available</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {item.description && <CardDescription>{item.description}</CardDescription>}
                  </div>
                  
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updatingStatusItemId === item.id}
                        >
                          {getStatusBadge(item.status)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(item.id, 'active')}
                          disabled={item.status === 'active'}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(item.id, 'confirmed')}
                          disabled={item.status === 'confirmed'}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(item.id, 'cancelled')}
                          disabled={item.status === 'cancelled' || item.status === 'rejected'}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Priority badge */}
                    {item.priority && getPriorityBadge(item.priority)}
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Due date */}
                    {item.dueDate && (
                      <Badge variant="outline" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Assignee */}
                  {item.assignee && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground mr-2">Assigned to:</p>
                            <Avatar className="h-8 w-8">
                              {item.assignee.avatar_url ? (
                                <AvatarImage src={item.assignee.avatar_url} alt={item.assignee.name || ''} />
                              ) : null}
                              <AvatarFallback>{getInitials(item.assignee.name)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.assignee.name || item.assignee.username || 'Unknown user'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-1",
                          item.votes.userVote === 'up' && "text-green-600 dark:text-green-400"
                        )}
                        onClick={() => handleVote(item.id, 'up')}
                        disabled={votingItemId === item.id}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{item.votes.up}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm" 
                        className={cn(
                          "gap-1",
                          item.votes.userVote === 'down' && "text-red-600 dark:text-red-400"
                        )}
                        onClick={() => handleVote(item.id, 'down')}
                        disabled={votingItemId === item.id}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{item.votes.down}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingItemId === item.id}
                    >
                      {deletingItemId === item.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="ml-1">Delete</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 