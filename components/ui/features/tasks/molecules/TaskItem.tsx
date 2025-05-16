'use client';

/**
 * TaskItem
 * 
 * A single task item component with status indicator, voting controls, and assignment.
 * 
 * @module ui/features/tasks/molecules/TaskItem
 */

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TaskItem as TaskItemType, ExtendedItemStatus } from '../types';

export interface TaskItemProps {
  /**
   * Task data to display
   */
  task: TaskItemType;
  /**
   * Whether the task is currently being voted on
   */
  isVoting?: boolean;
  /**
   * Whether the task status is being updated
   */
  isUpdatingStatus?: boolean;
  /**
   * Whether the task is being deleted
   */
  isDeleting?: boolean;
  /**
   * Callback when upvote button is clicked
   */
  onUpvote?: () => void;
  /**
   * Callback when downvote button is clicked
   */
  onDownvote?: () => void;
  /**
   * Callback when task status needs to be updated
   */
  onStatusChange?: (status: ExtendedItemStatus) => void;
  /**
   * Callback when task is deleted
   */
  onDelete?: () => void;
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Get the initials from a name (first letter of first and last name)
 */
function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * A component to display a single task item
 */
export function TaskItem({
  task,
  isVoting = false,
  isUpdatingStatus = false,
  isDeleting = false,
  onUpvote,
  onDownvote,
  onStatusChange,
  onDelete,
  className,
}: TaskItemProps) {
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
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {task.description && <CardDescription>{task.description}</CardDescription>}
          </div>
          {onStatusChange && getStatusBadge(task.status)}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            {task.priority && getPriorityBadge(task.priority)}
            
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Due date */}
            {task.dueDate && (
              <Badge variant="outline" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
          
          {/* Assignee */}
          {task.assignee && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground mr-2">Assigned to:</p>
                    <Avatar className="h-8 w-8">
                      {task.assignee.avatar_url ? (
                        <AvatarImage src={task.assignee.avatar_url} alt={task.assignee.name || ''} />
                      ) : null}
                      <AvatarFallback>{getInitials(task.assignee.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.assignee.name || task.assignee.username || 'Unknown user'}</p>
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
                  task.votes.userVote === 'up' && "text-green-600 dark:text-green-400"
                )}
                onClick={onUpvote}
                disabled={isVoting || !onUpvote}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{task.votes.up}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={cn(
                  "gap-1",
                  task.votes.userVote === 'down' && "text-red-600 dark:text-red-400"
                )}
                onClick={onDownvote}
                disabled={isVoting || !onDownvote}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{task.votes.down}</span>
              </Button>
            </div>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <XCircle className="h-4 w-4" />
              <span className="ml-1">Remove</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 