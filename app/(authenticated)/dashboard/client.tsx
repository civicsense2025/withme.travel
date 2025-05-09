'use client';

import { User } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, MapPin, CalendarCheck, ArrowRight, Star, Users, User as UserIcon, BookmarkCheck, Globe, Map, FileText, Calendar, Check, Bell, Package, Bookmark } from 'lucide-react';
import Link from 'next/link';
import TravelTracker from '@/components/TravelTracker';
import { TrendingDestinations } from '@/components/trending-destinations';
import { SkeletonCard } from '@/components/skeleton-card';
import { DashboardProfile } from './components/dashboard-profile';
import { TripsList } from './components/trips-list';
import { DashboardClientWrapper } from './components/dashboard-client-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { ActiveTripsList } from './components/active-trips-list';
import { TravelStatCards } from './components/travel-stat-cards';
import { SavedContentGrid } from './components/saved-content-grid';
import { PopularItineraries } from '@/components/popular-itineraries';

// Dashboard data structure from server actions
interface DashboardData {
  recentTrips: any[];
  tripCount: number;
  userProfile: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  travelStats: {
    visitedCount: number;
    plannedCount: number;
    wishlistCount: number;
    countriesCount: number;
  };
  savedContent: {
    destinations: any[];
    itineraries: any[];
  };
  activeTrips: any[];
}

interface DashboardClientProps {
  user: User;
  dashboardData: DashboardData;
}

export default function DashboardClient({
  user,
  dashboardData
}: DashboardClientProps) {
  const { 
    recentTrips, 
    tripCount, 
    userProfile, 
    travelStats, 
    savedContent, 
    activeTrips 
  } = dashboardData;

  return (
    <main className="container py-8 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Mobile-optimized header with profile summary */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.name || "User"} />
              <AvatarFallback>{userProfile?.name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userProfile?.name || user.email?.split('@')[0] || 'Traveler'}</h1>
              <p className="text-muted-foreground">Welcome to your travel dashboard</p>
            </div>
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Travel Status + Quick Actions */}
          <div className="col-span-1 space-y-6">
            {/* Travel Status Section (hidden on mobile, shown at top) */}
            <div className="hidden md:block">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Travel Status</CardTitle>
                    <Link href="/settings" className="text-sm text-muted-foreground hover:underline">
                      View Profile
                    </Link>
                  </div>
                  <CardDescription>
                    {userProfile?.name || user.email?.split('@')[0] || 'Your'} travel journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <Suspense fallback={<div className="h-[200px] bg-muted animate-pulse rounded-md"></div>}>
                      <TravelStatCards travelStats={travelStats} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                <CardDescription>
                  Tools to enhance your travel experience
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link
                  href="/trips/create"
                  className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-purple/10 hover:bg-travel-purple/20 transition-colors"
                >
                  <PlusCircle className="mr-3 h-5 w-5 text-travel-purple" />
                  <span className="font-medium">Plan a new trip</span>
                </Link>

                <Link
                  href="/destinations"
                  className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-blue/10 hover:bg-travel-blue/20 transition-colors"
                >
                  <MapPin className="mr-3 h-5 w-5 text-travel-blue" />
                  <span className="font-medium">Explore destinations</span>
                </Link>

                <Link
                  href="/itineraries"
                  className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-pink/10 hover:bg-travel-pink/20 transition-colors"
                >
                  <CalendarCheck className="mr-3 h-5 w-5 text-travel-pink" />
                  <span className="font-medium">Browse itineraries</span>
                </Link>

                <Link
                  href="/travel-map"
                  className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-mint/10 hover:bg-travel-mint/20 transition-colors"
                >
                  <Globe className="mr-3 h-5 w-5 text-travel-mint" />
                  <span className="font-medium">Your travel map</span>
                </Link>
              </CardContent>
            </Card>

            {/* Travel Stats Cards - Mobile only, shown at top */}
            <div className="md:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">Travel Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="h-[120px] bg-muted animate-pulse rounded-md"></div>}>
                    <TravelStatCards travelStats={travelStats} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Optional - Travel Tracker component (can be collapsed) */}
            <div className="hidden md:block">
              <Suspense
                fallback={<div className="h-[200px] bg-muted animate-pulse rounded-md"></div>}
              >
                <DashboardClientWrapper>
                  <TravelTracker userId={user.id} />
                </DashboardClientWrapper>
              </Suspense>
            </div>
          </div>

          {/* Middle and Right columns - Spans 2 columns on desktop */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Active Planning Section */}
            {activeTrips.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Active Planning</CardTitle>
                    <Link href="/trips" className="text-sm text-muted-foreground hover:underline flex items-center">
                      View all trips
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <CardDescription>
                    Trips with recent activity that need your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="h-24 bg-muted animate-pulse rounded-md"></div>
                        ))}
                      </div>
                    }
                  >
                    <ActiveTripsList trips={activeTrips} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Content Tabs Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Your Travel Organizer</CardTitle>
                <CardDescription>
                  Manage and discover travel content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="trips" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="trips">My Trips</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="discover">Discover</TabsTrigger>
                  </TabsList>
                  
                  {/* My Trips Tab */}
                  <TabsContent value="trips" className="space-y-4">
                    <Suspense
                      fallback={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                          ))}
                        </div>
                      }
                    >
                      <TripsList trips={recentTrips} />
                      
                      {recentTrips.length > 0 && (
                        <div className="flex justify-center mt-4">
                          <Button variant="outline" asChild>
                            <Link href="/trips">
                              View all {tripCount} trips
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </Suspense>
                  </TabsContent>
                  
                  {/* Saved Content Tab */}
                  <TabsContent value="saved" className="space-y-4">
                    <Suspense
                      fallback={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                          ))}
                        </div>
                      }
                    >
                      <SavedContentGrid savedContent={savedContent} />
                    </Suspense>
                  </TabsContent>
                  
                  {/* Discover Tab */}
                  <TabsContent value="discover" className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">Trending Destinations</h3>
                    <Suspense
                      fallback={<div className="h-[350px] bg-muted animate-pulse rounded-md"></div>}
                    >
                      <TrendingDestinations />
                    </Suspense>
                    
                    {/* Add Popular Itineraries Section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Popular Itineraries</h3>
                      <Suspense
                        fallback={
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
                            ))}
                          </div>
                        }
                      >
                        <DashboardClientWrapper>
                          <PopularItineraries />
                        </DashboardClientWrapper>
                      </Suspense>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
