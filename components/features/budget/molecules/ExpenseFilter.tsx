/**
 * ExpenseFilter Component (Molecule)
 * 
 * Provides filtering controls for expenses by category, date range, and amount.
 * 
 * @module budget/molecules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ExpenseCategory } from '../atoms/expense-category-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

export interface ExpenseFilterOptions {
  /** Category filter */
  category?: ExpenseCategory | 'all';
  /** Date range filter - start date */
  startDate?: string;
  /** Date range filter - end date */
  endDate?: string;
  /** Minimum amount filter */
  minAmount?: number;
  /** Maximum amount filter */
  maxAmount?: number;
  /** Text search query */
  searchQuery?: string;
}

export interface ExpenseFilterProps {
  /** Current filter options */
  filter: ExpenseFilterOptions;
  /** Callback when filter changes */
  onFilterChange: (filter: ExpenseFilterOptions) => void;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExpenseFilter({ filter, onFilterChange, className }: ExpenseFilterProps) {
  const hasActiveFilters = 
    filter.category !== 'all' ||
    filter.startDate ||
    filter.endDate ||
    filter.minAmount ||
    filter.maxAmount ||
    filter.searchQuery;
    
  const updateFilter = (updates: Partial<ExpenseFilterOptions>) => {
    onFilterChange({
      ...filter,
      ...updates,
    });
  };
    
  const clearFilters = () => {
    onFilterChange({
      category: 'all',
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      searchQuery: '',
    });
  };
    
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter({ searchQuery: e.target.value });
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Search input */}
      <div className="flex gap-2">
        <Input
          placeholder="Search expenses..."
          value={filter.searchQuery || ''}
          onChange={handleSearchChange}
          className="flex-1"
        />
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-10 w-10',
            hasActiveFilters && 'border-primary text-primary'
          )}
          onClick={() => {
            // Open/close filter panel
          }}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filter.category && filter.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Category: {filter.category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter({ category: 'all' })}
              />
            </Badge>
          )}
          
          {(filter.startDate || filter.endDate) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3 mr-1" />
              {filter.startDate && !filter.endDate 
                ? `From ${filter.startDate}` 
                : !filter.startDate && filter.endDate
                ? `Until ${filter.endDate}`
                : `${filter.startDate} - ${filter.endDate}`}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter({ startDate: undefined, endDate: undefined })}
              />
            </Badge>
          )}
          
          {(filter.minAmount || filter.maxAmount) && (
            <Badge variant="secondary" className="gap-1">
              Amount: 
              {filter.minAmount && !filter.maxAmount 
                ? `>= $${filter.minAmount}` 
                : !filter.minAmount && filter.maxAmount
                ? `<= $${filter.maxAmount}`
                : `$${filter.minAmount} - $${filter.maxAmount}`}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter({ minAmount: undefined, maxAmount: undefined })}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
