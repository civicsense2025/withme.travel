'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageAttribution } from '@/components/images';

interface TripHeaderProps {
  coverImageUrl: string;
  name: string;
  imageMetadata?: any;
}

export function TripHeader({ coverImageUrl, name, imageMetadata }: TripHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Extract alt text from image metadata or fallback to trip name
  const altText = imageMetadata?.alt_text || `${name} - Trip cover image`;

  return (
    <div className="relative w-full overflow-hidden rounded-md">
      <Image
        src={coverImageUrl || '/images/default-trip-image.jpg'}
        alt={altText}
        width={1200}
        height={400}
        className="w-full h-auto object-cover"
        onLoad={() => setImageLoaded(true)}
        priority
      />

      {imageLoaded && imageMetadata && (
        <ImageAttribution image={imageMetadata} variant="info-icon" />
      )}
    </div>
  );
}
