import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

interface PopularDestinationsProps {
  onSelect?: (destination: any) => void;
  interests?: string[];
  homeLocation?: string | null;
  showAsGrid?: boolean;
  showDialog?: boolean;
  showPopover?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  byline: string;
  image_url?: string;
  description?: string;
  highlights?: string[];
}

/**
 * Reusable grid component for displaying destination buttons
 */
export function PopularDestinationsGrid({
  destinations,
  showDialog = false,
  showPopover = false
}: {
  destinations: Destination[];
  showDialog?: boolean;
  showPopover?: boolean;
}) {
  const router = useRouter();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Random highlights for demo purposes
  const getRandomHighlights = (destination: Destination) => {
    const possibleHighlights = [
      "Local cuisine and food scene",
      "Historical landmarks and museums",
      "Outdoor activities and nature",
      "Cultural experiences and festivals",
      "Nightlife and entertainment",
      "Shopping districts and markets",
      "Architecture and urban design",
      "Beaches and water activities",
      "Parks and green spaces",
      "Local art and music scene"
    ];
    // Select 3-5 random highlights
    const count = Math.floor(Math.random() * 3) + 3; 
    const shuffled = [...possibleHighlights].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleDestinationClick = (destination: Destination) => {
    if (destination.slug) {
      router.push(`/destinations/${destination.slug}`);
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {destinations.slice(0, 12).map((dest) => (
        showPopover ? (
          <Popover
            key={dest.id}
            open={openPopoverId === dest.id}
            onOpenChange={(open) => {
              if (!open) setOpenPopoverId(null);
            }}
          >
            <PopoverTrigger asChild>
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
            <PopoverContent className="p-4" align="center" side="top" sideOffset={8}>
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
                  <Link
                    href={`/trips/create?destination=${dest.slug}&name=Trip to ${dest.name}`}
                    legacyBehavior>
                    <Button size="sm">
                      Plan a Trip
                    </Button>
                  </Link>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : showDialog ? (
          <Dialog key={dest.id}>
            <DialogTrigger asChild>
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
                  <Link
                    href={`/trips/create?destination=${dest.slug}&name=Trip to ${dest.name}`}
                    legacyBehavior>
                    <Button size="sm">
                      Plan a Trip
                    </Button>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <TooltipProvider key={dest.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer hover:shadow-lg transition text-center p-4 flex flex-col items-center justify-center aspect-square transform hover:scale-105"
                  onClick={() => handleDestinationClick(dest)}
                >
                  <span className="text-4xl mb-2">{dest.emoji}</span>
                  <div className="font-medium text-sm">{dest.name}</div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
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

export function PopularDestinations({ 
  onSelect, 
  interests = [], 
  homeLocation = null,
  showAsGrid = false,
  showDialog = false,
  showPopover = false
}: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Base API URL
    let url = '/api/destinations/popular';
    
    // Add query parameters for personalization if available
    const params = new URLSearchParams();
    if (interests && interests.length > 0) {
      params.append('interests', interests.join(','));
    }
    if (homeLocation) {
      params.append('homeLocation', homeLocation);
    }
    
    const fullUrl = `${url}${params.toString() ? '?' + params.toString() : ''}`;
    
    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch popular destinations');
        }
        return response.json();
      })
      .then(data => {
        setDestinations(data.destinations || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching popular destinations:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [interests, homeLocation]);

  // Generate heading text based on personalization
  const getHeadingText = () => {
    if (interests?.length > 0 && homeLocation) {
      return "Destinations Based on Your Interests";
    } else if (interests?.length > 0) {
      return "Destinations You Might Like";
    } else if (homeLocation) {
      return "Popular Destinations to Explore";
    } else {
      return "Popular Destinations";
    }
  };

  // Generate description text based on personalization
  const getDescriptionText = () => {
    if (interests?.length > 0 && homeLocation) {
      return `Personalized recommendations based on your interests and location`;
    } else if (interests?.length > 0) {
      return `Destinations that match your interests`;
    } else if (homeLocation) {
      return `Great places to visit from ${homeLocation}`;
    } else {
      return "Trending destinations loved by travelers";
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">Loading popular destinations…</div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  if (destinations.length === 0) {
    return null; // Don't show anything if no destinations found
  }

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <h3 className="text-2xl font-semibold text-center">{getHeadingText()}</h3>
        <p className="text-muted-foreground text-center mt-1">{getDescriptionText()}</p>
      </div>
      {showAsGrid ? (
        <PopularDestinationsGrid destinations={destinations} showDialog={showDialog} showPopover={showPopover} />
      ) : (
        // fallback: original card layout (not used in new design)
        (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={dest.slug ? `/destinations/${dest.slug}` : '#'}
              passHref
              legacyBehavior>
              <Card
                className="cursor-pointer hover:shadow-lg transition h-full transform hover:scale-105"
                onClick={() => onSelect?.(dest)}
              >
                <div className="flex flex-col items-center p-4 h-full">
                  <span className="text-3xl">{dest.emoji}</span>
                  <div className="font-bold mt-2 text-center">{dest.name}</div>
                  {dest.byline && (
                    <div className="text-xs text-muted-foreground text-center mt-1">{dest.byline}</div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>)
      )}
    </div>
  );
}
