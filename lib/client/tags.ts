/**
 * Tags API Client
 *
 * Client-side wrapper for the Tags API providing type-safe access to tag operations
 */

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import type { Tag } from '@/types';

/**
 * List all tags for an entity
 */
export async function listTags(entityType: string, entityId?: string): Promise<Result<Tag[]>> {
  const params = new URLSearchParams();
  if (entityType) params.set('entityType', entityType);
  if (entityId) params.set('entityId', entityId);

  return tryCatch(
    fetch(`${API_ROUTES.TAGS}?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tags');
      }
      return response.json();
    })
  );
}

/**
 * Get a single tag by ID
 */
export async function getTag(tagId: string): Promise<Result<Tag>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/${tagId}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tag');
      }
      return response.json();
    })
  );
}

/**
 * Create a new tag
 */
export async function createTag(data: Partial<Tag>): Promise<Result<Tag>> {
  return tryCatch(
    fetch(API_ROUTES.TAGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }
      return response.json();
    })
  );
}

/**
 * Update an existing tag
 */
export async function updateTag(tagId: string, data: Partial<Tag>): Promise<Result<Tag>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/${tagId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tag');
      }
      return response.json();
    })
  );
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<Result<void>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/${tagId}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tag');
      }
      return;
    })
  );
}

/**
 * Search for tags by query
 */
export async function searchTags(query: string): Promise<Result<Tag[]>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search tags');
      }
      return response.json();
    })
  );
}

/**
 * Add a tag to an entity
 */
export async function addTagToEntity(
  entityType: string,
  entityId: string,
  tagName: string
): Promise<Result<void>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/entity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityType,
        entityId,
        tagName,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tag to entity');
      }
      return;
    })
  );
}

/**
 * Remove a tag from an entity
 */
export async function removeTagFromEntity(
  entityType: string,
  entityId: string,
  tagName: string
): Promise<Result<void>> {
  return tryCatch(
    fetch(`${API_ROUTES.TAGS}/entity`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityType,
        entityId,
        tagName,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove tag from entity');
      }
      return;
    })
  );
}
