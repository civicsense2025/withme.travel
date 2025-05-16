/**
 * @deprecated This component is deprecated. Please use the TaskItem from the molecules directory instead.
 * Import as: import { TaskItem } from '@/components/ui/features/tasks/molecules/TaskItem';
 * Or via the molecules index: import { TaskItem } from '@/components/ui/features/tasks/molecules';
 * 
 * TaskItem component displays a single task with status, priority, and interactive elements
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import { 
  TaskBadge, 
  TaskDueDate, 
  TaskAssignee, 
  TaskVoteCounter, 
  TaskTag 
} from './atoms';
import type { TaskItem as TaskItemType } from './types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskItemProps {
  /** Task data to display */
  task: TaskItemType;
  /** Handler for when the task status is changed */
  onStatusChange?: (taskId: string, newStatus: TaskItemType['status']) => void;
  /** Handler for when a vote is cast */
  onVote?: (taskId: string, voteType: 'up' | 'down') => void;
  /** Handler for when the task is selected */
  onSelect?: (task: TaskItemType) => void;
  /** Whether the component should show expanded details */
  expanded?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a single task with its details, status, and actions
 */
export function TaskItem({
  task,
  onStatusChange,
  onVote,
  onSelect,
  expanded = false,
  className = '',
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(task.id, voteType);
    }
  };
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(task);
    }
  };
  
  return (
    <Card 
      className={`task-item border-l-4 ${
        expanded ? 'shadow-md' : ''
      } ${className}`}
      style={{ 
        borderLeftColor: task.priority 
          ? {
              high: 'var(--color-red-500)',
              medium: 'var(--color-amber-500)',
              low: 'var(--color-green-500)'
            }[task.priority]
          : 'var(--color-gray-300)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-medium leading-tight">{task.title}</h3>
          <TaskBadge type="status" value={task.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {expanded && task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {task.dueDate && (
            <TaskDueDate 
              date={task.dueDate}
              format="short"
            />
          )}
          
          {task.priority && (
            <TaskBadge type="priority" value={task.priority} />
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <TaskTag key={tag} text={tag} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center gap-2">
          <TaskVoteCounter 
            votes={task.votes} 
            direction="up" 
            onVote={() => handleVote('up')}
          />
          
          <TaskVoteCounter 
            votes={task.votes} 
            direction="down" 
            onVote={() => handleVote('down')}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {task.assignee && (
            <TaskAssignee 
              user={task.assignee}
              size="sm"
            />
          )}
          
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle the expanded view or show options
                if (onSelect) onSelect(task);
              }}
            >
              <MoreHorizontal size={16} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 