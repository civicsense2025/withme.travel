/**
 * Expense Filter (Molecule)
 *
 * A component for filtering expenses by various criteria such as
 * date range, category, and members.
 *
 * @module expenses/molecules
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  X, 
  Check
} from 'lucide-react';
import { ExpenseCategory } from '../atoms/expense-category-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface TripMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ExpenseFilterValues {
  search?: string;
  categories?: ExpenseCategory[];
  startDate?: Date;
  endDate?: Date;
  memberIds?: string[];
}

export interface ExpenseFilterProps {
  /** Current filter values */
  value: ExpenseFilterValues;
  /** Callback when filters change */
  onChange: (filters: ExpenseFilterValues) => void;
  /** Available categories to filter by */
  categories?: Array<{value: ExpenseCategory; label: string}>;
  /** Available members to filter by */
  members?: TripMember[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CATEGORY OPTIONS
// ============================================================================

const DEFAULT_CATEGORIES = [
  { value: 'accommodation' as ExpenseCategory, label: 'Accommodation' },
  { value: 'food' as ExpenseCategory, label: 'Food' },
  { value: 'transportation' as ExpenseCategory, label: 'Transportation' },
  { value: 'activities' as ExpenseCategory, label: 'Activities' },
  { value: 'entertainment' as ExpenseCategory, label: 'Entertainment' },
  { value: 'shopping' as ExpenseCategory, label: 'Shopping' },
  { value: 'flights' as ExpenseCategory, label: 'Flights' },
  { value: 'fees' as ExpenseCategory, label: 'Fees' },
  { value: 'other' as ExpenseCategory, label: 'Other' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExpenseFilter({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  members = [],
  className,
}: ExpenseFilterProps) {
  // Local state for search input (debounced)
  const [searchInput, setSearchInput] = useState(value.search || '');
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    
    // Debounce search to avoid too many filter changes
    const debounceTimer = setTimeout(() => {
      onChange({
        ...value,
        search: newValue || undefined,
      });
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: ExpenseCategory, checked: boolean) => {
    const currentCategories = value.categories || [];
    
    if (checked) {
      onChange({
        ...value,
        categories: [...currentCategories, category],
      });
    } else {
      onChange({
        ...value,
        categories: currentCategories.filter(c => c !== category),
      });
    }
  };
  
  // Handle date range selection
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onChange({
      ...value,
      startDate: range.from,
      endDate: range.to,
    });
  };
  
  // Handle member selection
  const handleMemberChange = (memberId: string, checked: boolean) => {
    const currentMemberIds = value.memberIds || [];
    
    if (checked) {
      onChange({
        ...value,
        memberIds: [...currentMemberIds, memberId],
      });
    } else {
      onChange({
        ...value,
        memberIds: currentMemberIds.filter(id => id !== memberId),
      });
    }
  };
  
  // Format date range for display
  const formatDateRange = () => {
    if (value.startDate && value.endDate) {
      return `${format(value.startDate, 'MMM d')} - ${format(value.endDate, 'MMM d, yyyy')}`;
    }
    if (value.startDate) {
      return `From ${format(value.startDate, 'MMM d, yyyy')}`;
    }
    if (value.endDate) {
      return `Until ${format(value.endDate, 'MMM d, yyyy')}`;
    }
    return 'Select dates';
  };
  
  // Count active filters
  const activeFilterCount = 
    (value.categories?.length || 0) + 
    (value.memberIds?.length || 0) + 
    (value.startDate || value.endDate ? 1 : 0);
  
  // Clear all filters
  const clearFilters = () => {
    onChange({
      search: value.search, // Keep search as is
      categories: undefined,
      startDate: undefined,
      endDate: undefined,
      memberIds: undefined,
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        
        {/* Filters popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8 text-sm text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {/* Date range filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !(value.startDate || value.endDate) && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={value.startDate || new Date()}
                      selected={{
                        from: value.startDate || undefined,
                        to: value.endDate || undefined
                      }}
                      onSelect={(selectedRange) => {
                        if (selectedRange) {
                          handleDateRangeChange({
                            from: selectedRange.from,
                            to: selectedRange.to
                          });
                        } else {
                          handleDateRangeChange({});
                        }
                      }}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Category filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={value.categories?.includes(category.value) || false}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.value, checked === true)
                        }
                      />
                      <label
                        htmlFor={`category-${category.value}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Member filter */}
              {members.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Members</label>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={value.memberIds?.includes(member.id) || false}
                          onCheckedChange={(checked) => 
                            handleMemberChange(member.id, checked === true)
                          }
                        />
                        <label
                          htmlFor={`member-${member.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {member.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.categories?.map((category) => (
            <Badge 
              key={category} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {categories.find(c => c.value === category)?.label || category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleCategoryChange(category, false)}
              />
            </Badge>
          ))}
          
          {(value.startDate || value.endDate) && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {formatDateRange()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleDateRangeChange({})}
              />
            </Badge>
          )}
          
          {value.memberIds?.map((memberId) => {
            const member = members.find(m => m.id === memberId);
            return (
              <Badge 
                key={memberId} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {member?.name || memberId}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleMemberChange(memberId, false)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
} 