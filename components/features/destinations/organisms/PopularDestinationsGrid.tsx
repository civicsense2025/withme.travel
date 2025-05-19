// =============================================================================
// POPULAR DESTINATIONS GRID ORGANISM
// =============================================================================

/**
 * PopularDestinationsGrid
 *
 * Displays a grid of destination cards with optional popover or dialog details.
 * Used for showing popular destinations in a visually engaging, interactive way.
 *
 * @module features/destinations/organisms/PopularDestinationsGrid
 */

// External dependencies
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Internal UI components
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Types
/**
 * Destination entity for grid display
 */
export interface Destination {
  /** Unique destination ID */
  id: string;
  /** Display name */
  name: string;
  /** Slug for URL navigation */
  slug: string;
  /** Emoji representing the destination */
  emoji: string;
  /** Short byline or tagline */
  byline: string;
  /** Optional image URL */
  image_url?: string;
  /** Optional description */
  description?: string;
  /** Optional highlights */
  highlights?: string[];
}

/**
 * Props for PopularDestinationsGrid
 */
export interface PopularDestinationsGridProps {
  /** List of destinations to display */
  destinations: Destination[];
  /** Show details in a dialog (default: false) */
  showDialog?: boolean;
  /** Show details in a popover (default: false) */
  showPopover?: boolean;
}

/**
 * Reusable grid component for displaying destination buttons
 */
export function PopularDestinationsGrid({
  destinations,
  showDialog = false,
  showPopover = false,
}: PopularDestinationsGridProps) {
  const router = useRouter();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Helper: Generate random highlights for demo purposes
  const getRandomHighlights = (destination: Destination) => {
    const possibleHighlights = [
      'Local cuisine and food scene',
      'Historical landmarks and museums',
      'Outdoor activities and nature',
      'Cultural experiences and festivals',
      'Nightlife and entertainment',
      'Shopping districts and markets',
      'Architecture and urban design',
      'Beaches and water activities',
      'Parks and green spaces',
      'Local art and music scene',
    ];
    // Select 3-5 random highlights
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...possibleHighlights].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Event: Navigate to destination page
  const handleDestinationClick = (destination: Destination) => {
    if (destination.slug) {
      router.push(`/destinations/${destination.slug}`);
    }
  };

  // Render
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {destinations.slice(0, 12).map((dest) => (
        showPopover ? (
          <Popover key={dest.id}>
            <PopoverTrigger>
              <Card
                className="cursor-pointer hover:shadow-lg transition text-center p-4 flex flex-col items-center justify-center aspect-square transform hover:scale-105"
                tabIndex={0}
                onMouseEnter={() => setOpenPopoverId(dest.id)}
                onMouseLeave={() => setOpenPopoverId(null)}
                onFocus={() => setOpenPopoverId(dest.id)}
                onBlur={() => setOpenPopoverId(null)}
                aria-haspopup="dialog"
                aria-expanded={openPopoverId === dest.id}
              >
                <span className="text-4xl mb-2">{dest.emoji}</span>
                <div className="font-medium text-sm">{dest.name}</div>
              </Card>
            </PopoverTrigger>
            {openPopoverId === dest.id && (
              <PopoverContent className="p-4">
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">{dest.emoji}</span>
                  <div className="font-medium text-sm">{dest.name}</div>
                  <div className="text-xs text-muted-foreground">{dest.byline}</div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Highlights</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {(dest.highlights || getRandomHighlights(dest)).map((highlight, idx) => (
                        <li key={idx} className="text-sm">{highlight}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href={`/trips/create?destination=${dest.slug}&name=Trip to ${dest.name}`}>
                      <Button size="sm">Plan a Trip</Button>
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        ) : showDialog ? (
          <Dialog key={dest.id}>
            <DialogTrigger>
              <Card
                className="cursor-pointer hover:shadow-lg transition text-center p-4 flex flex-col items-center justify-center aspect-square transform hover:scale-105"
              >
                <span className="text-4xl mb-2">{dest.emoji}</span>
                <div className="font-medium text-sm">{dest.name}</div>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{dest.emoji}</span> {dest.name}
                </DialogTitle>
                <DialogDescription>{dest.byline}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Highlights</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {(dest.highlights || getRandomHighlights(dest)).map((highlight, idx) => (
                      <li key={idx} className="text-sm">{highlight}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Link href={`/trips/create?destination=${dest.slug}&name=Trip to ${dest.name}`}>
                    <Button size="sm">Plan a Trip</Button>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <TooltipProvider key={dest.id}>
            <Tooltip>
              <TooltipTrigger>
                <Card
                  className="cursor-pointer hover:shadow-lg transition text-center p-4 flex flex-col items-center justify-center aspect-square transform hover:scale-105"
                  onClick={() => handleDestinationClick(dest)}
                >
                  <span className="text-4xl mb-2">{dest.emoji}</span>
                  <div className="font-medium text-sm">{dest.name}</div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="font-bold">{dest.name}</div>
                <div className="text-xs">{dest.byline}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      ))}
    </div>
  );
} 