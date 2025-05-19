/**
 * useItineraryTemplates
 *
 * Hook for fetching and managing itinerary templates ("itineraries").
 * Uses the client API and useAsyncData for consistent state and error handling.
 *
 * @module hooks/use-itinerary-templates
 */

'use client';

// External dependencies
import { useCallback } from 'react';

// Internal modules
import { useAsyncData } from '@/lib/hooks/use-async-data';
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getPopularTemplates,
  type ItineraryTemplate,
  type CreateTemplateParams,
  type ListTemplatesParams,
} from '@/lib/client/itineraries';

// Types
import type { AsyncDataResult } from '@/lib/hooks/use-async-data';

// ============================================================================
// HOOK: useItineraryTemplates
// ============================================================================

/**
 * Provides access to itinerary templates (list, create, update, delete, popular)
 */
export function useItineraryTemplates(params: ListTemplatesParams = {}) {
  // Fetch all templates
  const templatesResult = useAsyncData<ItineraryTemplate[]>(
    () => listTemplates(params).then(r => (r.success ? r.data : [])),
    {
      loadOnMount: true,
      dependencies: [JSON.stringify(params)],
      errorMessage: 'Failed to load itinerary templates',
    }
  );

  // Fetch popular templates
  const getPopular = useCallback(
    async (limit = 5) => {
      const result = await getPopularTemplates(limit);
      return result.success ? result.data : [];
    },
    []
  );

  // Create a new template
  const create = useCallback(
    async (data: CreateTemplateParams) => {
      const result = await createTemplate(data);
      return result.success ? result.data : null;
    },
    []
  );

  // Update a template
  const update = useCallback(
    async (id: string, data: Partial<CreateTemplateParams>) => {
      const result = await updateTemplate(id, data);
      return result.success ? result.data : null;
    },
    []
  );

  // Delete a template
  const remove = useCallback(
    async (id: string) => {
      const result = await deleteTemplate(id);
      return result.success;
    },
    []
  );

  return {
    ...templatesResult,
    createTemplate: create,
    updateTemplate: update,
    deleteTemplate: remove,
    getPopularTemplates: getPopular,
  };
} 