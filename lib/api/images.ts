/**
 * Images API
 *
 * Provides operations for image management, searching, and generation.
 * Used for handling various image types across the application.
 *
 * @module lib/api/images
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { Result, handleError } from '@/lib/client/result';
import { searchUnsplash } from '@/lib/unsplashService';
import { searchPexels } from '@/lib/pexelsService';
import sharp from 'sharp';
import { getTypedDbClient, createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ENUMS } from '@/utils/constants/status';
import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const imageSaveSchema = z.object({
  url: z.string().url(),
  imageType: z.enum([
    ENUMS.IMAGE_TYPE.DESTINATION,
    ENUMS.IMAGE_TYPE.TRIP_COVER,
    ENUMS.IMAGE_TYPE.USER_AVATAR,
    ENUMS.IMAGE_TYPE.TEMPLATE_COVER,
  ]),
  alt: z.string().optional(),
  refId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const thumbnailOptionsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  tags: z.string().optional(),
  usePadding: z.boolean().optional(),
});

export type ThumbnailOptions = z.infer<typeof thumbnailOptionsSchema>;
type ImageSaveData = z.infer<typeof imageSaveSchema>;

interface Image {
  id: string;
  url: string;
  image_url: string;
  alt_text?: string;
  source?: string;
  external_id?: string;
  created_by?: string;
  photographer?: string;
  photographer_url?: string;
  trip_id?: string;
  user_id?: string;
  destination_id?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search Unsplash for images with pagination.
 * @param query - Search query string
 * @param options - Search options
 * @returns Result containing search results
 */
export async function searchUnsplashImages(
  query: string,
  options: { page?: number; perPage?: number } = {}
): Promise<Result<any>> {
  const { page = 1, perPage = 20 } = options;
  try {
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }
    
    const result = await searchUnsplash(query, { page, perPage });
    
    if ('error' in result) {
      return { 
        success: false, 
        error: result.error ?? 'Failed to search Unsplash'
      };
    }
    
    return { 
      success: true, 
      data: { 
        photos: result.results, 
        totalPages: result.totalPages ?? 1 
      } 
    };
  } catch (error: any) {
    return handleError(error, 'Failed to search Unsplash images');
  }
}

/**
 * Search Pexels for images with pagination.
 * @param query - Search query string
 * @param options - Search options
 * @returns Result containing search results
 */
export async function searchPexelsImages(
  query: string,
  options: { page?: number; perPage?: number } = {}
): Promise<Result<any>> {
  const { page = 1, perPage = 20 } = options;
  try {
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }
    
    const result = await searchPexels(query, perPage);
    
    if ('error' in result) {
      return { 
        success: false, 
        error: result.error ?? 'Failed to search Pexels'
      };
    }
    
    const totalPages = 'totalPages' in result && typeof result.totalPages === 'number' 
      ? result.totalPages 
      : 1;
      
    return { 
      success: true, 
      data: { 
        photos: result.photos, 
        totalPages 
      } 
    };
  } catch (error: any) {
    return handleError(error, 'Failed to search Pexels images');
  }
}

/**
 * Search both Unsplash and Pexels simultaneously with fallback.
 * @param query - Search query string
 * @param options - Search options
 * @returns Result containing combined search results
 */
export async function searchAllImages(
  query: string,
  options: {
    page?: number;
    perPage?: number;
    preferredSource?: 'unsplash' | 'pexels';
  } = {}
): Promise<Result<any>> {
  const { page = 1, perPage = 20, preferredSource = 'unsplash' } = options;
  
  try {
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }
    
    // Try preferred source first
    const primarySource = preferredSource === 'unsplash' 
      ? searchUnsplashImages(query, { page, perPage })
      : searchPexelsImages(query, { page, perPage });
      
    const primaryResult = await primarySource;
    
    // If primary source succeeds, return its results
    if (primaryResult.success) {
      return {
        success: true,
        data: {
          ...primaryResult.data,
          source: preferredSource
        }
      };
    }
    
    // If primary fails, try the other source
    const fallbackSource = preferredSource === 'unsplash'
      ? searchPexelsImages(query, { page, perPage })
      : searchUnsplashImages(query, { page, perPage });
      
    const fallbackResult = await fallbackSource;
    
    if (fallbackResult.success) {
      return {
        success: true,
        data: {
          ...fallbackResult.data,
          source: preferredSource === 'unsplash' ? 'pexels' : 'unsplash'
        }
      };
    }
    
    // Both sources failed
    return { 
      success: false, 
      error: 'Failed to retrieve images from all sources' 
    };
  } catch (error: any) {
    return handleError(error, 'Failed to search images');
  }
}

