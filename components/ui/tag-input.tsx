/**
 * TagInput (Atom)
 *
 * A themeable, accessible tag input component for managing multiple tags.
 *
 * @module ui/atoms
 */
import React, { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({ 
  value = [], 
  onChange, 
  placeholder = 'Add tag...', 
  className,
  disabled = false,
  maxTags = Infinity
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      if (value.length >= maxTags) return;
      
      // Add the tag if it doesn't already exist
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-primary/50 bg-background',
      className,
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      {value.map((tag) => (
        <div 
          key={tag} 
          className="flex items-center gap-1 bg-muted text-foreground px-2 py-1 rounded-md text-sm"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      
      {value.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none p-1 text-sm"
          disabled={disabled}
        />
      )}
    </div>
  );
} 