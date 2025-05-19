'use client';

import Link from 'next/link';
import { Calendar, Users, MapPin, ChevronLeft, Edit, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/utils/lib-utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useState } from 'react';
import { ImageSearchSelector } from '@/components/features/images/image-search-selector';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CompactBudgetSnapshot } from '@/components/features/budget/organisms/CompactBudgetSnapshot';

interface TripDetailsProps {
  id: string;
  title: string;
  description?: string | null;
  destination?: {
    id: string;
    name: string;
  } | null;
  start_date?: string | null;
  end_date?: string | null;
  image_url?: string | null;
  [key: string]: any; // For additional properties
}

interface SimplifiedTripHeaderProps {
  trip?: TripDetailsProps;
  tripId?: string; // For compatibility with components that use tripId instead of trip.id
  name?: string; // For compatibility
  description?: string | null;
  destination?: string | null;
  coverImageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  membersCount?: number;
  onEditClick?: (tripId: string) => void;
  onShareClick?: (tripId: string) => void;
  showEditButton?: boolean;
  showShareButton?: boolean;
  showBackButton?: boolean;
  onImageSelect?: (imageUrl: string | null) => void;
  budgetProps?: any;
}

export default function SimplifiedTripHeader({
  trip,
  tripId,
  name,
  description,
  destination,
  coverImageUrl,
  startDate,
  endDate,
  membersCount,
  onEditClick,
  onShareClick,
  showEditButton = false,
  showShareButton = false,
  showBackButton = true,
  onImageSelect,
  budgetProps,
}: SimplifiedTripHeaderProps) {
  // Create a normalized trip object from either the trip prop or the individual props
  const normalizedTrip = trip || {
    id: tripId || '',
    title: name || '',
    description: description,
    destination: destination ? { id: '', name: destination } : null,
    start_date: startDate,
    end_date: endDate,
    image_url: coverImageUrl,
    membersCount: membersCount || 1,
    budgetProps: budgetProps,
  };

  const hasDateRange = normalizedTrip.start_date && normalizedTrip.end_date;
  const defaultImageUrl = '/images/default-trip-image.jpg';
  const imageUrl = normalizedTrip.image_url || defaultImageUrl;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleImageSelect = (selectedImageUrl: string, position?: number, metadata?: any) => {
    if (onImageSelect) {
      onImageSelect(selectedImageUrl);
    } else if (onEditClick) {
      onEditClick(normalizedTrip.id);
    }
    setIsSheetOpen(false);
  };

  return (
    <div className="relative trip-header">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden group">
        {normalizedTrip.image_url ? (
          <Image
            src={normalizedTrip.image_url}
            alt={normalizedTrip.title}
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${defaultImageUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/10">
          {/* Back Button */}
          {showBackButton && (
            <div className="absolute top-4 left-4 z-20">
              <Link href="/trips" legacyBehavior>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Trips
                </Button>
              </Link>
            </div>
          )}

          {/* Edit Button (if user can edit) */}
          {showEditButton && (
            <div className="absolute top-4 right-4 z-20">
              <Link href={`/trips/${normalizedTrip.id}/edit`} legacyBehavior>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Trip
                </Button>
              </Link>
            </div>
          )}

          {/* Change Cover Button - Centered with Sheet */}
          {showEditButton && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {normalizedTrip.image_url ? 'Change Cover' : 'Add Cover Image'}
                  </Button>
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-full p-0">
                <SheetHeader className="p-6 pb-2">
                  <SheetTitle>Select Cover Image</SheetTitle>
                  <SheetDescription>
                    Search for an image or upload your own photo for your trip cover.
                  </SheetDescription>
                </SheetHeader>
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ImageSearchSelector
                    onSelect={(image) => handleImageSelect(image.url)}
                    initialValue={normalizedTrip.destination?.name || ''}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      {/* Content Container */}
      <div className="relative mx-auto max-w-6xl px-4 -mt-32 md:-mt-24">
        <div className="bg-background rounded-lg shadow-sm p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{normalizedTrip.title}</h1>
              {normalizedTrip.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{normalizedTrip.description}</p>
              )}
            </div>

            {/* Private/Public Badge */}
            <Badge variant="outline" className="hidden md:inline-flex self-start">
              Private Trip
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 text-sm">
            {/* Destination */}
            {normalizedTrip.destination && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{normalizedTrip.destination.name}</span>
              </div>
            )}

            {/* Date Range */}
            {hasDateRange && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  {formatDateRange(
                    normalizedTrip.start_date === undefined ? null : normalizedTrip.start_date,
                    normalizedTrip.end_date === undefined ? null : normalizedTrip.end_date
                  )}
                </span>
              </div>
            )}

            {/* Travelers */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>
                {normalizedTrip.membersCount} traveler{normalizedTrip.membersCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Member Avatars */}
          <div className="mt-6 flex items-center">
            <div className="flex -space-x-2 mr-3">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src="/images/default-avatar.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {normalizedTrip.membersCount > 1 && (
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback>+</AvatarFallback>
                </Avatar>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              You{' '}
              {normalizedTrip.membersCount > 1
                ? `and ${normalizedTrip.membersCount - 1} others`
                : ''}
            </span>
          </div>

          {/* Budget Snapshot - Only show if budgetProps are provided */}
          {normalizedTrip.budgetProps && (
            <div className="absolute bottom-6 right-6 z-10">
              <CompactBudgetSnapshot
                targetBudget={Number(normalizedTrip.budgetProps.targetBudget)}
                totalPlanned={Number(normalizedTrip.budgetProps.totalPlanned)}
                totalSpent={Number(normalizedTrip.budgetProps.totalSpent)}
                canEdit={showEditButton}
                isEditing={normalizedTrip.budgetProps.isEditing}
                onEditToggle={normalizedTrip.budgetProps.onEditToggle}
                onSave={normalizedTrip.budgetProps.onSave}
                onLogExpenseClick={normalizedTrip.budgetProps.onLogExpenseClick}
                tripId={normalizedTrip.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
