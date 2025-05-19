'use client';

import { ExternalLink, Clock, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { appendViatorAffiliate, trackViatorLinkClick } from '@/utils/api/viator';
import { DisplayItineraryItem } from '@/types/itinerary';

interface ViatorItineraryItemProps {
  productId: string;
  title: string;
  imageUrl?: string;
  price?: number | string;
  currencyCode?: string;
  duration?: string;
  date?: string | Date;
  time?: string;
  timeZone?: string;
  participants?: number;
  bookingReference?: string;
  onRemove?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  isConfirmed?: boolean;
}

// Mapping of some common cities to Viator destination IDs
const VIATOR_DESTINATION_MAP: Record<string, string> = {
  London: '737',
  'New York': '687',
  Paris: '479',
  Rome: '511',
  Barcelona: '562',
  Amsterdam: '525',
  'San Francisco': '651',
  'Las Vegas': '684',
  Tokyo: '334',
  Singapore: '18',
  Sydney: '357',
  Dubai: '828',
};

export function ViatorItineraryItem({
  productId,
  title,
  imageUrl,
  price,
  currencyCode = 'USD',
  duration,
  date,
  time,
  timeZone,
  participants = 1,
  bookingReference,
  onRemove,
  onEdit,
  isConfirmed = false,
}: ViatorItineraryItemProps) {
  // Handle remove click safely
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(productId);
    }
  };

  // Handle edit click safely
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(productId);
    }
  };

  // Format date if it exists
  const formattedDate = date ? (typeof date === 'string' ? date : date.toLocaleDateString()) : null;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Rest of the component rendering */}
    </div>
  );
}
