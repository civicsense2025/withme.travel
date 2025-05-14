'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useWhiteboardContext } from '../context/whiteboard-context';

interface IdeasFilterProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: IdeasFilters) => void;
}

export interface IdeasFilters {
  types: {
    destination: boolean;
    date: boolean;
    activity: boolean;
    budget: boolean;
    other: boolean;
  };
  searchTerm: string;
  sortBy: 'created' | 'votes' | 'alphabetical';
  sortDirection: 'asc' | 'desc';
  showSelected: boolean;
  minVotes?: number;
}

const defaultFilters: IdeasFilters = {
  types: {
    destination: true,
    date: true,
    activity: true,
    budget: true,
    other: true,
  },
  searchTerm: '',
  sortBy: 'created',
  sortDirection: 'desc',
  showSelected: false,
};

export function IdeasFilter({ open, onClose, onApplyFilter }: IdeasFilterProps) {
  // const { getTypeEmoji, getLabelForType } = useWhiteboardContext(); // Commenting out as these are not in the current context
  const [filters, setFilters] = useState<IdeasFilters>(defaultFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update any filter field
  const updateFilter = <K extends keyof IdeasFilters>(key: K, value: IdeasFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle a specific type filter
  const toggleTypeFilter = (type: keyof IdeasFilters['types']) => {
    setFilters((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  // Apply the current filters
  const applyFilters = () => {
    onApplyFilter(filters);
    updateActiveFilterCount();
    onClose();
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters);
    onApplyFilter(defaultFilters);
    setActiveFilterCount(0);
  };

  // Count how many active filters we have
  const updateActiveFilterCount = () => {
    let count = 0;

    // Check if any type filter is off
    const typeFilters = Object.values(filters.types);
    if (typeFilters.some((value) => !value)) {
      count++;
    }

    // Check other filters
    if (filters.searchTerm) count++;
    if (filters.sortBy !== 'created' || filters.sortDirection !== 'desc') count++;
    if (filters.showSelected) count++;
    if (filters.minVotes && filters.minVotes > 0) count++;

    setActiveFilterCount(count);
  };

  // Idea type options for rendering
  const ideaTypes = [
    { id: 'destination', label: 'Destination', emoji: '📍' },
    { id: 'date', label: 'Date', emoji: '📅' },
    { id: 'activity', label: 'Activity', emoji: '🏄‍♂️' },
    { id: 'budget', label: 'Budget', emoji: '💰' },
    { id: 'other', label: 'Other', emoji: '💭' },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-[350px] sm:w-[450px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex justify-between items-center">
            <span>Filter Ideas</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Filter and sort ideas to find what you're looking for.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title or description"
                className="pl-8"
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
              />
              {filters.searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => updateFilter('searchTerm', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Idea Types */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Idea Types</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  // Toggle all based on current state
                  // If all are checked, uncheck all. Otherwise, check all.
                  const allChecked = Object.values(filters.types).every(Boolean);
                  const newState = !allChecked;
                  updateFilter('types', {
                    destination: newState,
                    date: newState,
                    activity: newState,
                    budget: newState,
                    other: newState,
                  });
                }}
              >
                {Object.values(filters.types).every(Boolean) ? 'Uncheck All' : 'Check All'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ideaTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2 rounded-md border p-3">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={filters.types[type.id]}
                    onCheckedChange={() => toggleTypeFilter(type.id)}
                  />
                  <Label
                    htmlFor={`type-${type.id}`}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sort Options */}
          <div className="space-y-3">
            <Label>Sort By</Label>
            <RadioGroup
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value as IdeasFilters['sortBy'])}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="sort-created"
                className={`flex items-center justify-center space-x-2 rounded-md border p-3 cursor-pointer ${
                  filters.sortBy === 'created' ? 'bg-muted border-primary' : ''
                }`}
              >
                <RadioGroupItem value="created" id="sort-created" />
                <span>Date</span>
              </Label>
              <Label
                htmlFor="sort-votes"
                className={`flex items-center justify-center space-x-2 rounded-md border p-3 cursor-pointer ${
                  filters.sortBy === 'votes' ? 'bg-muted border-primary' : ''
                }`}
              >
                <RadioGroupItem value="votes" id="sort-votes" />
                <span>Votes</span>
              </Label>
              <Label
                htmlFor="sort-alphabetical"
                className={`flex items-center justify-center space-x-2 rounded-md border p-3 cursor-pointer ${
                  filters.sortBy === 'alphabetical' ? 'bg-muted border-primary' : ''
                }`}
              >
                <RadioGroupItem value="alphabetical" id="sort-alphabetical" />
                <span>A-Z</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Sort Direction</Label>
            <RadioGroup
              value={filters.sortDirection}
              onValueChange={(value) =>
                updateFilter('sortDirection', value as IdeasFilters['sortDirection'])
              }
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="sort-desc"
                className={`flex items-center justify-center space-x-2 rounded-md border p-3 cursor-pointer ${
                  filters.sortDirection === 'desc' ? 'bg-muted border-primary' : ''
                }`}
              >
                <RadioGroupItem value="desc" id="sort-desc" />
                <span>Descending</span>
              </Label>
              <Label
                htmlFor="sort-asc"
                className={`flex items-center justify-center space-x-2 rounded-md border p-3 cursor-pointer ${
                  filters.sortDirection === 'asc' ? 'bg-muted border-primary' : ''
                }`}
              >
                <RadioGroupItem value="asc" id="sort-asc" />
                <span>Ascending</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="space-y-3">
            <Label>Additional Filters</Label>

            <div className="flex items-center space-x-2 py-1">
              <Checkbox
                id="selected-only"
                checked={filters.showSelected}
                onCheckedChange={(checked) => updateFilter('showSelected', Boolean(checked))}
              />
              <Label htmlFor="selected-only" className="cursor-pointer">
                Show selected ideas only
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-votes">Minimum votes</Label>
              <Input
                id="min-votes"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minVotes !== undefined ? filters.minVotes : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter('minVotes', value === '' ? undefined : Number(value));
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
