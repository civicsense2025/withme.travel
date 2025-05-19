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

import { Result, Image, handleError } from './_shared';
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

type ThumbnailOptions = z.infer<typeof thumbnailOptionsSchema>;
type ImageSaveData = z.infer<typeof imageSaveSchema>;

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search Unsplash for images with pagination.
 * @param query - Search query string
 * @param page - Page number for pagination
 * @param perPage - Number of results per page
 * @returns Result containing search results
 */
export async function searchUnsplashImages(
  query: string, 
  page = 1, 
  perPage = 20
): Promise<Result<any>> {
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
 * @param page - Page number for pagination
 * @param perPage - Number of results per page
 * @returns Result containing search results
 */
export async function searchPexelsImages(
  query: string, 
  page = 1, 
  perPage = 20
): Promise<Result<any>> {
  try {
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }
    
    const result = await searchPexels(query, perPage, page);
    
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
  try {
    const { page = 1, perPage = 20, preferredSource = 'unsplash' } = options;
    
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }
    
    // Try preferred source first
    const primarySource = preferredSource === 'unsplash' 
      ? searchUnsplashImages(query, page, perPage)
      : searchPexelsImages(query, page, perPage);
      
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
      ? searchPexelsImages(query, page, perPage)
      : searchUnsplashImages(query, page, perPage);
      
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
        details: validationResult.error.format()
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

    // Create SVG content
    let svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgColor}" />
            <stop offset="100%" stop-color="${adjustColor(bgColor, -30)}" />
          </linearGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-opacity="0.3"/>
          </filter>
        </defs>
        ${
          usePadding
            ? `
        <rect width="${width}" height="${height}" fill="white" />
        <rect x="${paddingX}" y="${paddingY}" width="${contentWidth}" height="${contentHeight}" fill="url(#gradient)" />
        <rect x="${paddingX}" y="${paddingY}" width="${contentWidth}" height="${contentHeight}" filter="url(#noise)" opacity="0.1" />
        `
            : `
        <rect width="${width}" height="${height}" fill="url(#gradient)" />
        <rect width="${width}" height="${height}" filter="url(#noise)" opacity="0.1" />
        `
        }
        <text x="${paddingX + 50}" y="${paddingY + 60}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${textColor}" text-anchor="start" filter="url(#shadow)">withme.travel</text>
        <text x="${paddingX + 50}" y="${height - paddingY - 140}" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="${textColor}" text-anchor="start" filter="url(#shadow)">${escapeXml(title)}</text>
        <text x="${paddingX + 50}" y="${height - paddingY - 70}" font-family="Arial, sans-serif" font-size="40" fill="${textColor}" text-anchor="start" opacity="0.8" filter="url(#shadow)">${escapeXml(subtitle)}</text>
        ${tags ? `<text x="${paddingX + 50}" y="${height - paddingY - 20}" font-family="Arial, sans-serif" font-size="18" font-style="italic" fill="${textColor}" text-anchor="start" opacity="0.7" filter="url(#shadow)">${escapeXml(tags)}</text>` : ''}
      </svg>
    `;

    // Convert SVG to PNG with sharp
    const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
    return { success: true, data: pngBuffer };
  } catch (error: any) {
    return handleError(error, 'Failed to generate thumbnail');
  }
}

/**
 * Generate and save a thumbnail image for an entity.
 * @param entityType - The type of entity
 * @param entityId - The entity's unique identifier
 * @param options - Thumbnail generation options
 * @returns Result containing the saved image
 */
export async function generateAndSaveThumbnail(
  entityType: string,
  entityId: string,
  options: ThumbnailOptions
): Promise<Result<Image>> {
  try {
    // Generate the thumbnail
    const thumbnailResult = await generateThumbnail(options);
    if (!thumbnailResult.success) {
      return thumbnailResult;
    }
    
    const buffer = thumbnailResult.data;
    
    // Upload the image to storage
    const supabase = await createRouteHandlerClient();
    const fileName = `thumbnail-${entityId}-${Date.now()}.png`;
    const bucketPath = `thumbnails/${entityType}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(bucketPath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
      
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    // Get the public URL
    const { data: publicUrlData } = await supabase
      .storage
      .from('images')
      .getPublicUrl(bucketPath);
      
    const imageUrl = publicUrlData.publicUrl;
    
    // Save the image to the database
    const imageData: ImageSaveData = {
      url: imageUrl,
      imageType: entityType as any, // Type assertion here since we're validating below
      alt: options.title,
      refId: entityId,
      sourceName: 'generated',
      metadata: {
        generatedWith: 'thumbnailGenerator',
        options
      }
    };
    
    // Validate the entityType
    if (!Object.values(ENUMS.IMAGE_TYPE).includes(entityType as any)) {
      return { success: false, error: 'Invalid entity type' };
    }
    
    return saveImage(imageData);
  } catch (error: any) {
    return handleError(error, 'Failed to generate and save thumbnail');
  }
}

/**
 * Convert a URL to a base64 data URI.
 * @param imageUrl - URL of the image to convert
 * @returns Result containing the base64 data URI
 */
export async function urlToBase64(imageUrl: string): Promise<Result<string>> {
  try {
    // Validate URL
    try {
      new URL(imageUrl);
    } catch (e) {
      return { success: false, error: 'Invalid URL' };
    }
    
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { 
        success: false, 
        error: `Failed to fetch image: ${response.statusText}` 
      };
    }
    
    // Get content type and buffer
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;
    
    return { success: true, data: dataUri };
  } catch (error: any) {
    return handleError(error, 'Failed to convert URL to base64');
  }
}

/**
 * Type guard to check if an object is an Image
 */
export function isImage(obj: any): obj is Image {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.url === 'string' &&
    typeof obj.image_url === 'string';
}