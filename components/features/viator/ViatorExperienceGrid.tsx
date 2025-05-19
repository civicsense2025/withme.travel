'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronRight, Filter, Sliders } from 'lucide-react';
import { ViatorExperienceCard, ViatorExperienceProps } from './ViatorExperienceCard';

// Define proper types for experiences and handlers
interface ViatorExperience {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  productUrl: string;
  productCode: string;
  labels?: string[];
  [key: string]: any; // for additional properties
}

interface ViatorExperienceGridProps {
  title: string;
  subtitle?: string;
  experiences: ViatorExperience[];
  showViewAll?: boolean;
  viewAllUrl?: string;
  tripId?: string;
  categories?: string[];
  defaultCategory?: string;
  loading?: boolean;
  error?: string | null;
  onAddToItinerary?: (experience: ViatorExperience) => void;
  onSeeMore?: (experience: ViatorExperience) => void;
  emptyMessage?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ViatorExperienceGrid({
  title,
  subtitle,
  experiences,
  showViewAll = false,
  viewAllUrl = '',
  tripId,
  categories = [],
  defaultCategory = 'all',
  loading,
  error,
  onAddToItinerary,
  onSeeMore,
  emptyMessage,
  columns = 4,
}: ViatorExperienceGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [durationFilter, setDurationFilter] = useState<string | null>(null);

  // Extract the numeric price value for filtering
  const getNumericPrice = (priceString?: string) => {
    if (!priceString) return 0;
    const matches = priceString.match(/(\d+(\.\d+)?)/);
    return matches ? parseFloat(matches[0]) : 0;
  };

  // Filter experiences based on selected criteria
  const filteredExperiences = experiences.filter((exp) => {
    // Category filter
    if (selectedCategory !== 'all' && !exp.labels?.includes(selectedCategory)) {
      return false;
    }

    // Price filter
    const price = getNumericPrice(exp.price);
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }

    // Duration filter
    if (durationFilter && exp.duration) {
      if (
        durationFilter === 'short' &&
        exp.duration.includes('hour') &&
        parseInt(exp.duration.split(' ')[0], 10) > 3
      ) {
        return false;
      }
      if (
        durationFilter === 'medium' &&
        (parseInt(exp.duration.split(' ')[0], 10) < 3 ||
          parseInt(exp.duration.split(' ')[0], 10) > 6)
      ) {
        return false;
      }
      if (durationFilter === 'long' && parseInt(exp.duration.split(' ')[0], 10) < 6) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="mb-10 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">{title}</h2>
          {subtitle && <p className="mt-1 text-secondary-text">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden sm:flex"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>

          {showViewAll && viewAllUrl && (
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Tabs defaultValue={defaultCategory} className="mb-6" onValueChange={setSelectedCategory}>
          <TabsList className="bg-surface-subtle">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-lg bg-surface-subtle p-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price-range">Price Range (USD)</Label>
              <Slider
                id="price-range"
                defaultValue={[0, 500]}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={durationFilter || 'all'}
                onValueChange={(value) => setDurationFilter(value === 'all' ? null : value)}
              >
                <SelectTrigger id="duration">
                  <SelectValue>All Durations</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Short (less than 3 hours)</SelectItem>
                  <SelectItem value="medium">Medium (3-6 hours)</SelectItem>
                  <SelectItem value="long">Long (6+ hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                className="mt-auto"
                onClick={() => {
                  setPriceRange([0, 500]);
                  setDurationFilter(null);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Experiences Grid */}
      {filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExperiences.map((experience) => (
            <ViatorExperienceCard {...(experience as ViatorExperienceProps)} key={experience.id} />
          ))}
        </div>
      ) : (
        <div className="my-12 text-center">
          <p className="text-lg text-secondary-text">No experiences found matching your filters.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setPriceRange([0, 500]);
              setDurationFilter(null);
              setSelectedCategory('all');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
