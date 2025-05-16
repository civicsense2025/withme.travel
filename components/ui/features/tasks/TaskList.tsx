/**
 * TaskList component displays a collection of tasks with filtering and sorting
 */

'use client';

import { useState, useMemo } from 'react';
import { TaskFilter, TaskSorter, TaskAddButton, SortOption, SortDirection, TaskItem } from './molecules';
import type { TaskItem as TaskItemType, ExtendedItemStatus, TaskPriority } from './types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskListProps {
  /** Array of tasks to display */
  tasks: TaskItemType[];
  /** Handler for creating a new task */
  onCreateTask?: () => void;
  /** Handler for when a task is selected */
  onSelectTask?: (task: TaskItemType) => void;
  /** Handler for when a task status is changed */
  onStatusChange?: (taskId: string, newStatus: ExtendedItemStatus) => void;
  /** Handler for when a vote is cast for a task */
  onVote?: (taskId: string, voteType: 'up' | 'down') => void;
  /** Whether to allow sorting and filtering */
  enableFiltering?: boolean;
  /** Whether to show the create task button */
  showCreateButton?: boolean;
  /** Title to display above the task list */
  title?: string;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a list of tasks with filtering and sorting options
 */
export function TaskList({
  tasks,
  onCreateTask,
  onSelectTask,
  onStatusChange,
  onVote,
  enableFiltering = true,
  showCreateButton = true,
  title = 'Tasks',
  className = '',
}: TaskListProps) {
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtendedItemStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aVal = a.priority ? priorityOrder[a.priority] : 0;
          const bVal = b.priority ? priorityOrder[b.priority] : 0;
          comparison = aVal - bVal;
          break;
        }
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        }
        case 'votes': {
          const aVotes = a.votes.up - a.votes.down;
          const bVotes = b.votes.up - b.votes.down;
          comparison = aVotes - bVotes;
          break;
        }
        case 'title': {
          comparison = a.title.localeCompare(b.title);
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {showCreateButton && onCreateTask && (
          <TaskAddButton onClick={onCreateTask} size="sm" />
        )}
      </div>

      {enableFiltering && (
        <div className="mb-4 space-y-3">
          <TaskFilter
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
          />
          
          <div className="flex justify-end">
            <TaskSorter
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={setSortBy}
              onDirectionChange={setSortDirection}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange ? (status) => onStatusChange(task.id, status) : undefined}
              onUpvote={onVote ? () => onVote(task.id, 'up') : undefined}
              onDownvote={onVote ? () => onVote(task.id, 'down') : undefined}
              onDelete={onSelectTask ? () => onSelectTask(task) : undefined}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? (
              <p>No tasks match your filters.</p>
            ) : (
              <p>No tasks available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 