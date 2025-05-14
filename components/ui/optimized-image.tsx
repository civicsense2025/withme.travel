'use client';

import React from 'react';
import Image from 'next/image';
import { imageService, ImageType, ImageMetadata, ImageOptions } from '@/lib/services/image-service';
import { ImageAttribution } from '@/components/images';

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> {
  metadata?: ImageMetadata | null;
  type: ImageType;
  fallbackText: string;
  imageOptions?: ImageOptions;
  showAttribution?: boolean;
  attributionStyle?: 'overlay' | 'info-icon';
  priority?: boolean;
  sizes?: string;
}

// Default placeholder blur data URL (light gray)
const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=';

export function OptimizedImage({
  metadata = null,
  type,
  fallbackText,
  imageOptions,
  showAttribution = false,
  attributionStyle = 'info-icon',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  ...props
}: OptimizedImageProps) {
  // Get the optimized image URL with fallback
  const imageUrl = imageService.getImageUrlWithFallback(metadata, type, fallbackText, imageOptions);

  // Use proper alt text from metadata or fallback
  const altText = metadata?.alt_text || fallbackText;

  return (
    <div className="relative">
      <Image
        src={imageUrl}
        alt={altText}
        className={className}
        placeholder="blur"
        blurDataURL={metadata?.blur_data_url || PLACEHOLDER_BLUR}
        priority={priority}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        quality={85} // Higher quality for better visual appearance
        {...props}
      />

      {/* Show attribution if requested and available */}
      {showAttribution && metadata && (
        <ImageAttribution image={metadata} variant={attributionStyle} />
      )}
    </div>
  );
}
