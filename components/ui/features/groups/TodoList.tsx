/**
 * @deprecated This component is deprecated. Please use the new TaskList component from @/components/ui/features/tasks instead.
 * Example: import { TaskList } from '@/components/ui/features/tasks';
 */

/**
 * @deprecated This component has been moved to components/ui/features/todo/organisms/TodoList.tsx
 * Please import from '@/components/ui/features/todo' instead.
 * This file will be removed in a future update.
 */

'use client';

/**
 * TodoList
 *
 * @deprecated Please use the new component at @/components/ui/features/todo/organisms/TodoList instead.
 * This component will be removed in a future release.
 * 
 * A todo list component for managing task items. Provides collaborative functionality
 * for adding, completing, and filtering tasks.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Filter, ArrowDownAZ, ArrowUpAZ, CalendarDays, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Todo, TodoItem, TodoCategory, TodoPriority } from '@/components/Todo';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for the TodoList component
 */
export interface TodoListProps {
  /** Initial todo items to display */
  items: TodoItem[];
  /** Whether the user can add, edit, or remove items */
  canEdit?: boolean;
  /** Optional title for the todo list */
  title?: string;
  /** Callback when an item is toggled */
  onToggle?: (id: string, completed: boolean) => Promise<void>;
  /** Callback when an item is deleted */
  onDelete?: (id: string) => Promise<void>;
  /** Callback when a new item is added */
  onAdd?: (text: string) => Promise<void>;
  /** Callback when an item is updated */
  onUpdate?: (id: string, item: Partial<TodoItem>) => Promise<void>;
  /** Enable grouping by category */
  enableGroupBy?: boolean;
  /** Enable advanced filtering */
  enableFilters?: boolean;
  /** Enable sorting options */
  enableSorting?: boolean;
}

type SortOption = 'dueDate' | 'priority' | 'alphabetical' | 'added';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'completed' | 'active';
type GroupByOption = 'none' | 'category' | 'priority' | 'dueDate';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Advanced TodoList component with sorting, filtering, and grouping capabilities
 */
export function TodoList({
  items,
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
  onUpdate,
  enableGroupBy = true,
  enableFilters = true,
  enableSorting = true
}: TodoListProps) {
  // State for filtering, sorting, and grouping
  const [sortOption, setSortOption] = useState<SortOption>('added');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');

  // Apply filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status filter
      if (filterOption === 'completed' && !item.completed) return false;
      if (filterOption === 'active' && item.completed) return false;
      
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      
      return true;
    });
  }, [items, filterOption, categoryFilter, priorityFilter]);

  // Apply sorting
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let result = 0;
      
      switch (sortOption) {
        case 'alphabetical':
          result = a.text.localeCompare(b.text);
          break;
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aPriority = a.priority ? priorityValues[a.priority] : 0;
          const bPriority = b.priority ? priorityValues[b.priority] : 0;
          result = bPriority - aPriority; // Higher priority first
          break;
        case 'dueDate':
          const aDate = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
          const bDate = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
          result = aDate - bDate; // Earlier dates first
          break;
        case 'added':
        default:
          // Assuming ids are sequential or contain sequential information
          result = a.id.localeCompare(b.id);
          break;
      }
      
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredItems, sortOption, sortDirection]);

  // Group items
  const groupedItems = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Items': sortedItems };
    }
    
    const groups: Record<string, TodoItem[]> = {};
    
    sortedItems.forEach(item => {
      let groupKey: string;
      
      if (groupBy === 'category') {
        groupKey = item.category || 'Uncategorized';
      } else if (groupBy === 'priority') {
        groupKey = item.priority || 'No Priority';
      } else if (groupBy === 'dueDate') {
        if (!item.dueDate) {
          groupKey = 'No Due Date';
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          const itemDate = new Date(item.dueDate);
          itemDate.setHours(0, 0, 0, 0);
          
          if (itemDate < today) {
            groupKey = 'Overdue';
          } else if (itemDate.getTime() === today.getTime()) {
            groupKey = 'Today';
          } else if (itemDate.getTime() === tomorrow.getTime()) {
            groupKey = 'Tomorrow';
          } else if (itemDate < nextWeek) {
            groupKey = 'This Week';
          } else {
            groupKey = 'Later';
          }
        }
      } else {
        groupKey = 'All Items';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
    });
    
    return groups;
  }, [sortedItems, groupBy]);

  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        {(enableFilters || enableSorting || enableGroupBy) && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {enableFilters && (
              <div className="flex items-center gap-2">
                <Tabs 
                  defaultValue="all" 
                  value={filterOption}
                  className="w-auto"
                  onValueChange={(value) => setFilterOption(value as FilterOption)}
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {enableFilters && (
              <>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as TodoCategory | 'all')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={(value) => setPriorityFilter(value as TodoPriority | 'all')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            {enableSorting && (
              <div className="flex items-center">
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="added">Date Added</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSortDirection}
                  className="ml-1"
                  aria-label={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <ArrowDownAZ className="h-4 w-4" />
                  ) : (
                    <ArrowUpAZ className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            
            {enableGroupBy && (
              <Select
                value={groupBy}
                onValueChange={(value) => setGroupBy(value as GroupByOption)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks match your filters</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([group, groupItems]) => (
            <div key={group} className="mb-6 last:mb-0">
              {Object.keys(groupedItems).length > 1 && (
                <h3 className="text-md font-medium mb-3">{group}</h3>
              )}
              
              <Todo
                initialItems={groupItems}
                canEdit={canEdit}
                title={Object.keys(groupedItems).length > 1 ? undefined : title}
                onToggle={onToggle}
                onDelete={onDelete}
                onAdd={onAdd}
                onUpdate={onUpdate}
              />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}