'use client';

import { useState } from 'react';
import {
  Clock,
  DollarSign,
  Heart,
  Globe,
  Calendar,
  Accessibility,
  Lightbulb,
  Leaf,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type SectionProps = {
  title: string;
  emoji: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

interface Metadata {
  budget?: string;
  budget_level?: string;
  pace?: string;
  travel_style?: string;
  audience?: string;
  seasonality?: string;
  highlights?: string[];
  rating?: number;
  languages?: {
    primary?: string;
    secondary?: string[];
  };
  best_times_to_visit?: string[];
  times_to_avoid?: string[];
  accessibility?: string;
  local_tips?: string[];
  sustainability?: string[];
  typical_start_time?: string;
}

interface DestinationDetailsProps {
  destination?: {
    city: string;
    country: string;
  };
  tags?: string[];
  metadata?: Metadata;
}

function CollapsibleSection({ title, emoji, defaultOpen = false, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 dark:border-border/20 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left py-3 px-1 min-h-[4rem]"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          <span
            className="text-2xl mr-3 flex items-center justify-center w-8"
            role="img"
            aria-hidden="true"
          >
            {emoji}
          </span>
          <h2 className="text-xl font-medium">{title}</h2>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 pl-12">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DestinationDetails({
  destination,
  tags,
  metadata = {},
}: DestinationDetailsProps) {
  const destinationTitle = destination
    ? `${destination.city}, ${destination.country}`
    : 'Paris, France';

  // Extract metadata values with fallbacks
  const pace = metadata.pace || 'Moderate with strategic rest periods';
  const budget = metadata.budget || metadata.budget_level || '$180 USD per day';
  const typicalStartTime = metadata.typical_start_time || '08:30 AM';
  // --- Language handling ---
  let languageBadges: string[] = [];
  if (Array.isArray(metadata.languages)) {
    languageBadges = metadata.languages;
  } else if (metadata.languages && typeof metadata.languages === 'object') {
    // Old object format
    if (metadata.languages.primary) languageBadges.push(metadata.languages.primary + ' (primary)');
    if (Array.isArray(metadata.languages.secondary)) {
      languageBadges = languageBadges.concat(metadata.languages.secondary);
    }
  } else {
    languageBadges = ['English', 'French'];
  }
  const bestTimesToVisit = metadata.best_times_to_visit || [
    'Spring (April-June)',
    'Fall (September-October)',
  ];
  const timesToAvoid = metadata.times_to_avoid || [
    'August (many local businesses close)',
    'Mid-winter (January-February)',
  ];
  const accessibility =
    metadata.accessibility ||
    'Moderate - extensive metro system but many historic sites have stairs; cobblestone streets in historic areas';

  // Fix for localTips - ensure it's always an array
  let localTips: string[] = [];
  if (Array.isArray(metadata.local_tips)) {
    localTips = metadata.local_tips;
  } else if (metadata.local_tips && typeof metadata.local_tips === 'string') {
    // Handle case where it might be a string
    localTips = [metadata.local_tips];
  } else {
    // Default fallback
    localTips = [
      'Purchase museum tickets online to avoid long queues',
      'The Paris Museum Pass is worth it if visiting 3+ major museums',
      'For authentic pastries, look for "Meilleur Ouvrier de France" certification',
    ];
  }

  // Fix for sustainability tips too, using the same pattern
  let sustainabilityTips: string[] = [];
  if (Array.isArray(metadata.sustainability)) {
    sustainabilityTips = metadata.sustainability;
  } else if (metadata.sustainability && typeof metadata.sustainability === 'string') {
    sustainabilityTips = [metadata.sustainability];
  } else {
    sustainabilityTips = [
      'Public transportation focus',
      'Support of local artisans and businesses',
      'Walking-centric exploration',
    ];
  }

  // Default tags if none provided
  const displayTags = tags?.length
    ? tags
    : ['Art lovers', 'Romantics', 'Food enthusiasts', 'Architecture admirers'];

  return (
    <div className="w-full mx-auto mb-6">
      <CollapsibleSection title="Essentials" emoji="✨" defaultOpen={true}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <Clock className="h-5 w-5 mt-1 text-foreground" />
              <div>
                <h3 className="font-medium text-base">Pace</h3>
                <p className="text-muted-foreground mt-1 text-sm">{pace}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <DollarSign className="h-5 w-5 mt-1 text-foreground" />
              <div>
                <h3 className="font-medium text-base">Budget</h3>
                <p className="text-muted-foreground mt-1 text-sm">{budget}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="h-5 w-5 mt-1 text-foreground" />
              <div>
                <h3 className="font-medium text-base">Typical Start</h3>
                <p className="text-muted-foreground mt-1 text-sm">{typicalStartTime}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Heart className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Perfect For</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {displayTags.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Globe className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Languages</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {languageBadges.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Planning" emoji="📅">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Calendar className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Seasonality</h3>
              <div className="mt-3">
                <h4 className="text-sm font-medium">Best times to visit:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {bestTimesToVisit.map((time, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 rounded-full text-sm"
                    >
                      {time}
                    </span>
                  ))}
                </div>

                <h4 className="text-sm font-medium mt-4">Times to avoid:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {timesToAvoid.map((time, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-muted/50 text-muted-foreground rounded-full text-sm"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Accessibility className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Accessibility</h3>
              <p className="text-muted-foreground mt-1">{accessibility}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Local Insights" emoji="💡">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Lightbulb className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Local Tips</h3>
              <ul className="mt-3 space-y-3 text-muted-foreground">
                {localTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-foreground mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Leaf className="h-5 w-5 mt-1 text-foreground" />
            <div>
              <h3 className="font-medium text-base">Sustainability</h3>
              <ul className="mt-3 space-y-3 text-muted-foreground">
                {sustainabilityTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-foreground mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
