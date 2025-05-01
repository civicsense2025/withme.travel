'use client';

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
import { ItemStatus } from '@/types/common';

type ProfileBasic = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
};

// Helper to get initials for avatar fallback
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  dueDate?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
  votes: {
    up: number;
    down: number;
    upVoters: ProfileBasic[];
    downVoters: ProfileBasic[];
    userVote: 'up' | 'down' | null;
  };
}

interface TodoProps {
  initialItems: TodoItem[];
  canEdit?: boolean;
  onItemDelete?: (itemId: string) => void;
}

export function Todo({ initialItems, canEdit, onItemDelete }: TodoProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [expandedVoteItemId, setExpandedVoteItemId] = useState<string | null>(null);
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    const originalItems = [...items];

    // Find current user vote (if any)
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const currentVote = item.votes.userVote;

    // Optimistic UI update
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) return item;

        // Creating a deep copy of the votes to modify
        const newVotes = { ...item.votes };

        // Case 1: User has not voted yet
        if (!currentVote) {
          if (voteType === 'up') {
            newVotes.up += 1;
            // Add user to upVoters (would need actual user info)
          } else {
            newVotes.down += 1;
            // Add user to downVoters (would need actual user info)
          }
        }
        // Case 2: User is changing their vote
        else if (currentVote !== voteType) {
          if (voteType === 'up') {
            newVotes.up += 1;
            newVotes.down -= 1;
            // Move user from downVoters to upVoters
          } else {
            newVotes.up -= 1;
            newVotes.down += 1;
            // Move user from upVoters to downVoters
          }
        }
        // Case 3: User is removing their vote (clicking same button)
        else if (currentVote === voteType) {
          if (voteType === 'up') {
            newVotes.up -= 1;
            // Remove user from upVoters
          } else {
            newVotes.down -= 1;
            // Remove user from downVoters
          }

          newVotes.userVote = null;
          return { ...item, votes: newVotes };
        }

        // Update userVote with new state for other cases
        newVotes.userVote = voteType;

        return { ...item, votes: newVotes };
      })
    );

    // In a real implementation, you would call your API here
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Success case would be handled here
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setItems(originalItems);
      toast({
        title: 'Error Voting',
        description: error instanceof Error ? error.message : 'Could not record vote.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingStatusItemId(itemId); // Indicate loading state for this item
    const originalItems = [...items];

    // Optimistic UI Update
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );

    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({ title: 'Status Updated', description: `Todo status set to ${newStatus}.` });
      // Optimistic update was successful
    } catch (error) {
      console.error('Error updating status:', error);
      setItems(originalItems); // Revert optimistic update on error
      toast({
        title: 'Error Updating Status',
        description: error instanceof Error ? error.message : 'Could not update todo status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatusItemId(null); // Clear loading state regardless of outcome
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!onItemDelete) return;

    setDeletingItemId(itemId); // Set loading state
    const originalItems = [...items];

    // Optimistic UI update
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));

    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Call the parent's onItemDelete function after successful deletion
      onItemDelete(itemId);
      toast({ title: 'Todo Deleted', description: 'The todo item has been removed.' });
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert optimistic update on error
      setItems(originalItems);
      toast({
        title: 'Error Deleting Item',
        description: error instanceof Error ? error.message : 'Could not delete todo item.',
        variant: 'destructive',
      });
    } finally {
      setDeletingItemId(null); // Clear loading state
    }
  };

  const renderVoters = (voters: ProfileBasic[]) => {
    // Only render if expanded
    if (!voters || voters.length === 0) return null;
    return (
      <div className="flex -space-x-2 overflow-hidden ml-1">
        {voters.slice(0, 5).map((voter) => (
          <Avatar
            key={voter.id}
            className="inline-block h-5 w-5 rounded-full ring-1 ring-white"
            title={voter.name || voter.username || 'User'}
          >
            <AvatarImage
              src={voter.avatar_url || undefined}
              alt={voter.name || voter.username || 'User'}
            />
            <AvatarFallback className="text-[8px]">
              {getInitials(voter.name || voter.username || 'U')}
            </AvatarFallback>
          </Avatar>
        ))}
        {voters.length > 5 && (
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium ring-1 ring-white">
            +{voters.length - 5}
          </div>
        )}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No todo items added yet.</p>;
  }

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge
            variant="secondary"
            className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'suggested':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            <AlertCircle className="h-3 w-3 mr-1" /> Suggested
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low' | null | undefined) => {
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
            className="ml-2 border-orange-600/40 bg-orange-500/10 text-orange-700 dark:text-orange-400"
          >
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isExpanded = expandedVoteItemId === item.id;
        return (
          <Card key={item.id} className={cn(item.status === 'rejected' && 'opacity-60')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center flex-wrap">
                    {item.title}
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                    {item.dueDate && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Due: {item.dueDate}
                      </div>
                    )}
                  </CardDescription>
                </div>
                {canEdit && onItemDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingItemId === item.id}
                  >
                    {deletingItemId === item.id ? (
                      <LoaderCircle size="sm" className="mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center">
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'flex items-center space-x-1 cursor-pointer select-none',
                        isExpanded && 'bg-muted rounded-md px-2 py-1'
                      )}
                      onClick={() => setExpandedVoteItemId(isExpanded ? null : item.id)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-8 rounded-full px-2',
                          item.votes.userVote === 'up' &&
                            'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(item.id, 'up');
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{item.votes.up}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-8 rounded-full px-2',
                          item.votes.userVote === 'down' &&
                            'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(item.id, 'down');
                        }}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        <span>{item.votes.down}</span>
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="flex items-center space-x-2">
                        {item.votes.upVoters.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3 text-green-500" />
                            {renderVoters(item.votes.upVoters)}
                          </div>
                        )}

                        {item.votes.downVoters.length > 0 && (
                          <div className="flex items-center space-x-1 ml-2">
                            <ThumbsDown className="h-3 w-3 text-red-500" />
                            {renderVoters(item.votes.downVoters)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {canEdit && item.status === 'pending' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingStatusItemId === item.id}
                      >
                        {updatingStatusItemId === item.id ? (
                          <>
                            <LoaderCircle size="sm" />
                            Updating...
                          </>
                        ) : (
                          'Update status'
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'approved')}>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <span>Mark as approved</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'rejected')}>
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>Mark as rejected</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
