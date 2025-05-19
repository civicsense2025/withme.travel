/**
 * Tags Custom Hook
 * 
 * Provides tag management functionality for components
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  listTags,
  getTag, 
  createTag, 
  deleteTag, 
  addTagToEntity, 
  removeTagFromEntity,
  searchTags 
} from '@/lib/client/tags';
import { isSuccess } from '@/utils/result';
import type { Tag, TagInput, VoteDirection } from '@/components/features/tags/types';

/**
 * UseTags hook parameters
 */
interface UseTagsParams {
  /** Entity ID to manage tags for */
  entityId?: string;
  /** Entity type to manage tags for */
  entityType?: string;
}

/**
 * UseTags hook return value
 */
interface UseTagsReturn {
  /** Tags data */
  tags: Tag[];
  /** Whether tags are loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Refresh tags data */
  refresh: () => Promise<void>;
  /** Add a new tag */
  addTag: (tagInput: TagInput) => Promise<Tag | null>;
  /** Remove a tag */
  removeTag: (tagId: string) => Promise<void>;
  /** Vote on a tag (not currently implemented in the API) */
  voteOnTag: (tag: Tag, direction: VoteDirection) => Promise<void>;
  /** Add an existing tag to the entity */
  addExistingTag: (tagId: string) => Promise<void>;
  /** Remove a tag from the entity */
  removeTagFromEntity: (tagId: string) => Promise<void>;
}

/**
 * Custom hook for tag management
 */
export function useTags({ entityId, entityType = 'general' }: UseTagsParams = {}): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listTags(entityType, entityId);
      
      if (!isSuccess(response)) {
        throw new Error(response.error.message || String(response.error));
      }
      
      setTags(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType]);

  const addTag = useCallback(async (tagInput: TagInput): Promise<Tag | null> => {
    try {
      const response = await createTag(tagInput);
      
      if (!isSuccess(response)) {
        throw new Error(response.error.message || String(response.error));
      }
      
      const newTag = response.data;
      
      if (newTag && entityId && entityType) {
        // If we have an entity, also add the tag to it
        const addResult = await addTagToEntity(entityType, entityId, newTag.id);
        
        if (!isSuccess(addResult)) {
          console.warn('Failed to associate tag with entity:', addResult.error.message || String(addResult.error));
        }
      }
      
      await refresh();
      return newTag || null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create tag'));
      console.error('Error creating tag:', err);
      return null;
    }
  }, [entityId, entityType, refresh]);

  const removeTag = useCallback(async (tagId: string): Promise<void> => {
    try {
      const response = await deleteTag(tagId);
      
      if (!isSuccess(response)) {
        throw new Error(response.error.message || String(response.error));
      }
      
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete tag'));
      console.error('Error deleting tag:', err);
    }
  }, [refresh]);

  const voteOnTag = useCallback(async (tag: Tag, direction: VoteDirection): Promise<void> => {
    // Note: This functionality doesn't exist in the API yet
    // This is a placeholder for future implementation
    try {
      console.warn('Tag voting is not implemented in the API yet');
      // When implemented, it would be something like:
      // const response = await voteTag(tag.id, direction);
      // if (!isSuccess(response)) {
      //   throw new Error(response.error.message || String(response.error));
      // }
      
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to vote on tag'));
      console.error('Error voting on tag:', err);
    }
  }, [refresh]);

  const addExistingTag = useCallback(async (tagId: string): Promise<void> => {
    if (!entityId || !entityType) {
      setError(new Error('Entity ID and type required to add tags'));
      return;
    }

    try {
      const response = await addTagToEntity(entityType, entityId, tagId);
      
      if (!isSuccess(response)) {
        throw new Error(response.error.message || String(response.error));
      }
      
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add tag to entity'));
      console.error('Error adding tag to entity:', err);
    }
  }, [entityId, entityType, refresh]);

  const removeFromEntity = useCallback(async (tagId: string): Promise<void> => {
    if (!entityId || !entityType) {
      setError(new Error('Entity ID and type required to remove tags'));
      return;
    }

    try {
      const response = await removeTagFromEntity(entityType, entityId, tagId);
      
      if (!isSuccess(response)) {
        throw new Error(response.error.message || String(response.error));
      }
      
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove tag from entity'));
      console.error('Error removing tag from entity:', err);
    }
  }, [entityId, entityType, refresh]);

  // Load tags on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    tags,
    isLoading,
    error,
    refresh,
    addTag,
    removeTag,
    voteOnTag,
    addExistingTag,
    removeTagFromEntity: removeFromEntity
  };
} 