// ============================================================================
// IMAGE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Save an image to the database.
 * @param imageData - The image data
 * @returns Result containing the saved image
 */
export async function saveImage(imageData: ImageSaveData): Promise<Result<Image>> {
  try {
    const supabase = await getTypedDbClient();
    
    // Get user from auth
    const { data: { user }, error: userError } = await createRouteHandlerClient()
      .then((client) => client.auth.getUser());
      
    if (userError) {
      return { success: false, error: userError.message };
    }
    
    // Validate input
    const validation = imageSaveSchema.safeParse(imageData);
    if (!validation.success) {
      return { 
        success: false, 
        error: 'Invalid image data',
        details: validation.error.format()
      };
    }
    
    const validData = validation.data;
    const refId = typeof validData.refId === 'string' ? validData.refId : null;
    
    // Prepare insert payload
    const insertPayload = {
      url: validData.url,
      image_url: validData.url,
      alt_text: validData.alt || 'Image',
      source: validData.sourceName || null,
      external_id: null,
      created_by: user?.id || null,
      photographer: validData.photographer || null,
      photographer_url: validData.photographerUrl || null,
      trip_id: validData.imageType === ENUMS.IMAGE_TYPE.TRIP_COVER ? refId : null,
      user_id: validData.imageType === ENUMS.IMAGE_TYPE.USER_AVATAR ? user?.id || null : null,
      destination_id: validData.imageType === ENUMS.IMAGE_TYPE.DESTINATION ? refId : null,
      metadata: validData.metadata || null
    };
    
    // Insert the image record
    const { data: savedImage, error: saveError } = await supabase
      .from(TABLES.IMAGES)
      .insert(insertPayload)
      .select()
      .single();
      
    if (saveError) {
      return { success: false, error: saveError.message };
    }
    
    // Update reference if needed
    if (refId) {
      await updateReferenceWithImage(validData.imageType, refId, savedImage);
    }
    
    return { success: true, data: savedImage };
  } catch (error: any) {
    return handleError(error, 'Failed to save image');
  }
}

/**
 * Helper function to update references to the image
 */
async function updateReferenceWithImage(
  imageType: string, 
  refId: string, 
  image: Image
): Promise<void> {
  try {
    const supabase = await getTypedDbClient();
    
    switch (imageType) {
      case ENUMS.IMAGE_TYPE.TRIP_COVER:
        await supabase
          .from('trips')
          .update({ cover_image_id: image.id, image_url: image.url })
          .eq('id', refId);
        break;
        
      case ENUMS.IMAGE_TYPE.DESTINATION:
        await supabase
          .from('destinations')
          .update({ main_image_id: image.id, image_url: image.url })
          .eq('id', refId);
        break;
        
      case ENUMS.IMAGE_TYPE.USER_AVATAR:
        await supabase
          .from('profiles')
          .update({ avatar_image_id: image.id, avatar_url: image.url })
          .eq('id', refId);
        break;
        
      // Add more cases as needed
    }
  } catch (error) {
    console.error('Failed to update reference with image:', error);
  }
}

