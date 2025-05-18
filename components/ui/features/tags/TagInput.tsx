'use client';

/**
 * Tag Input Component
 * 
 * Input component for adding tags with autocomplete suggestions
 */

import React, { useState, useRef, useEffect } from 'react';
import { XCircle, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag } from './Tag';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TagInputProps {
  /** Currently selected tags */
  selectedTags: string[];
  /** Called when tags are added/removed */
  onChange: (tags: string[]) => void;
  /** Optional tag suggestions */
  suggestions?: string[];
  /** Whether suggestions are loading */
  isLoadingSuggestions?: boolean;
  /** Whether to disable the input */
  disabled?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Max number of tags that can be added */
  maxTags?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Tag input component with autocomplete suggestions
 */
export function TagInput({
  selectedTags = [],
  onChange,
  suggestions = [],
  isLoadingSuggestions = false,
  disabled = false,
  placeholder = 'Add a tag...',
  maxTags,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions to exclude already selected tags
  const filteredSuggestions = suggestions.filter(
    (suggestion) => 
      !selectedTags.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  // Add a new tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !selectedTags.includes(trimmedTag) &&
      (!maxTags || selectedTags.length < maxTags)
    ) {
      onChange([...selectedTags, trimmedTag]);
      setInputValue('');
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // Handle key press in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const atMaxTags = maxTags !== undefined && selectedTags.length >= maxTags;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Tag
            key={tag}
            name={tag}
            onRemove={() => removeTag(tag)}
          />
        ))}
      </div>

      {/* Input field */}
      {!atMaxTags && (
        <div className="relative">
          <div className="flex">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="pr-10"
            />
            {inputValue && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-9 top-0 h-full"
                onClick={() => setInputValue('')}
                aria-label="Clear input"
              >
                <XCircle size={16} />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-1"
              onClick={() => {
                if (inputValue) addTag(inputValue);
              }}
              disabled={!inputValue || disabled}
              aria-label="Add tag"
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
            >
              {isLoadingSuggestions ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">Loading suggestions...</div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 