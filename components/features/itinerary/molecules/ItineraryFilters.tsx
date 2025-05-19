'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ItineraryFiltersProps {
  durations: string[];
  destinations: string[];
  tags: string[];
  selectedDuration: string | null;
  selectedDestination: string | null;
  selectedTags: string[];
  onDurationChange: (duration: string | null) => void;
  onDestinationChange: (destination: string | null) => void;
  onTagsChange: (tags: string[]) => void;
}

export function ItineraryFilters({
  durations,
  destinations,
  tags,
  selectedDuration,
  selectedDestination,
  selectedTags,
  onDurationChange,
  onDestinationChange,
  onTagsChange,
}: ItineraryFiltersProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onDurationChange(null);
    onDestinationChange(null);
    onTagsChange([]);
  };

  return (
    <div className="space-y-6">
      {/* Top filters */}
      <div className="flex flex-wrap gap-4">
        {/* Duration filter */}
        <div className="min-w-44">
          <Select
            value={selectedDuration || 'all_durations'}
            onValueChange={(value) => onDurationChange(value === 'all_durations' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{selectedDuration || 'Duration'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_durations">Any duration</SelectItem>
              {durations.map((dur) => (
                <SelectItem key={dur} value={dur}>
                  {dur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination filter */}
        <div className="min-w-44">
          <Select
            value={selectedDestination || 'all_destinations'}
            onValueChange={(value) =>
              onDestinationChange(value === 'all_destinations' ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>{selectedDestination || 'Destination'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_destinations">Any destination</SelectItem>
              {destinations.map((dest) => (
                <SelectItem key={dest} value={dest}>
                  {dest}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags filter - as a popover */}
        {tags && tags.length > 0 && (
          <div className="min-w-44">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <span>
                      {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : 'Tags'}
                    </span>
                  </div>
                  <ChevronDown size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <h4 className="font-medium">Filter by tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTagsChange([])}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer rounded-full px-3 py-1 text-xs ${
                          selectedTags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Clear filters */}
        {(selectedDuration || selectedDestination || selectedTags.length > 0) && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-1 h-10"
            size="sm"
          >
            <X size={16} />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Display selected tags in a horizontal list */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="cursor-pointer rounded-full px-3 py-1 text-xs flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              <X size={12} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