/**
 * Delete an image.
 * @param imageId - The image's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteImage(imageId: string): Promise<Result<null>> {
  try {
    const supabase = await getTypedDbClient();
    
    // Get the image first to check references
    const { data: image, error: fetchError } = await supabase
      .from(TABLES.IMAGES)
      .select('*')
      .eq('id', imageId)
      .single();
      
    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    if (!image) {
      return { success: false, error: 'Image not found' };
    }
    
    // Update references to null
    if (image.trip_id) {
      await supabase
        .from('trips')
        .update({ cover_image_id: null, image_url: null })
        .eq('id', image.trip_id)
        .eq('cover_image_id', imageId);
    }
    
    if (image.destination_id) {
      await supabase
        .from('destinations')
        .update({ main_image_id: null, image_url: null })
        .eq('id', image.destination_id)
        .eq('main_image_id', imageId);
    }
    
    if (image.user_id) {
      await supabase
        .from('profiles')
        .update({ avatar_image_id: null, avatar_url: null })
        .eq('id', image.user_id)
        .eq('avatar_image_id', imageId);
    }
    
    // Delete the image record
    const { error: deleteError } = await supabase
      .from(TABLES.IMAGES)
      .delete()
      .eq('id', imageId);
      
    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
    
    return { success: true, data: null };
  } catch (error: any) {
    return handleError(error, 'Failed to delete image');
  }
}

/**
 * Get all images for a specific entity.
 * @param entityType - The type of entity
 * @param entityId - The entity's unique identifier
 * @returns Result containing an array of images
 */
export async function getEntityImages(
  entityType: string,
  entityId: string
): Promise<Result<Image[]>> {
  try {
    const supabase = await getTypedDbClient();
    let query = supabase.from(TABLES.IMAGES).select('*');
    
    // Map entity type to column name
    switch (entityType) {
      case ENUMS.IMAGE_TYPE.TRIP_COVER:
        query = query.eq('trip_id', entityId);
        break;
        
      case ENUMS.IMAGE_TYPE.DESTINATION:
        query = query.eq('destination_id', entityId);
        break;
        
      case ENUMS.IMAGE_TYPE.USER_AVATAR:
        query = query.eq('user_id', entityId);
        break;
        
      default:
        return { success: false, error: 'Invalid entity type' };
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data || [] };
  } catch (error: any) {
    return handleError(error, 'Failed to fetch entity images');
  }
}

// ============================================================================
// IMAGE GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a thumbnail image with text overlay.
 * @param options - Thumbnail generation options
 * @returns Result containing the generated image buffer
 */
export async function generateThumbnail(
  options: ThumbnailOptions
): Promise<Result<Buffer>> {
  try {
    // Validate options
    const validationResult = thumbnailOptionsSchema.safeParse(options);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid thumbnail options',
        details: validationResult.error.errors
      };
    }

    const width = 1200;
    const height = 630;
    const {
      title,
      subtitle = 'Plan your trip together',
      bgColor = '#3b82f6',
      textColor = '#ffffff',
      tags = '',
      usePadding = true,
    } = validationResult.data;
    
    const padding = usePadding ? 0.15 : 0;
    const contentWidth = width * (1 - padding * 2);
    const contentHeight = height * (1 - padding * 2);
    const paddingX = width * padding;
    const paddingY = height * padding;

    // Helper functions
    function adjustColor(hex: string, amount: number): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const newR = Math.max(0, Math.min(255, r + amount));
      const newG = Math.max(0, Math.min(255, g + amount));
      const newB = Math.max(0, Math.min(255, b + amount));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    function escapeXml(text: string): string {
      return text
        ? text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
        : '';
    }

    // Generate SVG and convert to PNG using sharp
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}" />
        <g transform="translate(${paddingX}, ${paddingY})">
          <text x="0" y="40" font-family="Arial" font-size="48" fill="${textColor}">${escapeXml(title)}</text>
          ${subtitle ? `<text x="0" y="90" font-family="Arial" font-size="24" fill="${textColor}">${escapeXml(subtitle)}</text>` : ''}
        </g>
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return { success: true, data: pngBuffer };
  } catch (error: any) {
    return handleError(error, 'Failed to generate thumbnail');
  }
}

