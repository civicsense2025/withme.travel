/**
 * Task List Component
 * 
 * Displays a collection of tasks with filtering, grouping, and sorting options
 */

'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCheck, 
  CalendarDays, 
  ArrowUpDown, 
  Clock, 
  Filter,
  Plus
} from 'lucide-react';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Task data structure
 */
export interface Task {
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
}

/**
 * Props for TaskList component
 */
export interface TaskListProps {
  /** Tasks to display */
  tasks?: Task[];
  /** Whether tasks are loading */
  isLoading?: boolean;
  /** Error message if tasks failed to load */
  error?: string;
  /** Handler for task completion toggle */
  onToggleComplete?: (taskId: string, isCompleted: boolean) => void;
  /** Handler for task assignment */
  onAssign?: (taskId: string, userId?: string) => void;
  /** Handler for task deletion */
  onDelete?: (taskId: string) => void;
  /** Handler for task tag removal */
  onRemoveTag?: (taskId: string, tagName: string) => void;
  /** Handler for creating a new task */
  onCreateTask?: () => void;
  /** Handler for clicking a task */
  onTaskClick?: (taskId: string) => void;
  /** Loading states for task actions */
  loading?: {
    completion?: Record<string, boolean>;
    assignment?: Record<string, boolean>;
    deletion?: Record<string, boolean>;
    tagRemoval?: Record<string, Record<string, boolean>>;
  };
  /** Whether to show a create task button */
  showCreateButton?: boolean;
  /** Maximum height for the task list */
  maxHeight?: string | number;
  /** Additional CSS classes */
  className?: string;
}

/** 
 * Filter options 
 */
type FilterOption = 'all' | 'active' | 'completed';

/**
 * Sort options
 */
type SortOption = 'priority' | 'dueDate' | 'created' | 'title';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a list of tasks with filtering and sorting options
 */
export function TaskList({
  tasks = [],
  isLoading = false,
  error,
  onToggleComplete,
  onAssign,
  onDelete,
  onRemoveTag,
  onCreateTask,
  onTaskClick,
  loading = {},
  showCreateButton = true,
  maxHeight = '600px',
  className,
}: TaskListProps) {
  // Filter and sort state
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value as FilterOption);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };
  
  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter tasks
    const filtered = tasks.filter(task => {
      if (filter === 'all') return true;
      if (filter === 'active') return !task.isCompleted;
      if (filter === 'completed') return task.isCompleted;
      return true;
    });
    
    // Sort tasks
    return filtered.sort((a, b) => {
      // First sort by completion status
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      
      // Then sort by the selected criteria
      switch (sortBy) {
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [tasks, filter, sortBy]);
  
  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Header with filter tabs */}
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" value={filter} onValueChange={handleFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">
              <Clock className="mr-1 h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCheck className="mr-1 h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Sort and create buttons */}
        <div className="flex items-center gap-2">
          <Tabs defaultValue="priority" value={sortBy} onValueChange={handleSortChange}>
            <TabsList>
              <TabsTrigger value="priority" title="Sort by priority">
                <ArrowUpDown className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="dueDate" title="Sort by due date">
                <CalendarDays className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="title" title="Sort by title">
                <Filter className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {showCreateButton && (
            <Button size="sm" onClick={onCreateTask}>
              <Plus className="mr-1 h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      </div>
      
      {/* Task list */}
      <div>
        <ScrollArea 
          className="rounded-md border"
          style={{ maxHeight: maxHeight || undefined }}
        >
          <div className="p-4 space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : filteredAndSortedTasks.length === 0 ? (
              // Empty state
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No tasks found</p>
                {showCreateButton && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={onCreateTask}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Create a task
                  </Button>
                )}
              </div>
            ) : (
              // Task items
              filteredAndSortedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  isCompleted={task.isCompleted}
                  priority={task.priority}
                  assignee={task.assignee}
                  tags={task.tags}
                  onToggleComplete={onToggleComplete}
                  onAssign={onAssign}
                  onDelete={onDelete}
                  onRemoveTag={onRemoveTag}
                  loading={{
                    completion: loading.completion?.[task.id],
                    assignment: loading.assignment?.[task.id],
                    deletion: loading.deletion?.[task.id],
                    tagRemoval: loading.tagRemoval?.[task.id]
                  }}
                  onClick={onTaskClick}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 