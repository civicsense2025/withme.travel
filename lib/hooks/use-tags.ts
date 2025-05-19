/**
 * Tags Management Hook
 * 
 * Provides functionality for fetching, creating, and managing tags for various entities.
 * Supports searching, adding, removing, and creating tags with proper error handling.
 * 
 * @module hooks/use-tags
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/lib/hooks/use-toast';
import { createTag, deleteTag, listTags, searchTags as apiSearchTags } from '@/lib/client/tags';
import { Tag } from '@/lib/api/_shared';
import { isSuccess, isFailure, Result } from '@/lib/utils/result';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tag suggestion from admin or user
 */
export type TagSuggestion = {
  /** Unique identifier for the suggestion */
  id: string;
  /** Reference to the tag that was suggested */
  tag_id: string;
  /** Reference to the destination this tag is suggested for */
  destination_id: string;
  /** Current status of the suggestion */
  status: 'pending' | 'approved' | 'rejected';
  /** Optional notes from an admin about the suggestion */
  admin_notes: string | null;
};

/**
 * Parameters for useTags hook
 */
export interface UseTagsParams {
  /** Type of entity to fetch tags for (e.g., "trip", "destination") */
  entityType?: string;
  /** ID of entity to fetch tags for */
  entityId?: string;
  /** Whether to fetch tags on mount (default: true) */
  fetchOnMount?: boolean;
}

/**
 * Return type for useTags hook
 */
export interface UseTagsResult {
  /** Array of tags for the entity */
  tags: Tag[];
  /** Whether tags are currently loading */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
  /** Function to refresh tags data */
  refreshTags: () => Promise<void>;
  /** Function to add a tag to the current entity */
  addTag: (tagName: string) => Promise<boolean>;
  /** Function to remove a tag from the current entity */
  removeTag: (tagName: string) => Promise<boolean>;
  /** Function to create a new tag with custom data */
  createNewTag: (tagData: Partial<Tag>) => Promise<Tag | null>;
  /** Function to search for tags across the system */
  searchForTags: (query: string) => Promise<Tag[]>;
  /** Alias for addTag (for compatibility) */
  addTagToEntity: (tagName: string) => Promise<boolean>;
  /** Alias for removeTag (for compatibility) */
  removeTagFromEntity: (tagName: string) => Promise<boolean>;
  /** Alias for searchForTags (for compatibility) */
  searchTags: (query: string) => Promise<Tag[]>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing tags for entities
 * 
 * @param params - Configuration options for the hook
 * @returns Object containing tags data and management functions
 */
export function useTags({
  entityType,
  entityId,
  fetchOnMount = true,
}: UseTagsParams = {}): UseTagsResult {
  // ========== State ==========
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // ========== Dependencies ==========
  const { toast } = useToast();
  const { user } = useAuth();

  // ========== Fetch Logic ==========
  const refreshTags = useCallback(async (): Promise<void> => {
    // Skip if we don't have necessary parameters
    if (!entityType || !entityId) {
      setTags([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await listTags(entityType, entityId);
      
      if (isSuccess(result)) {
        setTags(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Error',
          description: `Failed to load tags: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to load tags: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId, toast]);

  // ========== Add Tag Logic ==========
  const addTag = useCallback(
    async (tagName: string): Promise<boolean> => {
      // Validate inputs
      if (!entityType || !entityId) {
        const errorMessage = 'Entity type and ID are required';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      if (!tagName.trim()) {
        const errorMessage = 'Tag name is required';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Create tag data with proper entity information
        const tagData: Partial<Tag> = {
          name: tagName.trim(),
          entity_type: entityType,
          entity_id: entityId,
          created_by: user?.id,
        };
        
        const result = await createTag(tagData);
        
        if (isSuccess(result)) {
          // Optimistically update UI
          setTags(prevTags => [...prevTags, result.data]);
          
          toast({
            title: 'Success',
            description: `Tag "${tagName}" added successfully`,
          });
          
          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to add tag';
        
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [entityType, entityId, user?.id, toast]
  );

  // ========== Remove Tag Logic ==========
  const removeTag = useCallback(
    async (tagName: string): Promise<boolean> => {
      // Validate inputs
      if (!entityType || !entityId) {
        const errorMessage = 'Entity type and ID are required';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      if (!tagName.trim()) {
        const errorMessage = 'Tag name is required';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Find the tag ID first by searching
        const searchResult = await apiSearchTags(tagName);
        
        if (isSuccess(searchResult)) {
          // Find the exact tag for this entity
          const tagToRemove = searchResult.data.find(tag => 
            tag.name === tagName && 
            tag.entity_type === entityType && 
            tag.entity_id === entityId
          );
          
          if (!tagToRemove) {
            throw new Error('Tag not found for this entity');
          }
          
          const deleteResult = await deleteTag(tagToRemove.id);
          
          if (isSuccess(deleteResult)) {
            // Optimistically update UI
            setTags(prevTags => 
              prevTags.filter(tag => tag.id !== tagToRemove.id)
            );
            
            toast({
              title: 'Success',
              description: `Tag "${tagName}" removed successfully`,
            });
            
            return true;
          } else {
            throw new Error(deleteResult.error);
          }
        } else {
          throw new Error(searchResult.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to remove tag';
        
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [entityType, entityId, toast]
  );

  // ========== Create Tag Logic ==========
  const createNewTag = useCallback(
    async (tagData: Partial<Tag>): Promise<Tag | null> => {
      if (!tagData.name?.trim()) {
        toast({
          title: 'Error',
          description: 'Tag name is required',
          variant: 'destructive',
        });
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure creator ID is included
        const enrichedTagData: Partial<Tag> = {
          ...tagData,
          created_by: tagData.created_by || user?.id,
        };
        
        const result = await createTag(enrichedTagData);
        
        if (isSuccess(result)) {
          // If this tag was created for the current entity, update our local state
          if (
            enrichedTagData.entity_type === entityType &&
            enrichedTagData.entity_id === entityId
          ) {
            setTags(prevTags => [...prevTags, result.data]);
          }
          
          toast({
            title: 'Success',
            description: `Tag "${tagData.name}" created successfully`,
          });
          
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to create tag';
        
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [entityType, entityId, user?.id, toast]
  );

  // ========== Search Logic ==========
  const searchForTags = useCallback(
    async (query: string): Promise<Tag[]> => {
      if (!query.trim()) {
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await apiSearchTags(query);
        
        if (isSuccess(result)) {
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to search tags';
        
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // ========== Initial Data Loading ==========
  useEffect(() => {
    if (fetchOnMount && entityType && entityId) {
      refreshTags();
    }
  }, [fetchOnMount, entityType, entityId, refreshTags]);

  // Return the hook's API
  return {
    tags,
    isLoading,
    error,
    refreshTags,
    addTag,
    removeTag,
    createNewTag,
    searchForTags,
    // Compatibility aliases
    addTagToEntity: addTag,
    removeTagFromEntity: removeTag,
    searchTags: searchForTags,
  };
}
