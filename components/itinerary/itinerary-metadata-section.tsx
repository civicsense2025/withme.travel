import React from 'react';
import {
  Clock,
  Globe,
  Calendar,
  Lightbulb,
  DollarSign,
  Heart,
  Accessibility,
  Leaf,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ItineraryMetadata {
  pace?: string;
  best_for?: string[];
  languages?: string[];
  local_tips?: string[];
  best_seasons?: string[];
  avoid_seasons?: string[];
  morning_start?: string;
  accessibility_level?: string;
  sustainability_aspects?: string[];
  estimated_budget_usd_per_day?: number;
}

interface ItineraryMetadataSectionProps {
  metadata: ItineraryMetadata;
}

export const ItineraryMetadataSection: React.FC<ItineraryMetadataSectionProps> = ({ metadata }) => {
  // Safe extraction with fallbacks
  const {
    pace = '',
    best_for = [],
    languages = [],
    local_tips = [],
    best_seasons = [],
    avoid_seasons = [],
    morning_start = '',
    accessibility_level = '',
    sustainability_aspects = [],
    estimated_budget_usd_per_day = 0,
  } = metadata || {};

  // Return null if no metadata available
  if (
    !metadata ||
    Object.keys(metadata).every((key) => !metadata[key as keyof ItineraryMetadata])
  ) {
    return null;
  }

  return (
    <div className="mb-12 bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Top section with key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {pace && (
          <div className="flex space-x-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pace</p>
              <p className="text-sm mt-1">{pace}</p>
            </div>
          </div>
        )}

        {estimated_budget_usd_per_day > 0 && (
          <div className="flex space-x-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Daily Budget</p>
              <p className="text-sm mt-1">${estimated_budget_usd_per_day} USD per day</p>
            </div>
          </div>
        )}

        {morning_start && (
          <div className="flex space-x-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Typical Start</p>
              <p className="text-sm mt-1">{morning_start}</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Expandable sections */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Target Audience */}
        {best_for && best_for.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Perfect For</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {best_for.map((item, i) => (
                <Badge key={i} variant="outline" className="bg-background">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Seasons */}
        {(best_seasons?.length > 0 || avoid_seasons?.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Seasonality</h3>
            </div>
            {best_seasons?.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Best times to visit:</p>
                <div className="flex flex-wrap gap-2">
                  {best_seasons.map((season, i) => (
                    <Badge key={i} variant="outline" className="bg-background">
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {avoid_seasons?.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-muted-foreground">Times to avoid:</p>
                <div className="flex flex-wrap gap-2">
                  {avoid_seasons.map((season, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-background/80 text-muted-foreground"
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Languages</h3>
            </div>
            <ul className="text-sm space-y-1">
              {languages.map((language, i) => (
                <li key={i}>{language}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Accessibility */}
        {accessibility_level && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Accessibility</h3>
            </div>
            <p className="text-sm">{accessibility_level}</p>
          </div>
        )}

        {/* Local Tips */}
        {local_tips && local_tips.length > 0 && (
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Local Tips</h3>
            </div>
            <ul className="text-sm space-y-2">
              {local_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary text-lg mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sustainability */}
        {sustainability_aspects && sustainability_aspects.length > 0 && (
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Sustainability</h3>
            </div>
            <ul className="text-sm space-y-2">
              {sustainability_aspects.map((aspect, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary text-lg mt-0.5">•</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
