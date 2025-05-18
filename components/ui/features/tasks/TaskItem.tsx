/**
 * @deprecated This component is deprecated. Please use the TaskItem from the molecules directory instead.
 * Import as: import { TaskItem } from '@/components/ui/features/tasks/molecules/TaskItem';
 * Or via the molecules index: import { TaskItem } from '@/components/ui/features/tasks/molecules';
 * 
 * TaskItem component displays a single task with status, priority, and interactive elements
 */

'use client';

import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  User,
  Calendar,
  Clock,
  Tag as TagIcon,
  MoreHorizontal,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TagList } from '../tags/TagList';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TaskItemProps {
  /** Task ID */
  id: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Due date (ISO string) */
  dueDate?: string;
  /** Whether the task is completed */
  isCompleted?: boolean;
  /** Task priority (1-5, 5 being highest) */
  priority?: number;
  /** Assignee information */
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** Task tags */
  tags?: Array<{ id?: string; name: string }>;
  /** Handler for task completion toggle */
  onToggleComplete?: (taskId: string, isCompleted: boolean) => void;
  /** Handler for task assignment */
  onAssign?: (taskId: string, userId?: string) => void;
  /** Handler for task deletion */
  onDelete?: (taskId: string) => void;
  /** Handler for task tag removal */
  onRemoveTag?: (taskId: string, tagName: string) => void;
  /** Indicates whether certain actions are in progress */
  loading?: {
    completion?: boolean;
    assignment?: boolean;
    deletion?: boolean;
    tagRemoval?: Record<string, boolean>;
  };
  /** Handler for clicking the task */
  onClick?: (taskId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a single task with actions
 */
export function TaskItem({
  id,
  title,
  description,
  dueDate,
  isCompleted = false,
  priority = 3,
  assignee,
  tags = [],
  onToggleComplete,
  onAssign,
  onDelete,
  onRemoveTag,
  loading = {},
  onClick,
  className,
}: TaskItemProps) {
  // Format due date if present
  const formattedDueDate = dueDate
    ? format(new Date(dueDate), 'MMM d, yyyy')
    : null;
  
  // Determine if task is clickable
  const isClickable = !!onClick;
  
  // Determine priority display
  const priorityDisplay = {
    icon: priority >= 4 ? <ArrowUp className="h-4 w-4 text-destructive" /> : 
          priority <= 2 ? <ArrowDown className="h-4 w-4 text-muted-foreground" /> : null,
    text: priority >= 4 ? 'High' : 
          priority <= 2 ? 'Low' : 'Medium',
    color: priority >= 4 ? 'text-destructive' : 
           priority <= 2 ? 'text-muted-foreground' : 'text-primary'
  };

  return (
    <Card 
      className={cn(
        'transition-colors',
        isClickable && 'cursor-pointer hover:bg-muted/50',
        isCompleted && 'bg-muted/50',
        className
      )}
      onClick={isClickable ? () => onClick(id) : undefined}
    >
      <CardContent className="p-4">
        {/* Task header with completion toggle */}
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-full p-0"
            disabled={loading.completion}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(id, !isCompleted);
            }}
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="sr-only">
              {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            </span>
          </Button>

          <div className="grid gap-1">
            <h3 className={cn(
              "text-sm font-medium",
              isCompleted && "text-muted-foreground line-through"
            )}>
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign?.(id, undefined);
                }}
                disabled={loading.assignment}
              >
                {assignee ? 'Reassign' : 'Assign'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
                disabled={loading.deletion}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex w-full flex-wrap items-center gap-2 text-xs">
          {/* Due date */}
          {formattedDueDate && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDueDate}
            </Badge>
          )}
          
          {/* Priority */}
          <Badge variant="outline" className={cn("gap-1", priorityDisplay.color)}>
            {priorityDisplay.icon}
            {priorityDisplay.text}
          </Badge>
          
          {/* Assignee */}
          {assignee && (
            <Badge variant="outline" className="gap-1">
              <Avatar className="h-4 w-4">
                {assignee.avatarUrl ? (
                  <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                ) : null}
                <AvatarFallback className="text-[8px]">
                  {assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {assignee.name}
            </Badge>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="ml-auto flex items-center">
              <TagIcon className="mr-1 h-3 w-3 text-muted-foreground" />
              <TagList 
                tags={tags}
                maxVisible={3}
                removable={!!onRemoveTag}
                onRemove={tagName => {
                  onRemoveTag?.(id, tagName);
                }}
                isRemoving={tagName => !!loading.tagRemoval?.[tagName]}
                className="text-xs"
              />
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 