'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Globe,
  DollarSign,
  Utensils,
  Camera,
  Moon,
  Sun,
  MapPin,
  Wifi,
  Train,
  Leaf,
  Footprints as Walking,
  Heart,
  Instagram,
  Briefcase,
  Shield,
  Accessibility,
  Users,
  Info,
  PlusCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { DestinationReviews } from '@/components/destinations/destination-reviews';
import { useAuth } from '@/lib/hooks/use-auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContextType } from '@/components/auth-provider';
import { Rating } from '@/components/ui/rating';
import { RelatedItinerariesWidget } from '@/components/destinations/related-itineraries-widget';

interface Destination {
  id: string;
  name: string;
  city: string;
  state_province: string | null;
  country: string;
  continent: string;
  description: string;
  best_season: string;
  avg_cost_per_day: number;
  local_language: string;
  time_zone: string;
  cuisine_rating: number;
  cultural_attractions: number;
  nightlife_rating: number;
  family_friendly: boolean;
  outdoor_activities: number;
  beach_quality: number | null;
  shopping_rating: number;
  safety_rating: number;
  wifi_connectivity: number;
  public_transportation: number;
  eco_friendly_options: number;
  walkability: number;
  instagram_worthy_spots: number;
  off_peak_appeal: number;
  digital_nomad_friendly: number;
  lgbtq_friendliness: number;
  accessibility: number;
  highlights: string;
  tourism_website: string;
  image_url: string;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
    attributionHtml?: string;
    photographer_name?: string;
    photographer_url?: string;
    source?: string;
    source_id?: string;
    url?: string;
  };
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  // Add other profile fields as needed
}

