'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Clock, CalendarIcon, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  createdAt: Date;
}

interface TodoListProps {
  /**
   * Initial todo items to display
   */
  initialItems?: TodoItem[];
  /**
   * Whether the user can add, edit, or remove items
   * @default true
   */
  canEdit?: boolean;
  /**
   * Optional title for the todo list
   */
  title?: string;
  /**
   * Callback when an item is toggled
   */
  onToggle?: (id: string, completed: boolean) => Promise<void>;
  /**
   * Callback when an item is deleted
   */
  onDelete?: (id: string) => Promise<void>;
  /**
   * Callback when a new item is added
   */
  onAdd?: (text: string, priority?: string, dueDate?: Date, category?: string) => Promise<void>;
  /**
   * Available categories for todos
   */
  categories?: string[];
}

export function TodoList({
  initialItems = [],
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
  categories = ['Personal', 'Work', 'Travel', 'Shopping', 'Other'],
}: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>(() => {
    // Initialize with the correct structure if initialItems are missing some fields
    return initialItems.map(item => ({
      ...item,
      priority: item.priority || 'medium',
      createdAt: item.createdAt || new Date(),
    }));
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemDueDate, setNewItemDueDate] = useState<Date | undefined>(undefined);
  const [newItemCategory, setNewItemCategory] = useState<string>('Other');
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority');

  // Sort and filter items
  const filteredItems = items
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'medium'] || 1) - (priorityOrder[b.priority || 'medium'] || 1);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else {
        return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
      }
    });

  const handleToggle = async (id: string) => {
    if (processingId) return;
    
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    
    setProcessingId(id);
    const originalItems = [...items];
    const newCompleted = !items[itemIndex].completed;
    
    // Optimistically update the UI
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: newCompleted } : item
    ));
    
    try {
      // Call the callback if provided
      if (onToggle) {
        await onToggle(id, newCompleted);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Revert on error
      setItems(originalItems);
      console.error('Failed to toggle item:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (processingId) return;
    
    setProcessingId(id);
    const originalItems = [...items];
    
    // Optimistically update the UI
    setItems(items.filter(item => item.id !== id));
    
    try {
      // Call the callback if provided
      if (onDelete) {
        await onDelete(id);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Revert on error
      setItems(originalItems);
      console.error('Failed to delete item:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleAddItem = async () => {
    if (!newItemText.trim() || isAdding) return;
    
    setIsAdding(true);
    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      priority: newItemPriority,
      dueDate: newItemDueDate,
      category: newItemCategory,
      createdAt: new Date(),
    };
    
    // Optimistically update the UI
    setItems([...items, newItem]);
    
    // Reset form
    setNewItemText('');
    setNewItemPriority('medium');
    setNewItemDueDate(undefined);
    setNewItemCategory('Other');
    
    try {
      // Call the callback if provided
      if (onAdd) {
        await onAdd(newItem.text, newItem.priority, newItem.dueDate, newItem.category);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Remove the item on error
      setItems(items);
      console.error('Failed to add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-orange-500 bg-orange-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Work':
        return 'bg-blue-100 text-blue-800';
      case 'Personal':
        return 'bg-purple-100 text-purple-800';
      case 'Travel':
        return 'bg-green-100 text-green-800';
      case 'Shopping':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No items found.</p>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-md",
                item.completed ? "bg-muted/40" : "hover:bg-accent/5",
                processingId === item.id && "opacity-70"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  disabled={processingId === item.id || !canEdit}
                  className={item.completed ? "opacity-70" : ""}
                />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "transition-all",
                      item.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  <div className="flex gap-2 mt-1 items-center">
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority || 'medium'}
                    </Badge>
                    
                    {item.category && (
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    )}
                    
                    {item.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(item.dueDate, 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {canEdit && (
                <Button
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
