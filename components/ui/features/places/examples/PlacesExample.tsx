/**
 * Places Example Component
 * 
 * This component demonstrates how to use the places components in a real application.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState } from 'react';
import { 
  PlaceIcon,
  PlaceBadge, 
  PlaceRating,
  PlaceCard,
  PlaceForm,
  PlaceList,
  PlaceManager
} from '../';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Example component that demonstrates the places components
 */
export function PlacesExample() {
  const [activeTab, setActiveTab] = useState('atoms');
  
  // This would typically come from your application state or route parameters
  const destinationId = 'example-destination-id';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-4">Places Components</h1>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Example Usage</AlertTitle>
        <AlertDescription>
          This page demonstrates how to use the places components from the atomic design system.
          Note that these examples require a valid destination ID and API connection to work properly.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="atoms">Atoms</TabsTrigger>
          <TabsTrigger value="molecules">Molecules</TabsTrigger>
          <TabsTrigger value="organisms">Organisms</TabsTrigger>
        </TabsList>
        
        {/* Atoms Examples */}
        <TabsContent value="atoms" className="space-y-6">
          <h2 className="text-2xl font-semibold">Place Atoms</h2>
          
          {/* PlaceIcon Examples */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceIcon</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-6">
              {['restaurant', 'cafe', 'hotel', 'landmark', 'shopping', 'transport', 'other'].map((category) => (
                <div key={category} className="flex flex-col items-center">
                  <PlaceIcon category={category} className="mb-2" />
                  <span className="text-sm">{category}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* PlaceBadge Examples */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceBadge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {['restaurant', 'cafe', 'hotel', 'landmark', 'shopping', 'transport', 'other'].map((category) => (
                <PlaceBadge key={category} category={category} />
              ))}
              
              <div className="w-full h-4"></div>
              
              <h3 className="text-base font-medium w-full mt-4">Sizes</h3>
              <PlaceBadge category="restaurant" size="sm" />
              <PlaceBadge category="restaurant" size="md" />
              <PlaceBadge category="restaurant" size="lg" />
            </CardContent>
          </Card>
          
          {/* PlaceRating Examples */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceRating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Rating with text:</span>
                <PlaceRating rating={4.5} count={120} showText />
              </div>
              
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Rating without text:</span>
                <PlaceRating rating={3.7} count={89} />
              </div>
              
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Different sizes:</span>
                <div className="flex flex-wrap gap-4 items-center">
                  <PlaceRating rating={4.0} size="sm" />
                  <PlaceRating rating={4.0} size="md" />
                  <PlaceRating rating={4.0} size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Molecules Examples */}
        <TabsContent value="molecules" className="space-y-6">
          <h2 className="text-2xl font-semibold">Place Molecules</h2>
          
          {/* PlaceCard Examples */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceCard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-base font-medium">Standard Card</h3>
              <PlaceCard 
                place={{
                  id: 'example-1',
                  name: 'Example Restaurant',
                  category: 'restaurant',
                  address: '123 Example Street, City, Country',
                  description: 'A wonderful restaurant with great food and ambiance.',
                  price_level: 2,
                  rating: 4.5,
                  rating_count: 120,
                  website: 'https://example.com',
                  phone_number: '+1 555-123-4567',
                  destination_id: 'example-destination',
                  is_verified: false,
                  suggested_by: null,
                  source: 'manual',
                  latitude: 40.7128,
                  longitude: -74.0060,
                }}
                onClick={() => alert('Card clicked!')}
              />
              
              <h3 className="text-base font-medium">Compact Card</h3>
              <PlaceCard 
                place={{
                  id: 'example-2',
                  name: 'Cozy Cafe',
                  category: 'cafe',
                  address: '456 Example Avenue, City, Country',
                  price_level: 1,
                  rating: 4.2,
                  rating_count: 85,
                  destination_id: 'example-destination',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  description: null,
                  website: null,
                  phone_number: null,
                  latitude: null,
                  longitude: null,
                }}
                compact
              />
            </CardContent>
          </Card>
          
          {/* PlaceForm Example */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceForm (Form Disabled for Example)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground mb-4">Note: Form submission is disabled in this example.</p>
              <PlaceForm 
                destinationId={destinationId}
                onSubmit={async (data) => {
                  console.log('Form submitted with:', data);
                  return Promise.resolve();
                }}
                initialData={{
                  name: 'Example Place',
                  category: 'landmark',
                  description: 'This is an example place description.',
                  destination_id: destinationId,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Organisms Examples */}
        <TabsContent value="organisms" className="space-y-6">
          <h2 className="text-2xl font-semibold">Place Organisms</h2>
          
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              The following components require a working API connection to function properly.
              In a real application, these would connect to your database via the Places API.
            </AlertDescription>
          </Alert>
          
          {/* PlaceList Example */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceList</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaceList
                destinationId={destinationId}
                allowAdd={true}
                onAddPlace={() => alert('Add place clicked!')}
                onSelectPlace={(place) => alert(`Selected place: ${place.name}`)}
              />
            </CardContent>
          </Card>
          
          {/* PlaceManager Example */}
          <Card>
            <CardHeader>
              <CardTitle>PlaceManager</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaceManager 
                destinationId={destinationId}
                allowAdd={true}
                allowEdit={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 