"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CalendarDays, Clock, MapPin, Tag, Heart, Share2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  position: number;
  category: string | null;
}

interface Section {
  id: string;
  template_id: string;
  day_number: number;
  title: string;
  position: number;
  activities: Activity[];
}

interface ItineraryDetailProps {
  itinerary: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    destination_id: string;
    destination: {
      id: string;
      city: string;
      country: string;
      image_url: string | null;
    };
    duration_days: number;
    category: string;
    created_by: string;
    created_at: string;
    is_published: boolean;
    view_count: number;
    copied_count: number;
    creator: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    sections: Section[];
  };
}

export function ItineraryDetailClient({ itinerary }: ItineraryDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [userTrips, setUserTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handleUseTemplate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use this template",
        variant: "destructive"
      });
      router.push(`/login?redirect=/itineraries/${itinerary.slug}`);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ROUTES.TRIPS}`);
      const data = await response.json();
      if (data && data.data) {
        setUserTrips(data.data);
        setIsApplyDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Could not load your trips. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyTemplate = async () => {
    if (!selectedTripId) {
      toast({
        title: "Trip required",
        description: "Please select a trip to apply this template to",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ROUTES.ITINERARY_DETAILS(itinerary.slug)}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tripId: selectedTripId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply template');
      }
      
      toast({
        title: "Success!",
        description: "Template applied to your trip successfully",
      });
      
      setIsApplyDialogOpen(false);
      router.push(`${PAGE_ROUTES.TRIP_DETAILS(selectedTripId)}?tab=itinerary`);
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTrip = () => {
    router.push(`/trips/create?templateId=${itinerary.id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl mb-6">
            <Image
              src={itinerary.destination?.image_url || '/images/destinations/default-destination.jpg'}
              alt={itinerary.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {itinerary.title}
              </h1>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                <span>{itinerary.destination?.city}, {itinerary.destination?.country}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{itinerary.duration_days} {itinerary.duration_days === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Created {formatDate(itinerary.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline" className="capitalize">{itinerary.category}</Badge>
            </div>
          </div>
          
          {itinerary.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-muted-foreground">{itinerary.description}</p>
            </div>
          )}
          
          <div className="space-y-8 mb-8">
            <h2 className="text-xl font-semibold mb-3">Itinerary</h2>
            
            {itinerary.sections.sort((a, b) => a.day_number - b.day_number).map((section) => (
              <Card key={section.id} className="overflow-hidden">
                <div className="bg-muted p-4">
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <CardContent className="p-0">
                  {section.activities.sort((a, b) => a.position - b.position).map((activity, idx) => (
                    <div key={activity.id} className="p-4 border-b last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          {activity.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                          {activity.description && (
                            <p className="text-sm mt-2">{activity.description}</p>
                          )}
                        </div>
                        {activity.start_time && (
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {activity.start_time}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Use This Itinerary</h3>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-4 w-4" />
                  <span>{itinerary.copied_count || 0} uses</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button onClick={handleUseTemplate} className="w-full" disabled={isLoading}>
                  Apply to Trip
                </Button>
                <Button onClick={handleCreateTrip} variant="outline" className="w-full">
                  Create New Trip
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Created By</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={itinerary.creator?.avatar_url || undefined} />
                  <AvatarFallback>{itinerary.creator?.name?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{itinerary.creator?.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(itinerary.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Share</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Apply Template Dialog */}
      {isApplyDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Apply to Trip</h3>
            <p className="mb-4">Select which trip you want to apply this itinerary to:</p>
            
            <select 
              className="w-full p-2 border rounded mb-4"
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              <option value="">Select a trip</option>
              {userTrips.map((trip: any) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApplyTemplate}
                disabled={isLoading || !selectedTripId}
              >
                {isLoading ? 'Applying...' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 