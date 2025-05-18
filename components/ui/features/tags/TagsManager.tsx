'use client';

/**
 * Tags Manager Component
 * 
 * Complete tags management with input, suggestions, and tag display
 */

import React, { useState, useCallback } from 'react';
import { TagInput } from './TagInput';
import { TagList } from './TagList';
import { useTags } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TagsManagerProps {
  /** Type of entity the tags belong to */
  entityType: string;
  /** ID of the entity */
  entityId?: string;
  /** Initial tags to display */
  initialTags?: string[];
  /** Whether to allow adding new tags */
  allowCreate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label for the tags section */
  label?: string;
  /** Placeholder for the tag input */
  placeholder?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Complete tags management component with input and display
 */
export function TagsManager({
  entityType,
  entityId,
  initialTags = [],
  allowCreate = true,
  className,
  label = 'Tags',
  placeholder = 'Add tags...',
}: TagsManagerProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  
  const {
    tags,
    isLoading,
    error,
    addTagToEntity,
    removeTagFromEntity,
    isAddingTag,
    isRemovingTag,
    searchTags,
  } = useTags({
    entityType,
    entityId,
    fetchOnMount: true,
  });
  
  const tagNames = tags?.map(tag => tag.name) || [];
  
  // Handle adding a tag
  const handleAddTag = useCallback(async (tag: string) => {
    if (!entityId) {
      // Just add to local state if no entity ID (new entity)
      setSelectedTags(prev => [...prev, tag]);
      return;
    }
    
    // Add to remote entity
    const result = await addTagToEntity(entityType, entityId, tag);
    if (result && result.success) {
      setSelectedTags(prev => [...prev, tag]);
    }
  }, [entityType, entityId, addTagToEntity]);
  
  // Handle removing a tag
  const handleRemoveTag = useCallback(async (tag: string) => {
    if (!entityId) {
      // Just remove from local state if no entity ID (new entity)
      setSelectedTags(prev => prev.filter(t => t !== tag));
      return;
    }
    
    // Remove from remote entity
    const result = await removeTagFromEntity(entityType, entityId, tag);
    if (result && result.success) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  }, [entityType, entityId, removeTagFromEntity]);
  
  // Handle searching for tags
  const handleSearchTags = useCallback(async (query: string) => {
    if (!query) return [];
    const result = await searchTags(query);
    if (result && result.success) {
      return result.data.map(tag => tag.name);
    }
    return [];
  }, [searchTags]);
  
  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <h3 className="text-sm font-medium">{label}</h3>
      )}
      
      {/* Input for adding tags */}
      {allowCreate && (
        <TagInput
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          placeholder={placeholder}
          suggestionsProvider={handleSearchTags}
        />
      )}
      
      {/* Display existing tags */}
      <TagList
        tags={selectedTags.map(name => ({ name }))}
        removable={true}
        onRemove={handleRemoveTag}
        isRemoving={(tagName) => isRemovingTag(entityType, entityId || '', tagName)}
      />
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 