export default function DestinationPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { user } = useAuth() as AuthContextType;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slugParam = params?.slug;

  useEffect(() => {
    if (!slugParam) {
      setError('No destination specified');
      setIsLoading(false);
      return;
    }

    async function fetchDestination() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/destinations/by-slug/${encodeURIComponent(slugParam as string)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Destination '${slugParam}' not found`);
            return;
          }
          throw new Error(`Failed to fetch destination: ${response.status}`);
        }

        const data = await response.json();
        setDestination(data.destination);
      } catch (err: any) {
        console.error('Error fetching destination:', err);
        setError(err.message || 'Failed to load destination details');
        toast({
          title: 'Error loading destination',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestination();
  }, [slugParam, toast]);

  // Helper function to create the attribution string with links
  const createAttributionText = (metadata: Destination['image_metadata']) => {
    if (!metadata) return null;

    // Prioritize structured data if available
    const { photographer_name, photographer_url, source, source_id, url } = metadata;

    if (photographer_name && source) {
      const sourceName = source.charAt(0).toUpperCase() + source.slice(1); // Capitalize source
      let sourceLink = url; // Use the direct image URL as default source link

      // Specific source links if needed
      if (source === 'pexels' && source_id) {
        sourceLink = `https://www.pexels.com/photo/${source_id}`;
      } else if (source === 'unsplash' && source_id) {
        // Assuming Unsplash structure, adjust if needed
        sourceLink = `https://unsplash.com/photos/${source_id}`;
      }

      const photographerPart = photographer_url
        ? `<a href="${photographer_url}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${photographer_name}</a>`
        : photographer_name;

      const sourcePart = sourceLink
        ? `<a href="${sourceLink}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${sourceName}</a>`
        : sourceName;

      return `Photo by ${photographerPart} on ${sourcePart}`;
    }

    // Fallback to existing attribution strings
    if (metadata.attributionHtml) return metadata.attributionHtml;
    if (metadata.attribution) return metadata.attribution; // Basic text fallback

    return null; // No attribution available
  };

  const renderRating = (rating: number | null | undefined, max = 5) => {
    if (rating === null || rating === undefined) return 'N/A';

    const stars = [];
    for (let i = 0; i < max; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const getDestinationImageData = (destination: Destination | null) => {
    if (!destination) {
      return {
        url: '/placeholder.svg',
        alt: 'Destination placeholder image',
        attributionHtml: null,
      };
    }

    let imageUrl = destination.image_url;
    if (imageUrl) {
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = `/destinations/${imageUrl}`;
      }
    } else {
      imageUrl = `/destinations/${destination.city.toLowerCase().replace(/\s+/g, '-')}-${destination.country.toLowerCase().replace(/\s+/g, `-`)}.jpg`;
    }

    return {
      url: imageUrl,
      alt: destination.image_metadata?.alt_text || `${destination.city}, ${destination.country}`,
      attributionHtml: createAttributionText(destination.image_metadata),
    };
  };

  if (!slugParam) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">Loading destination information...</div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/destinations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              back to destinations
            </Button>
          </Link>
        </div>
        <div className="h-64 w-full rounded-lg bg-muted animate-pulse"></div>
        <div className="mt-6 h-8 w-1/3 bg-muted animate-pulse rounded"></div>
        <div className="mt-4 h-4 w-2/3 bg-muted animate-pulse rounded"></div>
        <div className="mt-2 h-4 w-1/2 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (error || !destination) {
    const decodedCityForError = slugParam
      ? slugParam
      : 'the requested destination';
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/destinations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              back to destinations
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Destination Not Found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't find information about {decodedCityForError}.
          </p>
          <Button className="mt-4" onClick={() => router.push('/destinations')}>
            Browse All Destinations
          </Button>
        </div>
      </div>
    );
  }

  const imageData = getDestinationImageData(destination);

  // Use user.profile.name and fallback to 'My' if name is not available
  const profileName = user?.profile?.name ?? 'My';
  const defaultTripName = `${profileName}s trip to ${destination.city}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/destinations">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            back to destinations
          </Button>
        </Link>
      </div>

      <div className="relative mb-8 h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={imageData.url}
          alt={imageData.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
          className="object-cover"
        />
        {imageData.attributionHtml && (
          <div className="absolute bottom-4 right-4 z-10">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="rounded-full bg-black/40 p-1.5 text-white/80 hover:bg-black/60 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    aria-label="Image attribution information"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  sideOffset={5}
                  className="bg-black/90 text-white border-none shadow-lg max-w-xs"
                >
                  <p
                    className="text-xs"
                    dangerouslySetInnerHTML={{ __html: imageData.attributionHtml || '' }}
                  ></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="md:col-span-2 space-y-8">
          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold lowercase">{destination.city}</h2>
              </div>
              {destination.description && (
                <div
                  className="text-muted-foreground prose prose-sm dark:prose-invert [&>p]:my-4"
                  dangerouslySetInnerHTML={{
                    __html: destination.description.includes('<')
                      ? destination.description
                      : destination.description
                          .split('\n\n')
                          .map((block) => {
                            // Check if this block is a list
                            if (block.includes('\n') && !block.trim().endsWith('.')) {
                              const lines = block.split('\n').filter((line) => line.trim());
                              // If first line ends with a colon, it's likely a list header
                              const [first, ...rest] = lines;
                              if (first.trim().endsWith(':')) {
                                return `<p>${first}</p><ul>${rest
                                  .map((item) => `<li>${item.trim()}</li>`)
                                  .join('')}</ul>`;
                              }
                              // Otherwise treat all lines as list items
                              return `<ul>${lines
                                .map((item) => `<li>${item.trim()}</li>`)
                                .join('')}</ul>`;
                            }
                            return `<p>${block}</p>`;
                          })
                          .join(''),
                  }}
                />
              )}

              {destination.highlights && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 lowercase">highlights</h3>
                  <div
                    className="prose prose-sm dark:prose-invert [&>p]:my-4"
                    dangerouslySetInnerHTML={{
                      __html: destination.highlights.includes('<')
                        ? destination.highlights
                        : destination.highlights
                            .split('\n\n')
                            .map((block) => {
                              // Check if this block is a list
                              if (block.includes('\n') && !block.trim().endsWith('.')) {
                                const lines = block.split('\n').filter((line) => line.trim());
                                // If first line ends with a colon, it's likely a list header
                                const [first, ...rest] = lines;
                                if (first.trim().endsWith(':')) {
                                  return `<p>${first}</p><ul>${rest
                                    .map((item) => `<li>${item.trim()}</li>`)
                                    .join('')}</ul>`;
                                }
                                // Otherwise treat all lines as list items
                                return `<ul>${lines
                                  .map((item) => `<li>${item.trim()}</li>`)
                                  .join('')}</ul>`;
                              }
                              return `<p>${block}</p>`;
                            })
                            .join(''),
                    }}
                  />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {destination.family_friendly && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Family Friendly
                  </Badge>
                )}
                {destination.digital_nomad_friendly >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Digital Nomad Friendly
                  </Badge>
                )}
                {destination.beach_quality !== null && destination.beach_quality >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Great Beaches
                  </Badge>
                )}
                {destination.cultural_attractions >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Cultural Hotspot
                  </Badge>
                )}
                {destination.nightlife_rating >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Vibrant Nightlife
                  </Badge>
                )}
                {destination.outdoor_activities >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Outdoor Activities
                  </Badge>
                )}
                {destination.lgbtq_friendliness >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    LGBTQ+ Friendly
                  </Badge>
                )}
                {destination.accessibility >= 4 && (
                  <Badge variant="outline" className="transition-all duration-300 hover:scale-110">
                    Accessible
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <DestinationReviews destinationId={destination.id} destinationName={destination.city} />
        </div>

        <div className="space-y-8">
          <RelatedItinerariesWidget destinationId={destination.id} />

          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold lowercase">at a glance</h2>
                <Button
                  className="
                    relative overflow-hidden
                    lowercase rounded-full 
                    bg-gradient-to-r from-travel-purple/80 to-travel-purple 
                    hover:from-purple-400 hover:to-purple-500
                    text-white
                    text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8 
                    transition-all duration-300 hover:scale-105
                    before:absolute before:inset-0 before:bg-shimmer-gradient 
                    before:bg-no-repeat before:bg-200% 
                    before:animate-shimmer
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-travel-purple
                  "
                  onClick={() => {
                    router.push(
                      `/trips/create?destination_id=${destination.id}&trip_name=${encodeURIComponent(defaultTripName)}`
                    );
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                    <span>plan your trip</span>
                  </span>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" /> Best Time to Visit
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.best_season}</p>
                </div>
                <div className="transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" /> Average Daily Cost
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${destination.avg_cost_per_day} USD
                  </p>
                </div>
                <div className="transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" /> Local Language
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.local_language}</p>
                </div>
                <div className="transition-all duration-300 hover:scale-105">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" /> Time Zone
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.time_zone}</p>
                </div>
              </div>

              {destination.tourism_website && (
                <div className="mt-8">
                  <a
                    href={destination.tourism_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 transition-all duration-300 hover:translate-x-1"
                  >
                    <Globe className="h-4 w-4" />
                    Official Tourism Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold lowercase">city ratings</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Ratings are based on aggregated user reviews and WithMe.travel data
                        analysis.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: <Utensils className="h-4 w-4" />,
                    label: 'Cuisine',
                    value: destination.cuisine_rating,
                  },
                  {
                    icon: <Camera className="h-4 w-4" />,
                    label: 'Cultural Attractions',
                    value: destination.cultural_attractions,
                  },
                  {
                    icon: <Moon className="h-4 w-4" />,
                    label: 'Nightlife',
                    value: destination.nightlife_rating,
                  },
                  {
                    icon: <Sun className="h-4 w-4" />,
                    label: 'Outdoor Activities',
                    value: destination.outdoor_activities,
                  },
                  {
                    icon: <Shield className="h-4 w-4" />,
                    label: 'Safety',
                    value: destination.safety_rating,
                  },
                  {
                    icon: <Train className="h-4 w-4" />,
                    label: 'Public Transportation',
                    value: destination.public_transportation,
                  },
                  {
                    icon: <Walking className="h-4 w-4" />,
                    label: 'Walkability',
                    value: destination.walkability,
                  },
                  {
                    icon: <Wifi className="h-4 w-4" />,
                    label: 'Wi-Fi Connectivity',
                    value: destination.wifi_connectivity,
                  },
                  {
                    icon: <Heart className="h-4 w-4" />,
                    label: 'LGBTQ+ Friendliness',
                    value: destination.lgbtq_friendliness,
                  },
                  {
                    icon: <Accessibility className="h-4 w-4" />,
                    label: 'Accessibility',
                    value: destination.accessibility,
                  },
                  {
                    icon: <Leaf className="h-4 w-4" />,
                    label: 'Eco-Friendly Options',
                    value: destination.eco_friendly_options,
                  },
                  {
                    icon: <Instagram className="h-4 w-4" />,
                    label: 'Instagram-Worthy Spots',
                    value: destination.instagram_worthy_spots,
                  },
                  {
                    icon: <Briefcase className="h-4 w-4" />,
                    label: 'Digital Nomad Friendly',
                    value: destination.digital_nomad_friendly,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-muted/50"
                  >
                    <span className="text-sm flex items-center gap-1 text-muted-foreground">
                      {item.icon} {item.label}
                    </span>
                    {renderRating(item.value)}
                  </div>
                ))}

                <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-muted/50">
                  <span className="text-sm flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" /> Family Friendly
                  </span>
                  <span
                    className={`text-sm ${destination.family_friendly ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {destination.family_friendly ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Popular in {destination.city}</h2>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
              <div className="mt-4 text-center">
                <Button variant="link">View All Attractions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
