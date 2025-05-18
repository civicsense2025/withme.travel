import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, User, MapPin } from 'lucide-react';
import { formatDateRange } from '@/utils/lib-utils';

export interface TripCardProps {
  id: string;
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  coverImageUrl?: string | null;
  memberCount?: number;
  isPublic?: boolean;
  status?: string;
  onClick?: () => void;
  className?: string;
}

export function TripCard({
  id,
  name,
  destination,
  startDate,
  endDate,
  coverImageUrl,
  memberCount = 0,
  isPublic = false,
  status,
  onClick,
  className,
}: TripCardProps) {
  const tripUrl = `/trips/${id}`;
  const hasDateInfo = startDate || endDate;
  const dateRange = hasDateInfo ? formatDateRange(startDate || '', endDate || '') : '';
  
  return (
    <Card className={`overflow-hidden h-full ${className || ''}`}>
      <div className="relative h-32 w-full">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
            <MapPin className="h-8 w-8 opacity-40" />
          </div>
        )}
        {status && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary/80 text-primary-foreground text-xs rounded-full">
            {status}
          </div>
        )}
        {isPublic !== undefined && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 text-foreground text-xs rounded-full">
            {isPublic ? 'Public' : 'Private'}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">{name}</h3>
          {destination && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {destination}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {memberCount > 0 && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{memberCount} {memberCount === 1 ? 'traveler' : 'travelers'}</span>
            </div>
          )}
          {hasDateInfo && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateRange}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {onClick ? (
          <Button variant="default" onClick={onClick} className="w-full">
            View Trip
          </Button>
        ) : (
          <Link href={tripUrl} className="block w-full">
            <Button variant="default" className="w-full">
              View Trip
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default TripCard; 