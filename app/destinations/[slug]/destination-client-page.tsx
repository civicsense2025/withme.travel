'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { DestinationReviews } from '@/components/features/destinations/destination-reviews';
import { useAuth } from '@/lib/hooks/use-auth';
import { AuthContextType } from '@/components/features/auth';
import { RelatedItinerariesWidget } from '@/components/features/destinations/related-itineraries-widget';
import { DestinationPageAdminEditor } from '@/components/features/admin';
import { ImageAttribution } from '@/components/features/images';
import { DestinationExperiences, DestinationAttractions } from '@/components/features/viator';

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
  viator_destination_id?: string;
}

interface DestinationClientPageProps {
  slug: string;
}

export default function DestinationClientPage({ slug }: DestinationClientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth() as AuthContextType;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError('No destination specified');
      setIsLoading(false);
      return;
    }

    async function fetchDestination() {
      try {
        setIsLoading(true);
        setError(null);

        // Check if the slug appears to be an image filename
        if (slug.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)) {
          setError(`Invalid destination format`);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/destinations/by-slug/${encodeURIComponent(slug)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Destination '${slug}' not found`);
            return;
          }
          throw new Error(`Failed to fetch destination: ${response.status}`);
        }

        // Check for HTML response before trying to parse JSON
        const responseText = await response.text();
        if (responseText.trim().startsWith('<!') || responseText.includes('<html')) {
          console.error('Received HTML instead of JSON');
          setError('Received invalid response format from server');
          return;
        }

        // Parse the response as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing destination JSON:', parseError);
          throw new Error('Failed to parse destination data');
        }

        setDestination(data.destination);
      } catch (err: any) {
        console.error('Error fetching destination:', err);
        setError(err.message || 'Failed to load destination details');
        toast({
          title: 'Error loading destination',
          description: 'Please try again later',
          variant: 'destructive',
          children: (
            <>Error loading destination</>
          ),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestination();
  }, [slug, toast]);

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

  const handleCreateTrip = async () => {
    if (!destination) return;

    try {
      setIsCreatingTrip(true);
      const response = await fetch(
        `/api/trips/create?destination_id=${destination.id}&trip_name=${encodeURIComponent(destination.name)}`
      );

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      const data = await response.json();
      router.push(`/trips/${data.trip.id}`);
    } catch (err: any) {
      console.error('Error creating trip:', err);
      toast({
        title: 'Error creating trip',
        description: 'Please try again later',
        variant: 'destructive',
        children: (
          <>Error creating trip</>
        ),
      });
    } finally {
      setIsCreatingTrip(false);
    }
  };

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
          <p className="text-muted-foreground mt-2">We couldn't find information about {slug}.</p>
          <Button className="mt-4" onClick={() => router.push('/destinations')}>
            Browse All Destinations
          </Button>
        </div>
      </div>
    );
  }

  const imageData = getDestinationImageData(destination);

  // Use user's name and fallback to 'My' if not available
  const profileName = user?.name ?? user?.email?.split('@')[0] ?? 'My';
  const defaultTripName = `${profileName}'s trip to ${destination.city}`;

  return (
    <div className="mx-auto">
      {/* Back navigation */}
      <div className="max-w-screen-2xl mx-auto px-6 py-4 mb-2">
        <Link href="/destinations">
          <Button variant="ghost" size="sm" className="gap-1 text-sm font-normal">
            <ArrowLeft className="h-4 w-4" />
            back to destinations
          </Button>
        </Link>
      </div>

      {/* Hero image section with large title overlay */}
      <div className="relative w-full h-[70vh] mb-16 overflow-hidden">
        <Image
          src={imageData.url}
          alt={imageData.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 max-w-screen-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-medium text-white mb-2">{destination.city}</h1>
          <p className="text-2xl text-white/90 mb-8">{destination.country}</p>
          <Button
            onClick={handleCreateTrip}
            disabled={isCreatingTrip}
            className="relative overflow-hidden 
                rounded-full bg-white text-black hover:bg-white/90
                text-base sm:text-base px-8 py-6 h-12 
                transition-all duration-300 hover:scale-105 mb-6"
          >
            {isCreatingTrip ? 'Creating...' : `Start planning a trip to ${destination.city}`}
          </Button>
        </div>

        {imageData.attributionHtml && (
          <ImageAttribution
            image={{
              alt_text: imageData.alt,
              attribution_html: imageData.attributionHtml,
              photographer: destination?.image_metadata?.photographer_name,
              photographer_url: destination?.image_metadata?.photographer_url,
              source: destination?.image_metadata?.source,
              external_id: destination?.image_metadata?.source_id,
              url: destination?.image_metadata?.url,
            }}
            variant="info-icon"
          />
        )}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-16">
            {/* Description section */}
            <div>
              <h2 className="text-3xl font-medium mb-8">About</h2>
              {destination.description && (
                <div
                  className="text-lg text-muted-foreground prose prose-lg dark:prose-invert [&>p]:my-6 leading-relaxed"
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
            </div>

            {/* Highlights section */}
            {destination.highlights && (
              <div>
                <h2 className="text-3xl font-medium mb-8">Highlights</h2>
                <div
                  className="text-lg text-muted-foreground prose prose-lg dark:prose-invert [&>p]:my-6 leading-relaxed"
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

            {/* Viator Attractions Section */}
            <DestinationAttractions
              destinationId={destination.id}
              destinationName={destination.city}
              viatorDestinationId={destination.viator_destination_id}
              limit={6}
            />

            {/* Viator Experiences Section */}
            <DestinationExperiences
              destinationId={destination.id}
              destinationName={destination.city}
              cityName={destination.city}
              viatorDestinationId={destination.viator_destination_id}
              limit={10}
            />

            {/* Tags section */}
            <div>
              <h2 className="text-3xl font-medium mb-8">Travel Style</h2>
              <div className="flex flex-wrap gap-3">
                {destination.family_friendly && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Family Friendly
                  </Badge>
                )}
                {destination.digital_nomad_friendly >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Digital Nomad Friendly
                  </Badge>
                )}
                {destination.beach_quality !== null && destination.beach_quality >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Great Beaches
                  </Badge>
                )}
                {destination.cultural_attractions >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Cultural Hotspot
                  </Badge>
                )}
                {destination.nightlife_rating >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Vibrant Nightlife
                  </Badge>
                )}
                {destination.outdoor_activities >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Outdoor Activities
                  </Badge>
                )}
                {destination.lgbtq_friendliness >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    LGBTQ+ Friendly
                  </Badge>
                )}
                {destination.accessibility >= 4 && (
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    Accessible
                  </Badge>
                )}
              </div>
            </div>

            {/* Admin editor if required */}
            {destination && <DestinationPageAdminEditor destination={destination} />}

            {/* Reviews section */}
            <DestinationReviews destinationId={destination.id} destinationName={destination.city} />
          </div>

          <div className="space-y-12">
            {/* Itineraries widget */}
            <RelatedItinerariesWidget destinationId={destination.id} />

            {/* Quick facts card */}
            <div className="bg-muted/30 border rounded-3xl p-8">
              <h3 className="text-2xl font-medium mb-8">Quick Facts</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Time to Visit</p>
                    <p className="font-medium">{destination.best_season || 'Any time'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Local Language</p>
                    <p className="font-medium">{destination.local_language || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Budget (USD)</p>
                    <p className="font-medium">
                      {destination.avg_cost_per_day
                        ? `$${destination.avg_cost_per_day.toFixed(0)}`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Utensils className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Food Scene</p>
                    <div className="mt-1">{renderRating(destination.cuisine_rating)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cultural Attractions</p>
                    <div className="mt-1">{renderRating(destination.cultural_attractions)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Safety Rating</p>
                    <div className="mt-1">{renderRating(destination.safety_rating)}</div>
                  </div>
                </div>
              </div>

              {/* Tourism website link */}
              {destination.tourism_website && (
                <div className="mt-8">
                  <a
                    href={destination.tourism_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Official Tourism Website
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
