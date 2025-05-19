'use client';

import { useState, useEffect } from 'react';
import {
  ViatorExperienceCard,
  ViatorExperienceProps,
} from '@/components/features/viator/ViatorExperienceCard';
import { ViatorExperienceGrid } from '@/components/features/viator/ViatorExperienceGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Globe, Clock, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface PopularDestination {
  id: string; // Viator destination ID
  name: string;
  imageUrl: string;
}

export default function ViatorSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [activeTab, setActiveTab] = useState('popular');
  const [searchResults, setSearchResults] = useState<ViatorExperienceProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock popular destinations
  const popularDestinations: PopularDestination[] = [
    {
      id: '737',
      name: 'Paris',
      imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147',
    },
    {
      id: '662',
      name: 'Rome',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    },
    {
      id: '503',
      name: 'London',
      imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be',
    },
    {
      id: '687',
      name: 'New York',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    },
    {
      id: '684',
      name: 'Barcelona',
      imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216',
    },
    {
      id: '524',
      name: 'Tokyo',
      imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
    },
  ];

  // Mock categories for filtering
  const experienceCategories = [
    'Walking Tours',
    'Day Trips',
    'Sightseeing',
    'Food & Drink',
    'Outdoor Activities',
    'Cultural Tours',
    'Museum Tickets',
    'Shows & Performances',
    'Water Activities',
  ];

  // Mock popular experiences - would be replaced by API call in production
  const mockPopularExperiences: ViatorExperienceProps[] = [
    {
      id: '101',
      title: 'Skip-the-Line Eiffel Tower Tour with Summit Access',
      description:
        'Skip the long lines at the Eiffel Tower with this tour that includes summit access. Enjoy the best views of Paris!',
      imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
      price: '$89.99',
      duration: '2 hours',
      rating: 4.8,
      reviewCount: 3240,
      location: 'Paris, France',
      productUrl: 'https://www.viator.com/tours/Paris/Skip-the-Line-Eiffel-Tower-Tour',
      productCode: 'EIFFEL123',
      labels: ['Skip-the-Line', 'Guided Tour'],
    },
    {
      id: '102',
      title: 'Colosseum Skip-the-Line Guided Tour',
      description:
        'Bypass the queue and explore the Colosseum, Roman Forum, and Palatine Hill on this guided tour.',
      imageUrl: 'https://images.unsplash.com/photo-1552432552-06c0b6004b68',
      price: '$59.99',
      duration: '3 hours',
      rating: 4.7,
      reviewCount: 5420,
      location: 'Rome, Italy',
      productUrl: 'https://www.viator.com/tours/Rome/Colosseum-Skip-the-Line-Tour',
      productCode: 'COLO456',
      labels: ['Skip-the-Line', 'Historical'],
    },
    {
      id: '103',
      title: 'Barcelona: Sagrada Familia Fast-Track Ticket',
      description:
        "Visit Barcelona's most famous landmark, the Sagrada Familia, without waiting in line.",
      imageUrl: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57',
      price: '$35.99',
      duration: 'Flexible',
      rating: 4.9,
      reviewCount: 7845,
      location: 'Barcelona, Spain',
      productUrl: 'https://www.viator.com/tours/Barcelona/Sagrada-Familia-Fast-Track',
      productCode: 'SAGRA789',
      labels: ['Fast-Track', 'Monuments'],
    },
    {
      id: '104',
      title: 'London Eye Fast-Track Ticket',
      description:
        'Enjoy priority boarding and skip the lengthy queue with a fast-track ticket to the London Eye.',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
      price: '$45.99',
      duration: '30 minutes',
      rating: 4.5,
      reviewCount: 4120,
      location: 'London, UK',
      productUrl: 'https://www.viator.com/tours/London/London-Eye-Fast-Track',
      productCode: 'LONDONEYE101',
      labels: ['Fast-Track', 'Observation Decks'],
    },
    {
      id: '105',
      title: 'New York: Top of the Rock Observation Deck Ticket',
      description:
        'Experience breathtaking views of Manhattan from the Top of the Rock Observation Deck.',
      imageUrl: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7',
      price: '$42.99',
      duration: 'Flexible',
      rating: 4.7,
      reviewCount: 3615,
      location: 'New York, USA',
      productUrl: 'https://www.viator.com/tours/New-York/Top-of-the-Rock',
      productCode: 'TOPRCK202',
      labels: ['Observation Decks', 'City Views'],
    },
    {
      id: '106',
      title: 'Tokyo: Robot Restaurant Show Ticket',
      description: "Experience the famous Robot Restaurant Show in Tokyo's Shinjuku district.",
      imageUrl: 'https://images.unsplash.com/photo-1526400473556-aac12354f3db',
      price: '$79.99',
      duration: '1.5 hours',
      rating: 4.4,
      reviewCount: 2105,
      location: 'Tokyo, Japan',
      productUrl: 'https://www.viator.com/tours/Tokyo/Robot-Restaurant',
      productCode: 'ROBOT303',
      labels: ['Shows', 'Nightlife'],
    },
  ];

  const [filteredExperiences, setFilteredExperiences] =
    useState<ViatorExperienceProps[]>(mockPopularExperiences);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState('popularity');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      // This simulates the API call to get experiences
      let results = mockPopularExperiences;

      // Filter by destination
      if (selectedDestination) {
        // In a real app, you would call the Viator API with the destination ID
        // For now we'll just simulate this by filtering our mocked data
        results = results.filter((exp) => exp.location === selectedDestination);
      }

      // Filter by category
      if (selectedCategory) {
        results = results.filter((exp) =>
          exp.labels?.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
        );
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          (experience) =>
            experience.title.toLowerCase().includes(query) ||
            experience.description?.toLowerCase().includes(query) ||
            false ||
            experience.location?.toLowerCase().includes(query) ||
            false
        );
      }

      // Sort results
      if (sortOption === 'price-low') {
        results.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^\d.]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^\d.]/g, '') || '0');
          return priceA - priceB;
        });
      } else if (sortOption === 'price-high') {
        results.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^\d.]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^\d.]/g, '') || '0');
          return priceB - priceA;
        });
      } else if (sortOption === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // Default is popularity, no need to sort

      setFilteredExperiences(results);
      setIsLoading(false);
    }, 500); // Simulate loading delay

    return () => clearTimeout(timer);
  }, [
    selectedDestination,
    selectedCategory,
    sortOption,
    searchQuery,
    mockPopularExperiences,
    popularDestinations,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the useEffect
    setActiveTab('search');
  };

  const handleDestinationSelect = (destination: PopularDestination) => {
    setSelectedDestination(destination.id);
    setActiveTab('search');
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-bold">Find Unforgettable Experiences</h1>
        <p className="text-xl text-secondary-text">
          Book tours, activities, and attractions worldwide with Viator
        </p>
      </header>

      {/* Search Form */}
      <div className="mx-auto mb-10 max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search experiences, cities, or activities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="mx-auto w-full max-w-md grid-cols-3">
          <TabsTrigger value="popular">
            <TrendingUp className="mr-2 h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="destinations">
            <MapPin className="mr-2 h-4 w-4" />
            Destinations
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Search Results
          </TabsTrigger>
        </TabsList>

        {/* Popular Experiences Tab */}
        <TabsContent value="popular" className="space-y-8">
          <ViatorExperienceGrid
            title="Top Experiences Worldwide"
            subtitle="Bestselling tours and activities for your trip"
            experiences={mockPopularExperiences as any[]}
            categories={['Skip-the-Line', 'Guided Tour', 'Fast-Track', 'Historical', 'Monuments']}
          />
        </TabsContent>

        {/* Destinations Tab */}
        <TabsContent value="destinations" className="space-y-8">
          <h2 className="mb-4 text-2xl font-bold">Popular Destinations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {popularDestinations.map((destination) => (
              <div
                key={destination.id}
                className="cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform hover:scale-[1.02]"
                onClick={() => handleDestinationSelect(destination)}
              >
                <div className="relative h-48">
                  <Image
                    src={destination.imageUrl}
                    alt={destination.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 w-full p-4">
                    <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                    <p className="text-sm text-white/80">View experiences</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Search Results Tab */}
        <TabsContent value="search" className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Experiences'}
              {selectedDestination &&
                ` in ${popularDestinations.find((d) => d.id === selectedDestination)?.name}`}
            </h2>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {experienceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by popularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Sort by popularity</SelectItem>
                  <SelectItem value="price-low">Price (low to high)</SelectItem>
                  <SelectItem value="price-high">Price (high to low)</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-4 w-2/3 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-1/4 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                      <div className="h-4 w-1/4 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExperiences.map((experience) => (
                <ViatorExperienceCard key={experience.id} {...experience} />
              ))}
            </div>
          ) : (
            <div className="my-20 text-center">
              <Globe className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No experiences found</h3>
              <p className="text-secondary-text">
                Try adjusting your search or filters to find more experiences.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
