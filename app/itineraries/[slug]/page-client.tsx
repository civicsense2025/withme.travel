'use client';

import React, { useState } from 'react';
import { ItineraryTemplateDisplay } from '@/components/features/itinerary/organisms/ItineraryTemplateDisplay';
import { UseTemplateButton } from '@/components/features/itinerary/molecules/UseTemplateButton';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Share2,
  Calendar,
  MapPin,
  Clock,
  User,
  Star,
  Tag,
  Info,
  ArrowLeft,
  ChevronDown,
  PlusCircle,
  ListChecks,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/components/features/auth/organisms/AuthProvider';
import { ItineraryMetadataSection } from '@/components/features/itinerary/organisms/ItineraryMetadataSection';
import DestinationDetails from '@/components/features/destinations/molecules/DestinationDetails';
import { ImageAttribution } from '@/components/features/images/molecules/ImageAttribution';
import { DestinationExperiences } from '@/components/features/viator/molecules/DestinationExperiences';

// Define types to match the server component and database schema
interface ItineraryTemplateItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  item_order: number;
  type?: string;
}

interface ItineraryTemplateSection {
  id: string;
  title: string;
  day_number: number;
  position: number;
  items: ItineraryTemplateItem[];
}

interface ItineraryTemplate {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  destination_id: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  tags: string[];
  created_by: string;
  metadata: Record<string, any>;
  destination?: {
    id: string;
    city: string;
    country: string;
    image_url: string | null;
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
  };
}

interface ItineraryTemplatePageClientProps {
  template: ItineraryTemplate;
  sections: ItineraryTemplateSection[];
}

