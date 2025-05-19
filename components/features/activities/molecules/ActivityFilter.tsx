/**
 * Activity Filter (Molecule)
 *
 * A component that provides filtering controls for the activity feed.
 *
 * @module activities/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActivityType } from '../atoms/activity-icon';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ActivityFilterItem {
  value: ActivityType | 'all';
  label: string;
}

export interface ActivityFilterProps {
  /** Currently selected filter values */
  selectedFilters: (ActivityType | 'all')[];
  /** Available filter options */
  filterOptions: ActivityFilterItem[];
  /** Callback for when filters change */
  onFilterChange: (filters: (ActivityType | 'all')[]) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityFilter({
  selectedFilters,
  filterOptions,
  onFilterChange,
  className,
}: ActivityFilterProps) {
  // Handle selecting a filter
  const handleSelectFilter = (value: ActivityType | 'all') => {
    // If "all" is selected, clear all other filters
    if (value === 'all') {
      onFilterChange(['all']);
      return;
    }

    // If a specific filter is selected, remove "all" from the selection
    let newFilters = selectedFilters.filter((filter) => filter !== 'all');

    // Toggle the selected filter
    if (newFilters.includes(value)) {
      newFilters = newFilters.filter((filter) => filter !== value);
    } else {
      newFilters.push(value);
    }

    // If no filters are selected, default to "all"
    if (newFilters.length === 0) {
      newFilters = ['all'];
    }

    onFilterChange(newFilters);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by activity type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSelectFilter(option.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{option.label}</span>
                {selectedFilters.includes(option.value) && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show active filters as tags */}
      <div className="flex flex-wrap gap-1">
        {selectedFilters.length > 0 &&
          selectedFilters[0] !== 'all' &&
          selectedFilters.map((filter) => {
            const filterOption = filterOptions.find((option) => option.value === filter);
            return (
              <div
                key={filter}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
              >
                {filterOption?.label || filter}
                <button
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSelectFilter(filter)}
                >
                  ×
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
