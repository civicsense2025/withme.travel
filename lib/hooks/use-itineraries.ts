/**
 * useItineraries Hook
 *
 * Manages itinerary templates state, CRUD operations, and related functionality.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  getPopularTemplates,
  type ItineraryTemplate,
  type CreateTemplateParams,
  type ListTemplatesParams,
} from '@/lib/client/itineraries';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useItineraries
 */
export interface UseItinerariesResult {
  templates: ItineraryTemplate[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createNewTemplate: (data: CreateTemplateParams) => Promise<Result<ItineraryTemplate>>;
  updateTemplateDetails: (
    id: string,
    data: Partial<CreateTemplateParams>
  ) => Promise<Result<ItineraryTemplate>>;
  removeTemplate: (id: string) => Promise<Result<void>>;
  getTemplateByIdOrSlug: (idOrSlug: string) => Promise<Result<ItineraryTemplate & { sections: any[] }>>;
  applyTemplate: (
    slug: string,
    data: { name: string; description?: string; startDate?: string }
  ) => Promise<Result<{ tripId: string }>>;
  loadPopularTemplates: (limit?: number) => Promise<void>;
  popularTemplates: ItineraryTemplate[];
}

/**
 * useItineraries - React hook for managing itinerary templates
 */
export function useItineraries(
  /** Initial parameters for listing templates */
  initialParams: ListTemplatesParams = { isPublished: true },
  /** Whether to fetch templates on component mount */
  fetchOnMount = true
): UseItinerariesResult {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<ItineraryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listTemplates(initialParams);
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        setError(result.error);
        toast({
          description: `Failed to load templates: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading templates';
      setError(errorMessage);
      toast({
        description: `Error: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialParams, toast]);

  // Create a new template
  const createNewTemplate = useCallback(
    async (data: CreateTemplateParams): Promise<Result<ItineraryTemplate>> => {
      setIsLoading(true);
      
      try {
        const result = await createTemplate(data);
        
        if (result.success) {
          setTemplates((prev) => [result.data, ...prev]);
          toast({
            description: 'Template created successfully',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to create template: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error creating template';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Update a template
  const updateTemplateDetails = useCallback(
    async (
      id: string,
      data: Partial<CreateTemplateParams>
    ): Promise<Result<ItineraryTemplate>> => {
      setIsLoading(true);
      
      try {
        const result = await updateTemplate(id, data);
        
        if (result.success) {
          setTemplates((prev) =>
            prev.map((template) => (template.id === id ? result.data : template))
          );
          toast({
            description: 'Template updated successfully',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to update template: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error updating template';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Delete a template
  const removeTemplate = useCallback(
    async (id: string): Promise<Result<void>> => {
      setIsLoading(true);
      
      try {
        const result = await deleteTemplate(id);
        
        if (result.success) {
          setTemplates((prev) => prev.filter((template) => template.id !== id));
          toast({
            description: 'Template deleted successfully',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to delete template: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting template';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Get a template by ID or slug
  const getTemplateByIdOrSlug = useCallback(
    async (idOrSlug: string): Promise<Result<ItineraryTemplate & { sections: any[] }>> => {
      setIsLoading(true);
      
      try {
        const result = await getTemplate(idOrSlug);
        
        if (!result.success) {
          setError(result.error);
          toast({
            description: `Failed to get template: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error getting template';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Apply a template to create a trip
  const applyTemplate = useCallback(
    async (
      slug: string,
      data: { name: string; description?: string; startDate?: string }
    ): Promise<Result<{ tripId: string }>> => {
      setIsLoading(true);
      
      try {
        const result = await useTemplate(slug, data);
        
        if (result.success) {
          toast({
            description: 'Template applied successfully',
          });
        } else {
          setError(result.error);
          toast({
            description: `Failed to apply template: ${result.error}`,
            variant: 'destructive',
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error applying template';
        setError(errorMessage);
        toast({
          description: `Error: ${errorMessage}`,
          variant: 'destructive',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Load popular templates
  const loadPopularTemplates = useCallback(
    async (limit: number = 5) => {
      setIsLoading(true);
      
      try {
        const result = await getPopularTemplates(limit);
        
        if (result.success) {
          setPopularTemplates(result.data);
        } else {
          toast({
            description: `Failed to load popular templates: ${result.error}`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast({
          description: `Error loading popular templates: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Initial load
  useEffect(() => {
    if (fetchOnMount) {
      refresh();
    }
  }, [fetchOnMount, refresh]);

  return {
    templates,
    isLoading,
    error,
    refresh,
    createNewTemplate,
    updateTemplateDetails,
    removeTemplate,
    getTemplateByIdOrSlug,
    applyTemplate,
    loadPopularTemplates,
    popularTemplates,
  };
} 