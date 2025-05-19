/**
 * FAQ Filter component (molecule)
 * Provides tag filtering and search for FAQ items.
 */
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FAQTag } from '../atoms';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface FAQFilterProps {
  /** Available tags for filtering */
  tags: string[];
  /** Currently selected tags */
  selectedTags?: string[];
  /** Current search query */
  searchQuery?: string;
  /** Callback when tags change */
  onTagsChange?: (tags: string[]) => void;
  /** Callback when search changes */
  onSearchChange?: (search: string) => void;
  /** Whether to show the search box */
  showSearch?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FAQFilter({
  tags,
  selectedTags = [],
  searchQuery = '',
  onTagsChange,
  onSearchChange,
  showSearch = true,
  className
}: FAQFilterProps) {
  const [search, setSearch] = useState(searchQuery);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange?.(value);
  };
  
  const handleTagToggle = (tag: string) => {
    let newTags: string[];
    
    if (tag === 'All') {
      // If "All" is selected, clear all other selections
      newTags = selectedTags.includes('All') ? [] : ['All'];
    } else {
      // Toggle the tag, and remove "All" if present
      newTags = selectedTags.includes(tag) 
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags.filter(t => t !== 'All'), tag];
    }
    
    onTagsChange?.(newTags);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search FAQs..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <FAQTag 
          tag="All"
          isSelected={selectedTags.includes('All') || selectedTags.length === 0}
          onClick={() => handleTagToggle('All')}
        />
        
        {tags.filter(tag => tag !== 'All').map(tag => (
          <FAQTag 
            key={tag}
            tag={tag}
            isSelected={selectedTags.includes(tag)}
            onClick={() => handleTagToggle(tag)}
          />
        ))}
      </div>
    </div>
  );
} 