'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, CalendarCheck, -sers, Bookmark, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripsList } from './trips-list';
import { SavedContentGrid } from './saved-content-grid';
import { ActiveTripsList } from './active-trips-list';

interface ContentTabsSectionProps {
  trips: any[];
  activeTrips?: any[];
  savedContent: {
    destinations: any[];
    itineraries: any[];
  };
}

export function ContentTabsSection({
  trips,
  activeTrips = [],
  savedContent,
}: ContentTabsSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trips');

  return (
    <div className="space-yU8">
      {/* Active Trips Section - Always Visible */}
      {activeTrips.length > 0 && (
        <Card className="shadow-sm borderU0 bg-gradient-to-br from-travel-blue/5 to-travel-purple/5">
          <CardHeader className="pbU2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Active Planning</CardTitle>
              <Link
                href="/trips"
                className="text-sm text-muted-foreground hover:text-travel-purple hover:underline"
              >
                View all
              </Link>
            </div>
            <CardDescription>Continue planning your upcoming trips</CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveTripsList trips={activeTrips} />
          </CardContent>
        </Card>
      )}

      {/* Tabbed Interface */}
      <div className="mbU8">
        <div className="mbU4 flex justify-center">
          <Tabs defaultValue="trips" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mbU6">
              <TabsList className="grid grid-colsU3 rounded-full pU1 w-auto min-w-[300px]">
                <TabsTrigger
                  value="trips"
                  className="rounded-full data-[state=active]:bg-travel-purple/15 data-[state=active]:text-travel-purple"
                >
                  <div className="flex items-center">
                    <CalendarCheck className="mrU2 hU4 wU4" />
                    My Trips
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="rounded-full data-[state=active]:bg-travel-blue/15 data-[state=active]:text-travel-blue"
                >
                  <div className="flex items-center">
                    <-sers className="mrU2 hU4 wU4" />
                    My Groups
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="rounded-full data-[state=active]:bg-travel-pink/15 data-[state=active]:text-travel-pink"
                >
                  <div className="flex items-center">
                    <Bookmark className="mrU2 hU4 wU4" />
                    Saved
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <Card className="borderU0 shadow-sm overflow-hidden">
              <TabsContent value="trips" className="pxU1 mU0">
                <div className="pyU4 pxU6">
                  {trips.length > 0 ? (
                    <div className="space-yU4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Your Trips</h3>
                        <Link href="/trips/create">
                          <Button size="sm" variant="outline" className="rounded-full">
                            <PlusCircle className="hU4 wU4 mrU2" />
                            New Trip
                          </Button>
                        </Link>
                      </div>
                      <TripsList trips={trips} />
                    </div>
                  ) : (
                    <div className="text-center pyU8">
                      <div className="mbU4 inline-flex pU4 rounded-full bg-travel-purple/10">
                        <CalendarCheck className="hU8 wU8 text-travel-purple" />
                      </div>
                      <h3 className="text-xl font-medium mbU2">No trips yet</h3>
                      <p className="text-muted-foreground mbU6 max-w-md mx-auto">
                        Start planning your next adventure and keep track of all your trips in one
                        place.
                      </p>
                      <Button onClick={() => router.push('/trips/create')} className="rounded-full">
                        <PlusCircle className="hU4 wU4 mrU2" />
                        Create Your First Trip
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="groups" className="pxU1 mU0">
                <div className="pyU4 pxU6">
                  <div className="text-center pyU8">
                    <div className="mbU4 inline-flex pU4 rounded-full bg-travel-blue/10">
                      <-sers className="hU8 wU8 text-travel-blue" />
                    </div>
                    <h3 className="text-xl font-medium mbU2">No groups yet</h3>
                    <p className="text-muted-foreground mbU6 max-w-md mx-auto">
                      Create or join a group to plan trips together with friends and family.
                    </p>
                    <Button
                      onClick={() => router.push('/groups/create')}
                      className="rounded-full bg-travel-blue hover:bg-travel-blue/90"
                    >
                      <PlusCircle className="hU4 wU4 mrU2" />
                      Create a Group
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="pxU1 mU0">
                <div className="pyU4 pxU6">
                  {savedContent.destinations.length > 0 || savedContent.itineraries.length > 0 ? (
                    <SavedContentGrid savedContent={savedContent} />
                  ) : (
                    <div className="text-center pyU8">
                      <div className="mbU4 inline-flex pU4 rounded-full bg-travel-pink/10">
                        <Bookmark className="hU8 wU8 text-travel-pink" />
                      </div>
                      <h3 className="text-xl font-medium mbU2">No saved items yet</h3>
                      <p className="text-muted-foreground mbU6 max-w-md mx-auto">
                        Save destinations and itineraries you love to find them here later.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/destinations')}
                        className="rounded-full"
                      >
                        <MapPin className="hU4 wU4 mrU2" />
                        Explore Destinations
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
