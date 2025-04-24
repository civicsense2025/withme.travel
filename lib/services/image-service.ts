import { createClient } from '@supabase/supabase-js';
import { UNSPLASH_CONFIG } from '@/utils/constants';

// Types
export type ImageType = 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover';

export interface ImageMetadata {
  id: string;
  entity_id: string;
  entity_type: ImageType;
  url: string;
  alt_text?: string;
  attribution?: string;
  attributionHtml?: string; // HTML-formatted attribution with clickable links
  photographer_name?: string;
  photographer_url?: string;
  license?: string;
  source: 'unsplash' | 'user_upload' | 'system' | 'pexels';
  source_id?: string;
  width?: number;
  height?: number;
  focal_point_x?: number;
  focal_point_y?: number;
  created_at: string;
  updated_at: string;
}

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

class ImageService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Get image metadata for an entity
  async getImageMetadata(entityId: string, entityType: ImageType): Promise<ImageMetadata | null> {
    try {
      const { data, error } = await this.supabase
        .from('image_metadata')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .maybeSingle()
        .throwOnError();

      return data;
    } catch (error) {
      console.error('Error fetching image metadata:', error);
      return null;
    }
  }

  // Create or update image metadata
  async upsertImageMetadata(metadata: Omit<ImageMetadata, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('image_metadata')
      .upsert({
        ...metadata,
      }, {
        onConflict: 'entity_id,entity_type'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting image metadata:', error);
      return null;
    }

    return data;
  }

  // Get optimized image URL with proper dimensions and format
  getOptimizedImageUrl(url: string, options: ImageOptions = {}): string {
    // If it's an Unsplash URL, use their image optimization API
    if (url.includes('unsplash.com')) {
      const unsplashUrl = new URL(url);
      if (options.width) unsplashUrl.searchParams.set('w', options.width.toString());
      if (options.height) unsplashUrl.searchParams.set('h', options.height.toString());
      if (options.quality) unsplashUrl.searchParams.set('q', options.quality.toString());
      if (options.format) unsplashUrl.searchParams.set('fm', options.format);
      return unsplashUrl.toString();
    }

    // For other URLs, you could implement your own image optimization service
    // or use a CDN like Cloudinary, imgix, etc.
    return url;
  }

  // Generate a placeholder avatar for a user
  generatePlaceholderAvatar(name: string): string {
    return `/api/avatar?name=${encodeURIComponent(name)}`;
  }

  // Get appropriate image URL with fallback
  getImageUrlWithFallback(
    metadata: ImageMetadata | null,
    type: ImageType,
    fallbackText: string,
    options: ImageOptions = {}
  ): string {
    if (metadata?.url) {
      return this.getOptimizedImageUrl(metadata.url, options);
    }

    switch (type) {
      case 'user_avatar':
        return this.generatePlaceholderAvatar(fallbackText);
      case 'destination':
        return `/images/placeholder-destination.jpg`;
      case 'trip_cover':
        return `/images/placeholder-trip.svg`;
      case 'template_cover':
        return `/images/placeholder-template.svg`;
      default:
        return `/images/placeholder.svg`;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService(); 