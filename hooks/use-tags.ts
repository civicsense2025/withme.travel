'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/supabase';
import type { TypedSupabaseClient } from '@/utils/supabase/browser-client';
import { Result, success } from '@/utils/result';
import type { Tag } from '@/utils/constants/database.types';
import {
  listTags,
  searchTags,
  createTag,
  deleteTag,
  addTagToEntity,
  removeTagFromEntity,
} from '@/lib/client/tags';

export type TagSuggestion = {
  id: string;
  tag_id: string;
  destination_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
};

/**
 * Params for useTags hook
 */
interface UseTagsParams {
  /** Type of entity to fetch tags for */
  entityType?: string;
  /** ID of entity to fetch tags for */
  entityId?: string;
  /** Whether to fetch tags on mount */
  fetchOnMount?: boolean;
}

/**
 * Return type for useTags hook
 */
interface UseTagsResult {
  /** Array of tags */
  tags: Tag[];
  /** Whether tags are currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to refresh tags */
  refreshTags: () => Promise<void>;
  /** Function to add a tag to the current entity */
  addTag: (tagName: string) => Promise<boolean>;
  /** Function to remove a tag from the current entity */
  removeTag: (tagName: string) => Promise<boolean>;
  /** Function to create a new tag */
  createNewTag: (tagData: Partial<Tag>) => Promise<Tag | null>;
  /** Function to search for tags */
  searchForTags: (query: string) => Promise<Tag[]>;
}

/**
 * Type guard to check if a result is successful
 */
function isSuccess<T>(result: Result<T, Error>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is a failure
 */
function isFailure<T>(result: Result<T, Error>): result is { success: false; error: Error } {
  return result.success === false;
}

/**
 * Hook for managing tags with loading states and error handling
 */
export function useTags({
  entityType,
  entityId,
  fetchOnMount = true,
}: UseTagsParams = {}): UseTagsResult {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<TypedSupabaseClient | null>(null);

  // Initialize Supabase client safely in an effect
  useEffect(() => {
    // Only import and initialize in browser environment
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/browser-client').then(({ getBrowserClient }) => {
        setSupabase(getBrowserClient());
      });
    }
  }, []);

  /**
   * Fetches tags for the specified entity
   */
  const refreshTags = useCallback(async () => {
    if (!entityType) return;

    setIsLoading(true);
    setError(null);

    const result = await listTags(entityType, entityId);

    if (isSuccess(result)) {
      setTags(result.data);
    } else {
      setError(result.error.message || 'Failed to fetch tags');
    }

    setIsLoading(false);
  }, [entityType, entityId]);

  /**
   * Adds a tag to the current entity
   */
  const addTag = useCallback(
    async (tagName: string): Promise<boolean> => {
      if (!entityType || !entityId) {
        setError('Entity type and ID are required to add a tag');
        return false;
      }

      setIsLoading(true);
      setError(null);

      const result = await addTagToEntity(entityType, entityId, tagName);

      if (isSuccess(result)) {
        await refreshTags();
        return true;
      } else {
        setError(result.error.message || 'Failed to add tag');
        setIsLoading(false);
        return false;
      }
    },
    [entityType, entityId, refreshTags]
  );

  /**
   * Removes a tag from the current entity
   */
  const removeTag = useCallback(
    async (tagName: string): Promise<boolean> => {
      if (!entityType || !entityId) {
        setError('Entity type and ID are required to remove a tag');
        return false;
      }

      setIsLoading(true);
      setError(null);

      const result = await removeTagFromEntity(entityType, entityId, tagName);

      if (isSuccess(result)) {
        await refreshTags();
        return true;
      } else {
        setError(result.error.message || 'Failed to remove tag');
        setIsLoading(false);
        return false;
      }
    },
    [entityType, entityId, refreshTags]
  );

  /**
   * Creates a new tag
   */
  const createNewTag = useCallback(
    async (tagData: Partial<Tag>): Promise<Tag | null> => {
      setIsLoading(true);
      setError(null);

      const result = await createTag(tagData);

      setIsLoading(false);

      if (isSuccess(result)) {
        if (entityType && entityId) {
          await addTagToEntity(entityType, entityId, result.data.name);
          await refreshTags();
        }
        return result.data;
      } else {
        setError(result.error.message || 'Failed to create tag');
        return null;
      }
    },
    [entityType, entityId, refreshTags]
  );

  /**
   * Searches for tags by query
   */
  const searchForTags = useCallback(async (query: string): Promise<Tag[]> => {
    if (!query) return [];

    setIsLoading(true);
    setError(null);

    const result = await searchTags(query);

    setIsLoading(false);

    if (isSuccess(result)) {
      return result.data;
    } else {
      setError(result.error.message || 'Failed to search tags');
      return [];
    }
  }, []);

  // Fetch tags on mount if requested
  useEffect(() => {
    if (fetchOnMount && entityType) {
      refreshTags();
    }
  }, [fetchOnMount, entityType, refreshTags]);

  return {
    tags,
    isLoading,
    error,
    refreshTags,
    addTag,
    removeTag,
    createNewTag,
    searchForTags,
  };
}
