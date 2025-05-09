'use client';
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
import { ITEM_STATUSES, type ItemStatus } from '@/utils/constants/status';

import React, { useState } from 'react';

// Redefine ItemStatus to include additional values
type ExtendedItemStatus = ItemStatus | 'active' | 'cancelled';

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
  status: ExtendedItemStatus;
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
  /**
   * Initial todo items to display
   */
  initialItems: TodoItem[];
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
  onStatusChange?: (itemId: string, newStatus: ExtendedItemStatus) => Promise<void>;
  /**
   * Callback when a vote is cast
   */
  onVote?: (itemId: string, voteType: 'up' | 'down') => Promise<void>;
}

export function Todo({ initialItems, canEdit = false, onItemDelete }: TodoProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    const originalItems = [...items];
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const currentVote = items[itemIndex].votes.userVote;
    const newItems = [...items];
    const newVotes = { ...items[itemIndex].votes };

    // Handle voting logic
    if (!currentVote) {
      if (voteType === 'up') {
        newVotes.up += 1;
      } else {
        newVotes.down += 1;
      }
      newVotes.userVote = voteType;
    } else if (currentVote !== voteType) {
      if (voteType === 'up') {
        newVotes.up += 1;
        newVotes.down -= 1;
      } else {
        newVotes.up -= 1;
        newVotes.down += 1;
      }
      newVotes.userVote = voteType;
    } else {
      if (voteType === 'up') {
        newVotes.up -= 1;
      } else {
        newVotes.down -= 1;
      }
      newVotes.userVote = null;
    }

    newItems[itemIndex] = { ...items[itemIndex], votes: newVotes };
    setItems(newItems);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      setItems(originalItems);
      toast({
        title: 'Error Voting',
        description: error instanceof Error ? error.message : 'Could not record vote.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: ExtendedItemStatus) => {
    setUpdatingStatusItemId(itemId);
    const originalItems = [...items];

    setItems(items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({ title: 'Status Updated', description: `Todo status set to ${newStatus}.` });
    } catch (error) {
      setItems(originalItems);
      toast({
        title: 'Error Updating Status',
        description: error instanceof Error ? error.message : 'Could not update todo status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatusItemId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!onItemDelete) return;

    setDeletingItemId(itemId);
    const originalItems = [...items];

    setItems(items.filter((item) => item.id !== itemId));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      onItemDelete(itemId);
      toast({ title: 'Todo Deleted', description: 'The todo item has been removed.' });
    } catch (error) {
      setItems(originalItems);
      toast({
        title: 'Error Deleting Item',
        description: error instanceof Error ? error.message : 'Could not delete todo item.',
        variant: 'destructive',
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const getStatusBadge = (status: ExtendedItemStatus) => {
    switch (status) {
      case ITEM_STATUSES.CONFIRMED:
        return (
          <Badge 
            variant="secondary"
            className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case ITEM_STATUSES.REJECTED:
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case ITEM_STATUSES.SUGGESTED:
        return (
          <Badge
            variant="outline"
            className="ml-2 border-yellow-600/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          >
            <AlertCircle className="h-3 w-3 mr-1" /> Suggested
          </Badge>
        );
      case 'active':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            <Clock className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant="outline"
            className="ml-2 border-gray-600/40 bg-gray-500/10 text-gray-700 dark:text-gray-400"
          >
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No todo items added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{item.title}</CardTitle>
                {item.description && <CardDescription>{item.description}</CardDescription>}
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(item.status)}

                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {updatingStatusItemId === item.id ? (
                          <span className="h-4 w-4 animate-spin">
                            <Clock className="h-4 w-4" />
                          </span>
                        ) : (
                          <span>•••</span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, ITEM_STATUSES.CONFIRMED)}
                      >
                        Mark as confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(item.id, ITEM_STATUSES.REJECTED)}
                      >
                        Mark as rejected
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
                  >
                    {deletingItemId === item.id ? (
                      <span className="h-4 w-4 animate-spin">
                        <Clock className="h-4 w-4" />
                      </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => handleVote(item.id, 'up')}
                >
                  <ThumbsUp
                    className={cn(
                      'h-4 w-4',
                      item.votes.userVote === 'up' && 'text-green-500 fill-green-500'
                    )}
                  />
                  <span>{item.votes.up}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => handleVote(item.id, 'down')}
                >
                  <ThumbsDown
                    className={cn(
                      'h-4 w-4',
                      item.votes.userVote === 'down' && 'text-red-500 fill-red-500'
                    )}
                  />
                  <span>{item.votes.down}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
