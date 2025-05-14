import React from 'react';
import { HeroBanner } from './HeroBanner';
import { QuickFactsCard } from './QuickFactsCard';
import { HighlightsList } from './HighlightsList';
import { EssentialsSection } from './EssentialsSection';
import { AboutCreatorCard } from './AboutCreatorCard';
import { TemplateActionsCard } from './TemplateActionsCard';
import { ReviewList, Review } from './ReviewList';
import { ItineraryCard } from './ItineraryCard';
import { WeatherForecast, WeatherDay } from './WeatherForecast';
import { CalendarView, CalendarEvent } from './CalendarView';

export interface ItineraryPageProps {
  title: string;
  subtitle?: string;
  heroImageUrl: string;
  quickFacts?: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  highlights?: string[];
  essentials?: {
    pace: string;
    budget: string;
    startTime: string;
    tags?: string[];
    languages?: string[];
  };
  creatorInfo?: {
    name: string;
    avatarUrl?: string;
    tagline?: string;
    description: string;
  };
  reviews?: Review[];
  similarItineraries?: Array<{
    id: string;
    title: string;
    description: string;
    travelerCount?: number;
  }>;
  calendarEvents?: CalendarEvent[];
  weatherForecast?: {
    location: string;
    days: WeatherDay[];
  };
  isSaved?: boolean;
  onUseTemplate?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onItineraryClick?: (id: string) => void;
}

/**
 * ItineraryPage displays a complete itinerary with all its details and related components.
 * @example <ItineraryPage title="Rio Adventure" heroImageUrl="/rio.jpg" {...otherProps} />
 */
export function ItineraryPage({
  title,
  subtitle,
  heroImageUrl,
  quickFacts,
  highlights,
  essentials,
  creatorInfo,
  reviews,
  similarItineraries,
  calendarEvents,
  weatherForecast,
  isSaved,
  onUseTemplate,
  onShare,
  onSave,
  onItineraryClick,
}: ItineraryPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      {/* Hero Banner */}
      <HeroBanner
        imageUrl={heroImageUrl}
        title={title}
        subtitle={subtitle}
        meta={
          <>
            <span>🕒 5 days</span>
            <span>👀 39 views</span>
          </>
        }
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Essentials Section */}
          {essentials && (
            <EssentialsSection
              pace={essentials.pace}
              budget={essentials.budget}
              startTime={essentials.startTime}
              tags={essentials.tags}
              languages={essentials.languages}
            />
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <HighlightsList highlights={highlights} title="Trip Highlights" />
          )}

          {/* Calendar View */}
          {calendarEvents && calendarEvents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Trip Schedule</h2>
              <CalendarView events={calendarEvents} />
            </div>
          )}

          {/* Reviews Section */}
          {reviews && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Traveler Reviews</h2>
              <ReviewList reviews={reviews} />
            </div>
          )}

          {/* Similar Itineraries */}
          {similarItineraries && similarItineraries.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Similar Itineraries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarItineraries.map((itinerary) => (
                  <ItineraryCard
                    key={itinerary.id}
                    title={itinerary.title}
                    description={itinerary.description}
                    travelerCount={itinerary.travelerCount}
                    onClick={() => onItineraryClick && onItineraryClick(itinerary.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Actions */}
          <TemplateActionsCard
            onUse={onUseTemplate}
            onShare={onShare}
            onSave={onSave}
            isSaved={isSaved}
          />

          {/* Quick Facts */}
          {quickFacts && <QuickFactsCard title="Quick Facts" facts={quickFacts} />}

          {/* Weather Forecast */}
          {weatherForecast && (
            <WeatherForecast location={weatherForecast.location} days={weatherForecast.days} />
          )}

          {/* About the Creator */}
          {creatorInfo && (
            <AboutCreatorCard
              name={creatorInfo.name}
              avatarUrl={creatorInfo.avatarUrl}
              tagline={creatorInfo.tagline}
              description={creatorInfo.description}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ItineraryPage;
