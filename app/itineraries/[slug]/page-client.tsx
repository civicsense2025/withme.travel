'use client';

import React from 'react';
import { ItineraryTemplateDisplay } from '@/components/itinerary/itinerary-template-display';
import { UseTemplateButton } from '@/components/use-template-button';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Calendar, MapPin, Clock, User, Star, Tag, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define types to match the server component and database schema
interface ItineraryTemplateItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  item_order: number;
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
  const { toast } = useToast();

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

  // Extract important metadata fields with fallbacks
  const budget = template.metadata?.budget || '';
  const budgetLevel = template.metadata?.budget_level || '';
  const pace = template.metadata?.pace || '';
  const travelStyle = template.metadata?.travel_style || '';
  const audience = template.metadata?.audience || '';
  const seasonality = template.metadata?.seasonality || '';
  const highlights = template.metadata?.highlights || [];
  const rating = template.metadata?.rating || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Sidebar (moved from right) */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Use This Itinerary</h3>
              <p className="text-sm text-muted-foreground">
                Create a trip based on this itinerary to customize it for your own adventure.
              </p>

              <UseTemplateButton
                templateId={template.id}
                templateSlug={template.slug}
                templateTitle={template.title}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" onClick={handleShareItinerary} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">About This Itinerary</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{template.duration_days} days</p>
              </div>

              {template.destination && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">
                    {template.destination.city}, {template.destination.country}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(template.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="font-medium">{template.view_count || 0}</p>
              </div>

              {rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{rating}/5</p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* New metadata section */}
            <h4 className="font-medium mb-3">Details</h4>
            <div className="space-y-3">
              {budgetLevel && (
                <div>
                  <p className="text-sm text-muted-foreground">Budget Level</p>
                  <p className="font-medium">{budgetLevel}</p>
                </div>
              )}

              {pace && (
                <div>
                  <p className="text-sm text-muted-foreground">Pace</p>
                  <p className="font-medium">{pace}</p>
                </div>
              )}

              {travelStyle && (
                <div>
                  <p className="text-sm text-muted-foreground">Travel Style</p>
                  <p className="font-medium">{travelStyle}</p>
                </div>
              )}

              {audience && (
                <div>
                  <p className="text-sm text-muted-foreground">Perfect For</p>
                  <p className="font-medium">{audience}</p>
                </div>
              )}

              {seasonality && (
                <div>
                  <p className="text-sm text-muted-foreground">Best Season</p>
                  <p className="font-medium">{seasonality}</p>
                </div>
              )}

              {budget && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Budget</p>
                  <p className="font-medium">{budget}</p>
                </div>
              )}
            </div>

            {highlights && highlights.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-2">Highlights</h4>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {highlights.map((highlight: string, index: number) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {template.tags && template.tags.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Main Content (moved from left) */}
        <div className="lg:col-span-2">
          <ItineraryTemplateDisplay template={template} sections={sections} />
        </div>
      </div>
    </div>
  );
}
