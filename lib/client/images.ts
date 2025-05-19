// ============================================================================
// IMAGES API CLIENT
// ============================================================================

/**
 * Images API Client
 *
 * Client-side wrapper for image search, upload, and thumbnail generation.
 * Uses the standardized Result pattern and matches other client conventions.
 */

import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';

/**
 * Search Unsplash images
 * @param query - Search query
 * @param page - Page number
 * @param perPage - Results per page
 */
export async function searchUnsplashImages(query: string, page = 1, perPage = 20): Promise<Result<any>> {
  return tryCatch(
    fetch(`/api/images/search-unsplash?query=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => response.json())
  );
}

/**
 * Search Pexels images
 * @param query - Search query
 * @param page - Page number
 * @param perPage - Results per page
 */
export async function searchPexelsImages(query: string, page = 1, perPage = 20): Promise<Result<any>> {
  return tryCatch(
    fetch(`/api/images/search-pexels?query=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => response.json())
  );
}

/**
 * Save an image to the database
 * @param imageData - Image metadata and info
 */
export async function saveImage(imageData: any): Promise<Result<any>> {
  return tryCatch(
    fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageData),
    }).then((response) => response.json())
  );
}

/**
 * Generate a thumbnail image (not implemented yet)
 * @param options - Thumbnail generation options
 */
export async function generateThumbnail(options: {
  title: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  tags?: string;
  usePadding?: boolean;
}): Promise<Result<Buffer>> {
  return tryCatch(
    fetch('/api/images/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }).then((response) => response.json())
  );
}

/**
 * Type guard to check if an object is an Image
 */
export function isImage(obj: any): obj is { id: string; url: string } {
  return obj && typeof obj.id === 'string' && typeof obj.url === 'string';
} 