'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { TagBaseProps, TagInput as TagInputData } from '../types';

/**
 * Props for the TagInput component
 */
export interface TagInputProps extends TagBaseProps {
  /** Handler for when a new tag is submitted */
  onSubmit: (tagData: TagInputData) => void;
  /** Whether the input is in a loading state */
  isLoading?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
}

/**
 * Component for entering a new tag
 */
export function TagInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Add a new tag...',
  className
}: TagInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (value.trim() && !isLoading) {
      onSubmit({ name: value.trim() });
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-center space-x-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!value.trim() || isLoading}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </form>
  );
} 