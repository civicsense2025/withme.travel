'use client';

/**
 * Tag Picker Hook
 *
 * React hook for managing tag selection with suggestions and data management
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTags } from './use-tags';
import { useDebounce } from './use-debounce';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Hook parameters
 */
export interface UseTagPickerParams {
  /** Entity type the tags belong to */
  entityType: string;
  /** Entity ID the tags belong to (optional for new entities) */
  entityId?: string;
  /** Initial tags to select */
  initialSelectedTags?: string[];
  /** Whether to fetch tags on mount */
  fetchOnMount?: boolean;
  /** Callback when tags are changed */
  onChange?: (selectedTags: string[]) => void;
}

/**
 * Hook return value
 */
export interface UseTagPickerResult {
  /** Currently selected tags */
  selectedTags: string[];
  /** Available tag suggestions */
  suggestions: string[];
  /** Whether suggestions are loading */
  isLoadingSuggestions: boolean;
  /** Add a tag to selection */
  addTag: (tag: string) => Promise<boolean>;
  /** Remove a tag from selection */
  removeTag: (tag: string) => Promise<boolean>;
  /** Search for tag suggestions */
  searchTags: (query: string) => void;
  /** Whether a specific tag is being added */
  isAddingTag: (tag: string) => boolean;
  /** Whether a specific tag is being removed */
  isRemovingTag: (tag: string) => boolean;
  /** Clear all selected tags */
  clearTags: () => void;
  /** Error message if any */
  error: string | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing tag selection with suggestions and data management
 */
export function useTagPicker({
  entityType,
  entityId,
  initialSelectedTags = [],
  fetchOnMount = true,
  onChange,
}: UseTagPickerParams): UseTagPickerResult {
  // State for search query and selected tags
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  // Track loading states for individual tags
  const [addingTags, setAddingTags] = useState<Record<string, boolean>>({});
  const [removingTags, setRemovingTags] = useState<Record<string, boolean>>({});

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get tag data from the tags hook
  const {
    tags: allTags,
    isLoading,
    error,
    addTagToEntity,
    removeTagFromEntity,
    searchTags: searchTagsFromApi,
  } = useTags({
    entityType,
    entityId,
    fetchOnMount,
  });

  // When search query changes, fetch suggestions
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchTagsFromApi(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchTagsFromApi]);

  // When selected tags change, call onChange callback
  useEffect(() => {
    onChange?.(selectedTags);
  }, [selectedTags, onChange]);

  // Add a tag to selection
  const addTag = useCallback(
    async (tag: string): Promise<boolean> => {
      // Skip if already selected
      if (selectedTags.includes(tag)) {
        return true;
      }

      // Update local state optimistically
      setSelectedTags((prev) => [...prev, tag]);

      // If no entity ID, just update local state (new entity)
      if (!entityId) {
        return true;
      }

      // Track loading state
      setAddingTags((prev) => ({ ...prev, [tag]: true }));

      try {
        // Add to remote entity
        const result = await addTagToEntity(entityType, entityId, tag);

        // Revert if failed
        if (!result || !result.success) {
          setSelectedTags((prev) => prev.filter((t) => t !== tag));
          return false;
        }

        return true;
      } finally {
        // Clear loading state
        setAddingTags((prev) => ({ ...prev, [tag]: false }));
      }
    },
    [selectedTags, entityId, entityType, addTagToEntity]
  );

  // Remove a tag from selection
  const removeTag = useCallback(
    async (tag: string): Promise<boolean> => {
      // Skip if not selected
      if (!selectedTags.includes(tag)) {
        return true;
      }

      // Update local state optimistically
      setSelectedTags((prev) => prev.filter((t) => t !== tag));

      // If no entity ID, just update local state (new entity)
      if (!entityId) {
        return true;
      }

      // Track loading state
      setRemovingTags((prev) => ({ ...prev, [tag]: true }));

      try {
        // Remove from remote entity
        const result = await removeTagFromEntity(entityType, entityId, tag);

        // Revert if failed
        if (!result || !result.success) {
          setSelectedTags((prev) => [...prev, tag]);
          return false;
        }

        return true;
      } finally {
        // Clear loading state
        setRemovingTags((prev) => ({ ...prev, [tag]: false }));
      }
    },
    [selectedTags, entityId, entityType, removeTagFromEntity]
  );

  // Clear all selected tags
  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Check if a tag is being added
  const isAddingTag = useCallback(
    (tag: string) => {
      return Boolean(addingTags[tag]);
    },
    [addingTags]
  );

  // Check if a tag is being removed
  const isRemovingTag = useCallback(
    (tag: string) => {
      return Boolean(removingTags[tag]);
    },
    [removingTags]
  );

  // Get suggestions based on tags from API and search query
  const suggestions = useMemo(() => {
    const tagNames = allTags?.map((tag) => tag.name) || [];
    // Filter by search query and exclude already selected tags
    return tagNames.filter(
      (tag) =>
        !selectedTags.includes(tag) &&
        (!debouncedSearchQuery || tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );
  }, [allTags, selectedTags, debouncedSearchQuery]);

  // Trigger search
  const searchTags = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    selectedTags,
    suggestions,
    isLoadingSuggestions: isLoading && Boolean(debouncedSearchQuery),
    addTag,
    removeTag,
    searchTags,
    isAddingTag,
    isRemovingTag,
    clearTags,
    error,
  };
}
