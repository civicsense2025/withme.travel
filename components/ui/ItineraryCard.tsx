import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Calendar } from 'lucide-react';

export interface ItineraryCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  travelerCount?: number;
  onClick?: () => void;
  imageUrl?: string;
  location?: string;
  duration?: string;
  href?: string;
}

/**
 * ItineraryCard displays a summary of an itinerary for use in lists or grids.
 * @example <ItineraryCard title="Urban Explorer" description="A quick city break." travelerCount={4} />
 */
export function ItineraryCard({
  title,
  description,
  icon,
  travelerCount,
  onClick,
  imageUrl,
  location,
  duration,
  href,
}: ItineraryCardProps) {
  const cardContent = (
    <div
      className={`rounded-2xl bg-gray-50 dark:bg-gray-900 shadow hover:shadow-lg cursor-pointer flex flex-col ${
        imageUrl ? 'min-h-[280px]' : 'min-h-[140px]'
      }`}
      onClick={onClick}
      tabIndex={0}
      role={href ? 'link' : 'button'}
      aria-pressed="false"
    >
      {imageUrl && (
        <div className="relative w-full h-40 rounded-t-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-bold text-lg truncate" title={title}>
              {title}
            </h3>
          </div>

          {location && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <MapPin size={14} />
              <span className="truncate">{location}</span>
            </div>
          )}

          {description && (
            <p
              className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2"
              title={description}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-400 dark:text-gray-500">
          {duration && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{duration}</span>
            </div>
          )}

          {travelerCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{travelerCount} travelers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default ItineraryCard;
