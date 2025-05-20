'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ViatorExperienceCard,
  ViatorExperienceGrid,
  ViatorExperienceSearchDialog,
  AddViatorButton,
  DestinationExperiences,
} from '@/components/features/viator';
import Link from 'next/link';
import { Search, TicketIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ViatorDemoPage() {
  const sampleExperience = {
    id: '1',
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
  };

  const sampleExperiences = [
    sampleExperience,
    {
      id: '2',
      title: 'Notre-Dame Cathedral and Latin Quarter Walking Tour',
      description:
        'Explore the Latin Quarter and Notre-Dame Cathedral on this guided walking tour.',
      imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94',
      price: '$45.99',
      duration: '3 hours',
      rating: 4.6,
      reviewCount: 1854,
      location: 'Paris, France',
      productUrl: 'https://www.viator.com/tours/Paris/Notre-Dame-Latin-Quarter-Tour',
      productCode: 'PARIS456',
      labels: ['Walking Tour', 'Historical'],
    },
    {
      id: '3',
      title: 'Paris Seine River Dinner Cruise',
      description: 'Enjoy a gourmet dinner with live music while cruising on the Seine River.',
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      price: '$120.00',
      duration: '2.5 hours',
      rating: 4.7,
      reviewCount: 2156,
      location: 'Paris, France',
      productUrl: 'https://www.viator.com/tours/Paris/Seine-Dinner-Cruise',
      productCode: 'SEINE789',
      labels: ['Dinner', 'Cruise'],
    },
    {
      id: '4',
      title: 'Paris Museum Pass and Louvre Skip-the-Line Ticket',
      description:
        'Save time and money with this Paris Museum Pass and skip-the-line Louvre ticket.',
      imageUrl: 'https://images.unsplash.com/photo-1565099824688-ab1e6ff9c9b3',
      price: '$69.99',
      duration: 'Valid for 2, 4, or 6 days',
      rating: 4.5,
      reviewCount: 3842,
      location: 'Paris, France',
      productUrl: 'https://www.viator.com/tours/Paris/Museum-Pass',
      productCode: 'MUSEUM456',
      labels: ['Skip-the-Line', 'Museum'],
    },
  ];

  const mockTripId = '123e4567-e89b-12d3-a456-426614174000';
  const mockDestinationId = '737'; // Paris Viator destination ID
  const mockDestinationName = 'Paris';

  const [addedExperiences, setAddedExperiences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('demo');

  const handleExperienceAdd = (experienceData: any) => {
    setAddedExperiences([...addedExperiences, experienceData]);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-2 text-4xl font-bold">Viator Integration Demo</h1>
      <p className="mb-8 text-xl text-secondary-text">
        Book tours, activities and attractions with our Viator integration
      </p>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link href="/viator-search" className="block">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardContent className="flex h-full flex-col items-center justify-center p-6">
              <Search className="mb-4 h-10 w-10 text-accent-purple" />
              <h3 className="mb-2 text-xl font-bold">Search Experiences</h3>
              <p className="text-center text-secondary-text">
                Browse and search from thousands of tours and activities
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/viator-demo/bookings" className="block">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardContent className="flex h-full flex-col items-center justify-center p-6">
              <TicketIcon className="mb-4 h-10 w-10 text-accent-purple" />
              <h3 className="mb-2 text-xl font-bold">Booking Experience</h3>
              <p className="text-center text-secondary-text">
                View examples of the booking flow and management interface
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex h-full flex-col items-center justify-center p-6">
            <Info className="mb-4 h-10 w-10 text-accent-purple" />
            <h3 className="mb-2 text-xl font-bold">Component Showcase</h3>
            <p className="text-center text-secondary-text">
              View individual Viator components in action
            </p>
            <Button variant="outline" onClick={() => setActiveTab('components')} className="mt-4">
              View Components
            </Button>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="components">Component Showcase</TabsTrigger>
        </TabsList>

        <TabsContent value="demo">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary Integration (Quick Add)</CardTitle>
                <CardDescription>
                  This demonstrates how the Viator integration would work in the itinerary tab's
                  quick add section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-4">
                  <AddViatorButton tripId={mockTripId} onAddActivity={handleExperienceAdd} />
                </div>

                {addedExperiences.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Added Experiences:</h3>
                    <div className="space-y-4">
                      {addedExperiences.map((exp, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold">{exp.title}</h4>
                                <p className="text-sm text-secondary-text">{exp.description}</p>
                                {exp.data && (
                                  <div className="mt-2">
                                    <p className="text-sm">
                                      Price: {exp.data.price} • Duration: {exp.data.duration}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {exp.data?.imageUrl && (
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                  <img
                                    src={exp.data.imageUrl}
                                    alt={exp.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destination Page Integration</CardTitle>
                <CardDescription>
                  This shows how Viator experiences would appear on a destination page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DestinationExperiences
                  destinationId={mockDestinationId}
                  destinationName={mockDestinationName}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ViatorExperienceCard</CardTitle>
                <CardDescription>
                  Individual experience card with booking functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm">
                  <ViatorExperienceCard {...sampleExperience} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AddViatorButton</CardTitle>
                <CardDescription>
                  Button that opens the search dialog for adding Viator experiences to a trip
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <AddViatorButton tripId={mockTripId} onAddActivity={handleExperienceAdd} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>ViatorExperienceGrid</CardTitle>
                <CardDescription>
                  Grid display of experiences with filtering capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ViatorExperienceGrid
                  title="Popular Paris Experiences"
                  subtitle="Must-do activities for your Paris trip"
                  experiences={sampleExperiences}
                  categories={['Skip-the-Line', 'Walking Tour', 'Dinner', 'Cruise', 'Museum']}
                  tripId={mockTripId}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
