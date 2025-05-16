/**
 * TaskFilter provides filtering options for task lists
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ExtendedItemStatus, TaskPriority } from '../types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskFilterProps {
  /** Current search query */
  searchQuery: string;
  /** Current status filter */
  statusFilter: ExtendedItemStatus | 'all';
  /** Current priority filter */
  priorityFilter: TaskPriority | 'all';
  /** Handler for search query changes */
  onSearchChange: (query: string) => void;
  /** Handler for status filter changes */
  onStatusChange: (status: ExtendedItemStatus | 'all') => void;
  /** Handler for priority filter changes */
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS: ExtendedItemStatus[] = [
  'suggested', 
  'confirmed', 
  'rejected', 
  'active', 
  'cancelled'
];

const PRIORITY_OPTIONS: TaskPriority[] = [
  'high', 
  'medium', 
  'low'
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for filtering task lists
 */
export function TaskFilter({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  className = '',
}: TaskFilterProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-500" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => onStatusChange(value as ExtendedItemStatus | 'all')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={priorityFilter} 
          onValueChange={(value) => onPriorityChange(value as TaskPriority | 'all')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_OPTIONS.map(priority => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 