export default function ItineraryTemplatePageClient({
  template,
  sections,
}: ItineraryTemplatePageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const session = useAuth();
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isApplyingToTrip, setIsApplyingToTrip] = useState(false);

  console.log(
    `[DEBUG] ItineraryTemplatePageClient - template.id: ${template.id}, title: ${template.title}`
  );
  console.log(`[DEBUG] ItineraryTemplatePageClient - Received ${sections.length} sections`);

  // Log sections info
  if (sections.length === 0) {
    console.log('[DEBUG] ItineraryTemplatePageClient - No sections found for this template');
  } else {
    sections.forEach((section) => {
      console.log(
        `[DEBUG] ItineraryTemplatePageClient - Section: ${section.id}, day: ${section.day_number}, items: ${section.items?.length || 0}`
      );
    });
  }

  // Extract important metadata fields with fallbacks
  const budget = template.metadata?.budget || '';
  const budgetLevel = template.metadata?.budget_level || '';
  const pace = template.metadata?.pace || '';
  const travelStyle = template.metadata?.travel_style || '';
  const audience = template.metadata?.audience || '';
  const seasonality = template.metadata?.seasonality || '';
  const highlights = template.metadata?.highlights || [];
  const rating = template.metadata?.rating || 0;

  // Image attribution helper
  const createAttributionText = (metadata?: any) => {
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

  const handleShareItinerary = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: template.title,
          text: template.description || `Check out this ${template.duration_days}-day itinerary!`,
          url,
        })
        .catch((error) => {
          // Only log errors other than AbortError (which happens when user cancels share)
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.error('Error sharing:', error);
          }
        });
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast({
            title: 'Link copied!',
            description: 'The link to this itinerary has been copied to your clipboard.',
          });
        })
        .catch((error) => {
          console.error('Error copying link:', error);
          toast({
            title: 'Error copying link',
            description: 'Please try again or copy the URL manually.',
            variant: 'destructive',
          });
        });
    }
  };

  // Handle creating a new trip from the template
  const handleCreateNewTrip = async () => {
    if (!session.user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a trip from this template.',
        variant: 'destructive',
      });
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setIsCreatingTrip(true);
    try {
      const response = await fetch(`/api/trips/create-from-template/${template.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Trip to ${template.destination?.city || 'destination'}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      const data = await response.json();
      toast({
        title: 'Trip Created',
        description: 'Your new trip has been created based on this template.',
      });

      // Redirect to the new trip
      router.push(`/trips/${data.trip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: 'Error',
        description: 'Could not create trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTrip(false);
    }
  };

  // Handle applying template to existing trip
  const handleApplyToTrip = () => {
    if (!session.user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to apply this template to your trips.',
        variant: 'destructive',
      });
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // This would open a dialog to select which trip to apply to
    router.push(`/trips?select=true&templateId=${template.id}`);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Image attribution
  const imageAttribution = template.destination?.image_metadata
    ? createAttributionText(template.destination.image_metadata)
    : null;

  // Map sections/items to the Day/ItineraryItem shape expected by ItineraryTemplateDisplay
  const allowedTypes = [
    'accommodation',
    'activity',
    'breakfast',
    'lunch',
    'dinner',
    'transport',
  ] as const;

  type AllowedType = (typeof allowedTypes)[number];

  function isAllowedType(type: any): type is AllowedType {
    return allowedTypes.includes(type);
  }

  const days = sections.map((section) => ({
    id: section.id,
    date: `Day ${section.day_number}`,
    dayNumber: section.day_number,
    items: (section.items || []).map((item) => {
      let type: AllowedType = 'activity';
      if (isAllowedType(item.type)) {
        type = item.type;
      }
      return {
        id: item.id,
        type,
        title: item.title,
        time: item.start_time || '',
        location: item.location || '',
        duration: '',
        notes: item.description || '',
        icon: undefined,
        votes: 0,
      };
    }),
  }));

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Back navigation */}
      <div className="px-6 py-4">
        <Link href="/itineraries">
          <Button variant="ghost" size="sm" className="gap-1 font-normal">
            <ArrowLeft className="h-4 w-4" />
            Back to itineraries
          </Button>
        </Link>
      </div>
      {/* Hero section - reduced height to 420px max */}
      <div className="relative w-full h-[420px] mb-12 overflow-hidden rounded-xl">
        <Image
          src={template.destination?.image_url || '/images/placeholder-itinerary.jpg'}
          alt={template.title}
          fill
          quality={90}
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Show title, destination, metadata in the hero */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-3">
            <h1 className="text-4xl font-medium tracking-tight">{template.title}</h1>
            {template.destination && (
              <h3 className="text-xl text-white/90">
                {template.destination.city}, {template.destination.country}
              </h3>
            )}
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{template.duration_days} days</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{template.view_count || 0} views</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image attribution */}
        {template.destination?.image_metadata && (
          <ImageAttribution
            image={{
              alt_text: template.destination.image_metadata.alt_text,
              attribution_html: template.destination.image_metadata.attributionHtml,
              photographer: template.destination.image_metadata.photographer_name,
              photographer_url: template.destination.image_metadata.photographer_url,
              source: template.destination.image_metadata.source,
              external_id: template.destination.image_metadata.source_id,
              url: template.destination.image_metadata.url,
            }}
            variant="info-icon"
          />
        )}
      </div>
      <div className="px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main content */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            {/* Description */}
            {template.description && (
              <div className="mb-12">
                <h2 className="text-2xl font-medium mb-4">About this itinerary</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </div>
            )}

            {/* Add the metadata section here, before day-by-day */}
            {template.metadata && Object.keys(template.metadata).length > 0 && (
              <>
                <h2 className="text-2xl font-medium mb-4">
                  What to know about {template.destination?.city}, {template.destination?.country}
                </h2>
                <DestinationDetails
                  destination={template.destination}
                  tags={template.tags}
                  metadata={template.metadata}
                />
              </>
            )}

            {/* Itinerary content */}
            <h2 className="text-2xl font-medium mt-12 mb-8">Day-by-day itinerary</h2>
            <ItineraryTemplateDisplay
              name={template.title}
              destination={`${template.destination?.city || ''}, ${template.destination?.country || ''}`}
              days={days}
            />

            {/* Viator Experiences Section - only show if destination exists */}
            {template.destination && (
              <div className="mt-12">
                <h2 className="text-2xl font-medium mb-8">Tours & Activities</h2>
                <DestinationExperiences
                  destinationId={template.destination.id}
                  destinationName={template.destination.city}
                  limit={4}
                />
              </div>
            )}
          </motion.div>

          {/* Right sidebar */}
          <motion.div className="space-y-8" initial="hidden" animate="visible" variants={slideUp}>
            {/* Use this itinerary card with dropdown */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-card p-8 shadow-sm">
              <div className="space-y-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-full py-6 rounded-xl bg-black text-white hover:bg-black/80 gap-1">
                      Use Template
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 rounded-xl">
                    <div className="grid gap-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal hover:bg-black/5"
                        onClick={handleCreateNewTrip}
                        disabled={isCreatingTrip}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create new trip
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal hover:bg-black/5"
                        onClick={handleApplyToTrip}
                        disabled={isApplyingToTrip}
                      >
                        <ListChecks className="mr-2 h-4 w-4" />
                        Apply to trip
                      </Button>
                      <p>* An account is required to copy an itinerary</p>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShareItinerary}
                    className="flex-1 rounded-xl"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <Button variant="outline" size="lg" className="flex-1 rounded-xl">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Highlights section - moved from main content to sidebar */}
            {highlights && highlights.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-card p-8 shadow-sm">
                <h3 className="text-xl font-medium mb-4">Highlights</h3>
                <ul className="space-y-3">
                  {highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary text-lg mt-0.5">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details card - updated to be about the creator */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-card p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-medium">About the Creator</h3>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent-purple" />
                </div>
                <div>
                  <h4 className="text-base font-medium">Local Travel Expert</h4>
                  <p className="text-sm text-muted-foreground">
                    Creating exceptional itineraries since 2020
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This local expert creates personalized travel experiences based on extensive
                research and personal visits to each destination.
              </p>

              <Button variant="outline" className="w-full mt-2">
                Support Creator
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
