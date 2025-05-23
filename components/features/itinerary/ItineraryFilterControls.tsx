import React from 'react';
import { Button } from '@/components/ui/button';
import { ItineraryCategory } from '@/utils/constants/status';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItineraryFilterControlsProps {
  durationDays: number;
  currentFilter: {
    day: number | 'all';
    category: string | 'all';
  };
  onFilterChange: (type: 'day' | 'category', value: number | string | 'all') => void;
  categories: ItineraryCategory[];
}

export const ItineraryFilterControls: React.FC<ItineraryFilterControlsProps> = ({
  durationDays,
  currentFilter,
  onFilterChange,
  categories,
}) => {
  const days = Array.from({ length: durationDays }, (_, i) => i + 1);

  return (
    <div className="flex gap-2 items-center mb-4 text-xs">
      <Select
        value={currentFilter.day.toString()}
        onValueChange={(value) =>
          onFilterChange('day', value === 'all' ? 'all' : parseInt(value, 10))
        }
      >
        <SelectTrigger className="w-auto min-w-[110px] h-7 px-2 py-0.5 text-xs">
          <SelectValue>
            {currentFilter.day === 'all'
              ? 'All Days'
              : currentFilter.day === 0
                ? 'Unscheduled'
                : `Day ${currentFilter.day}`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Days</SelectItem>
          <SelectItem value="0">Unscheduled</SelectItem>
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              Day {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilter.category}
        onValueChange={(value) => onFilterChange('category', value)}
      >
        <SelectTrigger className="w-auto min-w-[130px] h-7 px-2 py-0.5 text-xs">
          <SelectValue>
            {currentFilter.category === 'all'
              ? 'All Categories'
              : currentFilter.category.charAt(0).toUpperCase() +
                currentFilter.category.slice(1).replace('_', ' ')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(currentFilter.day !== 'all' || currentFilter.category !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={() => {
            return onFilterChange('day', 'all');
            onFilterChange('category', 'all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};
