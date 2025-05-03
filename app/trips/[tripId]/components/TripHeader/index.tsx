import Image from 'next/image';
import React from 'react';

interface TripHeaderProps {
  coverImageUrl?: string;
  name?: string;
}

export function TripHeader({ coverImageUrl, name }: TripHeaderProps) {
  return (
    <Image
      src={coverImageUrl || '/default-placeholder.jpg'}
      alt={name || 'Trip cover image'}
      width={1200}
      height={400}
      className="w-full h-auto rounded-md object-cover"
    />
  );
}
