/**
 * useItineraryTemplate
 *
 * Hook for fetching a single itinerary template (by id or slug).
 * Uses the client API and useAsyncData for consistent state and error handling.
 *
 * @module hooks/use-itinerary-template
 */

'use client';

// External dependencies
import { useCallback } from 'react';

// Internal modules
import { useAsyncData } from '@/lib/hooks/use-async-data';
import {
  getTemplate,
  type ItineraryTemplate,
  type TemplateSection,
} from '@/lib/client/itineraries';

// Types
import type { AsyncDataResult } from '@/lib/hooks/use-async-data';

// ============================================================================
// HOOK: useItineraryTemplate
// ============================================================================

/**
 * Provides access to a single itinerary template and its sections
 * @returns {
 *   ...AsyncDataResult<ItineraryTemplate & { sections: TemplateSection[] } | null>,
 *   template: ItineraryTemplate & { sections: TemplateSection[] } | null,
 *   sections: TemplateSection[]
 * }
 * Note: `template` and `sections` may be null/empty if not found.
 */
export function useItineraryTemplate(idOrSlug: string) {
  // Fetch the template and its sections (nullable)
  const result = useAsyncData<ItineraryTemplate & { sections: TemplateSection[] } | null>(
    () => getTemplate(idOrSlug).then(r => (r.success ? r.data : null)),
    {
      loadOnMount: true,
      dependencies: [idOrSlug],
      errorMessage: 'Failed to load itinerary template',
    }
  );

  // Reload function (alias for reload)
  const reload = useCallback(() => result.reload(), [result]);

  return {
    ...result,
    reload,
    template: result.data,
    sections: result.data?.sections ?? [],
  };
} 