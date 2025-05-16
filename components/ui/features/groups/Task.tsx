'use client';

/**
 * Task
 *
 * @deprecated Please use the new component at @/components/ui/features/tasks/organisms/Task instead.
 * This component will be removed in a future release.
 * 
 * A task component that displays a list of task items with voting, assigning, and status management capabilities.
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
import { ENUMS } from '@/utils/constants/database';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Use the item statuses from database enums
type ItemStatus = 'suggested' | 'confirmed' | 'rejected';
// Extended status type that includes UI-specific statuses
type ExtendedItemStatus = ItemStatus | 'active' | 'cancelled';

interface ProfileBasic {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface TaskVotes {
  up: number;
  down: number;
  upVoters: ProfileBasic[];
  downVoters: ProfileBasic[];
  userVote: 'up' | 'down' | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: ExtendedItemStatus;
  dueDate?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
  votes: TaskVotes;
  assignee?: ProfileBasic | null;
  tags?: string[];
}

interface TaskProps {
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
      toast({
        title: 'Task Deleted',
        description: 'The task has been removed.',
      });
    } catch (error) {
      // Revert to original state on error
      setItems(originalItems);
      toast({
        title: 'Error Deleting Task',
        description: error instanceof Error ? error.message : 'Could not delete task.',
        variant: 'destructive',
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const getStatusBadge = (status: ExtendedItemStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge
            variant="secondary"
            className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case 'suggested':
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" /> Suggested
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="ml-2">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    if (!priority) return null;

    switch (priority) {
      case 'high':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400"
          >
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-amber-600/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          >
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No tasks added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="group hover:shadow-sm transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </CardTitle>
                {item.description && <CardDescription>{item.description}</CardDescription>}

                <div className="flex flex-wrap gap-2 mt-2">
                  {getStatusBadge(item.status)}
                  {getPriorityBadge(item.priority)}
                  {item.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="ml-2">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {item.assignee && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8">
                          {item.assignee.avatar_url && (
                            <AvatarImage
                              src={item.assignee.avatar_url}
                              alt={item.assignee.name || 'Assignee'}
                            />
                          )}
                          <AvatarFallback>
                            {getInitials(item.assignee.name || 'User')}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assigned to: {item.assignee.name || item.assignee.username || 'User'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {updatingStatusItemId === item.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>•••</span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, 'confirmed')}
                        disabled={updatingStatusItemId === item.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Mark as confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, 'suggested')}
                        disabled={updatingStatusItemId === item.id}
                      >
                        <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                        Mark as suggested
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, 'rejected')}
                        disabled={updatingStatusItemId === item.id}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Mark as rejected
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, 'active')}
                        disabled={updatingStatusItemId === item.id}
                      >
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        Mark as active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, 'cancelled')}
                        disabled={updatingStatusItemId === item.id}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Mark as cancelled
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {canEdit && onItemDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingItemId === item.id}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingItemId === item.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1 gap-1"
                        onClick={() => handleVote(item.id, 'up')}
                        disabled={votingItemId === item.id}
                      >
                        <ThumbsUp
                          className={cn(
                            'h-4 w-4',
                            item.votes.userVote === 'up' && 'text-green-500 fill-green-500'
                          )}
                        />
                        <span className="font-medium">{item.votes.up}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {item.votes.upVoters.length > 0 ? (
                        <div>
                          <p className="font-semibold mb-1">Upvoted by:</p>
                          <ul className="text-xs">
                            {item.votes.upVoters.slice(0, 5).map((voter, i) => (
                              <li key={i}>{voter.name || voter.username || 'Anonymous'}</li>
                            ))}
                            {item.votes.upVoters.length > 5 && (
                              <li>+{item.votes.upVoters.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p>No upvotes yet</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1 gap-1"
                        onClick={() => handleVote(item.id, 'down')}
                        disabled={votingItemId === item.id}
                      >
                        <ThumbsDown
                          className={cn(
                            'h-4 w-4',
                            item.votes.userVote === 'down' && 'text-red-500 fill-red-500'
                          )}
                        />
                        <span className="font-medium">{item.votes.down}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {item.votes.downVoters.length > 0 ? (
                        <div>
                          <p className="font-semibold mb-1">Downvoted by:</p>
                          <ul className="text-xs">
                            {item.votes.downVoters.slice(0, 5).map((voter, i) => (
                              <li key={i}>{voter.name || voter.username || 'Anonymous'}</li>
                            ))}
                            {item.votes.downVoters.length > 5 && (
                              <li>+{item.votes.downVoters.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p>No downvotes yet</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {item.dueDate && (
                <Badge variant="outline" className="text-xs font-normal bg-secondary/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(item.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
