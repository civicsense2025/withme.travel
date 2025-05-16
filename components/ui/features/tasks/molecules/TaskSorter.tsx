/**
 * TaskSorter provides controls for sorting task lists
 */

import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SortAsc, SortDesc } from 'lucide-react';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export type SortOption = 'priority' | 'dueDate' | 'votes' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface TaskSorterProps {
  /** Current sort option */
  sortBy: SortOption;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Handler for sort option changes */
  onSortChange: (option: SortOption) => void;
  /** Handler for sort direction changes */
  onDirectionChange: (direction: SortDirection) => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for sorting task lists
 */
export function TaskSorter({
  sortBy,
  sortDirection,
  onSortChange,
  onDirectionChange,
  className = '',
}: TaskSorterProps) {
  const toggleDirection = () => {
    onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select 
        value={sortBy} 
        onValueChange={(value) => onSortChange(value as SortOption)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="votes">Votes</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleDirection}
        title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        {sortDirection === 'asc' ? (
          <SortAsc size={16} />
        ) : (
          <SortDesc size={16} />
        )}
      </Button>
    </div>
  );
} 