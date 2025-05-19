'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TagBaseProps, TagInput as TagInputData, TagCategory } from '../types';

/**
 * Props for TagCreator component
 */
export interface TagCreatorProps extends TagBaseProps {
  /** Handler for when a new tag is submitted */
  onSubmit: (tagData: TagInputData) => void;
  /** Whether the input is in a loading state */
  isLoading?: boolean;
  /** Optional label for the form */
  label?: string;
}

/**
 * A form for creating new tags with category selection
 */
export function TagCreator({
  onSubmit,
  isLoading = false,
  label = 'Add a new tag',
  className
}: TagCreatorProps) {
  const [tagData, setTagData] = useState<TagInputData>({
    name: '',
    category: 'general',
    emoji: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tagData.name.trim() && !isLoading) {
      onSubmit({
        ...tagData,
        name: tagData.name.trim(),
        emoji: tagData.emoji?.trim() || undefined,
      });
      setTagData({
        name: '',
        category: tagData.category,
        emoji: '',
      });
    }
  };

  const handleChange = (field: keyof TagInputData, value: string) => {
    setTagData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tagName">Tag Name</Label>
          <Input
            id="tagName"
            value={tagData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Family Friendly"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={tagData.category}
            onValueChange={(value) => handleChange('category', value)}
            disabled={isLoading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="amenity">Amenity</SelectItem>
              <SelectItem value="atmosphere">Atmosphere</SelectItem>
              <SelectItem value="cuisine">Cuisine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="emoji">Emoji (optional)</Label>
        <Input
          id="emoji"
          value={tagData.emoji}
          onChange={(e) => handleChange('emoji', e.target.value)}
          placeholder="e.g., 👨‍👩‍👧‍👦"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!tagData.name.trim() || isLoading}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {isLoading ? 'Creating...' : 'Create Tag'}
        </Button>
      </div>
    </form>
  );
} 