'use client';

import Link from 'next/link';
import { Calendar, Users, MapPin, ChevronLeft, Edit, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/utils/lib-utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useState } from 'react';
import CompactBudgetSnapshot from '@/components/trips/compact-budget-snapshot';
import ImageSelector from '@/app/components/ImageSelector';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SimplifiedTripHeaderProps {
  tripId: string;
  name: string;
  description?: string | null;
  destination?: string | null;
  coverImageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  membersCount?: number;
  canEdit?: boolean;
  onChangeCover?: (imageUrl: string) => void;
  budgetProps?: {
    targetBudget: number | null;
    totalPlanned: number;
    totalSpent: number;
    isEditing: boolean;
    onEditToggle: (isEditing: boolean) => void;
    onSave: (newBudget: number) => Promise<void>;
    onLogExpenseClick: () => void;
  };
}

export default function SimplifiedTripHeader({
  tripId,
  name,
  description,
  destination,
  coverImageUrl,
  startDate,
  endDate,
  membersCount = 1,
  canEdit = false,
  onChangeCover,
  budgetProps
}: SimplifiedTripHeaderProps) {
  const hasDateRange = startDate && endDate;
  const defaultImageUrl = '/images/default-trip-image.jpg';
  const imageUrl = coverImageUrl || defaultImageUrl;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleImageSelect = (selectedImageUrl: string) => {
    if (onChangeCover) {
      onChangeCover(selectedImageUrl);
    }
    setIsSheetOpen(false);
  };

  return (
    <div className="relative trip-header">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden group">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
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
          <div className="absolute top-4 left-4 z-20">
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Trips
              </Button>
            </Link>
          </div>
          
          {/* Edit Button (if user can edit) */}
          {canEdit && (
            <div className="absolute top-4 right-4 z-20">
              <Link href={`/trips/${tripId}/edit`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Trip
                </Button>
              </Link>
            </div>
          )}
          
          {/* Change Cover Button - Centered with Sheet */}
          {canEdit && onChangeCover && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {coverImageUrl ? 'Change Cover' : 'Add Cover Image'}
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
                <div className="p-6 pt-2">
                  <ImageSelector 
                    selectedImage={coverImageUrl || ''} 
                    onImageSelect={handleImageSelect} 
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">{name}</h1>
              {description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{description}</p>
              )}
            </div>
            
            {/* Private/Public Badge */}
            <Badge variant="outline" className="hidden md:inline-flex self-start">
              Private Trip
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-8 text-sm">
            {/* Destination */}
            {destination && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{destination}</span>
              </div>
            )}
            
            {/* Date Range */}
            {hasDateRange && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDateRange(startDate, endDate)}</span>
              </div>
            )}
            
            {/* Travelers */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{membersCount} traveler{membersCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Member Avatars */}
          <div className="mt-6 flex items-center">
            <div className="flex -space-x-2 mr-3">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src="/images/default-avatar.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {membersCount > 1 && (
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback>+</AvatarFallback>
                </Avatar>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              You {membersCount > 1 ? `and ${membersCount - 1} others` : ''}
            </span>
          </div>
          
          {/* Budget Snapshot - Only show if budgetProps are provided */}
          {budgetProps && (
            <div className="absolute bottom-6 right-6 z-10">
              <CompactBudgetSnapshot
                targetBudget={budgetProps.targetBudget}
                totalPlanned={budgetProps.totalPlanned}
                totalSpent={budgetProps.totalSpent}
                canEdit={canEdit}
                isEditing={budgetProps.isEditing}
                onEditToggle={budgetProps.onEditToggle}
                onSave={budgetProps.onSave}
                onLogExpenseClick={budgetProps.onLogExpenseClick}
                tripId={tripId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 