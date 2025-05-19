import { useState, useCallback } from 'react';
import { searchUnsplashImages, searchPexelsImages, saveImage } from '@/lib/client/images';
import { useToast } from '@/hooks/use-toast';
import { Result, createSuccess, createFailure } from '@/lib/client/result';

export interface ImageSearchResult {
  id: string;
  url: string;
  smallUrl?: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  description?: string;
  alt_description?: string;
  photographer?: string;
  photographer_url?: string;
  source: 'unsplash' | 'pexels';
  source_id: string;
  download_url?: string;
  attribution?: string;
  attribution_html?: string;
}

export interface ImageSearchResults {
  results: ImageSearchResult[];
  total: number;
  total_pages: number;
}

export interface UseImageSearchProps {
  /** Whether to show toast messages on success/error */
  showToasts?: boolean;
}

export interface UseImageSearchResult {
  /** Array of image search results */
  results: ImageSearchResult[];
  /** Total number of results (for pagination) */
  total: number;
  /** Total pages available (for pagination) */
  totalPages: number;
  /** Current page being viewed */
  currentPage: number;
  /** Whether search is currently loading */
  isLoading: boolean;
  /** Error message if search failed */
  error: string | null;
  /** Search for images from a specific provider */
  searchImages: (query: string, provider: 'unsplash' | 'pexels', page?: number, perPage?: number) => Promise<Result<ImageSearchResults>>;
  /** Save an image for reuse */
  saveImage: (imageData: Partial<ImageSearchResult>) => Promise<Result<{ id: string; url: string }>>;
  /** Set the current page for pagination */
  setPage: (page: number) => void;
}

/**
 * Hook for searching and managing images from providers like Unsplash and Pexels
 */
export function useImageSearch({ showToasts = true }: UseImageSearchProps = {}): UseImageSearchResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  /**
   * Normalize results from different providers to a common format
   */
  const normalizeResults = (data: any, provider: 'unsplash' | 'pexels'): ImageSearchResults => {
    if (provider === 'unsplash') {
      const normalizedResults = data.results?.map((item: any) => ({
        id: item.id,
        url: item.urls?.regular || item.urls?.full,
        smallUrl: item.urls?.small,
        thumbnailUrl: item.urls?.thumb,
        width: item.width,
        height: item.height,
        description: item.description || item.alt_description,
        alt_description: item.alt_description,
        photographer: item.user?.name,
        photographer_url: item.user?.links?.html,
        source: 'unsplash' as const,
        source_id: item.id,
        download_url: item.links?.download,
        attribution: `Photo by ${item.user?.name} on Unsplash`,
        attribution_html: `Photo by <a href="${item.user?.links?.html}">${item.user?.name}</a> on <a href="https://unsplash.com">Unsplash</a>`
      })) || [];

      return {
        results: normalizedResults,
        total: data.total || 0,
        total_pages: data.total_pages || 0
      };
    } else {
      const normalizedResults = data.photos?.map((item: any) => ({
        id: item.id,
        url: item.src?.large || item.src?.original,
        smallUrl: item.src?.medium,
        thumbnailUrl: item.src?.small,
        width: item.width,
        height: item.height,
        description: item.alt || item.photographer,
        photographer: item.photographer,
        photographer_url: item.photographer_url,
        source: 'pexels' as const,
        source_id: item.id,
        download_url: item.src?.original,
        attribution: `Photo by ${item.photographer} on Pexels`,
        attribution_html: `Photo by <a href="${item.photographer_url}">${item.photographer}</a> on <a href="https://pexels.com">Pexels</a>`
      })) || [];

      return {
        results: normalizedResults,
        total: data.total_results || 0,
        total_pages: Math.ceil((data.total_results || 0) / data.per_page) || 0
      };
    }
  };

  const searchImages = useCallback(
    async (query: string, provider: 'unsplash' | 'pexels', page = 1, perPage = 20): Promise<Result<ImageSearchResults>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        let result;
        if (provider === 'unsplash') {
          result = await searchUnsplashImages(query, page, perPage);
        } else {
          result = await searchPexelsImages(query, page, perPage);
        }
        
        setIsLoading(false);
        setCurrentPage(page);
        
        if (result.success) {
          const normalized = normalizeResults(result.data, provider);
          setResults(normalized.results);
          setTotal(normalized.total);
          setTotalPages(normalized.total_pages);
          return createSuccess(normalized);
        } else {
          const errorMsg = result.error || `Failed to search ${provider} images`;
          setError(errorMsg);
          if (showToasts) {
            toast({
              title: 'Search failed',
              description: errorMsg,
              variant: 'destructive',
            });
          }
          return createFailure(errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error searching images';
        setIsLoading(false);
        setError(errorMsg);
        if (showToasts) {
          toast({
            title: 'Search error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
        return createFailure(errorMsg);
      }
    },
    [toast, showToasts]
  );

  const saveImageToLibrary = useCallback(
    async (imageData: Partial<ImageSearchResult>): Promise<Result<{ id: string; url: string }>> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await saveImage({
          url: imageData.url,
          source: imageData.source,
          source_id: imageData.source_id,
          width: imageData.width,
          height: imageData.height,
          alt_text: imageData.alt_description || imageData.description,
          attribution: imageData.attribution,
          attribution_html: imageData.attribution_html,
          photographer_name: imageData.photographer,
          photographer_url: imageData.photographer_url,
        });
        
        setIsLoading(false);
        
        if (result.success) {
          if (showToasts) {
            toast({
              title: 'Image saved',
              description: 'The image has been saved to your library',
              variant: 'default',
            });
          }
          return result as Result<{ id: string; url: string }>;
        } else {
          const errorMsg = result.error || 'Failed to save image';
          setError(errorMsg);
          if (showToasts) {
            toast({
              title: 'Save failed',
              description: errorMsg,
              variant: 'destructive',
            });
          }
          return result as Result<{ id: string; url: string }>;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error saving image';
        setIsLoading(false);
        setError(errorMsg);
        if (showToasts) {
          toast({
            title: 'Save error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
        return createFailure(errorMsg);
      }
    },
    [toast, showToasts]
  );

  return {
    isLoading,
    error,
    results,
    total,
    totalPages,
    currentPage,
    searchImages,
    saveImage: saveImageToLibrary,
    setPage: setCurrentPage,
  };
} 