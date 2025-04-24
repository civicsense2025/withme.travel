"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
// Importing design system components. Adjust the import path as needed to match our design system.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const TravelTracker: React.FC = () => {
  // State to hold destinations from Supabase
  const [destinations, setDestinations] = useState<any[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch visited destinations
      const { data: visitedData, error: visitedError } = await supabase
        .from('user_travel')
        .select('destination_id')
        .eq('user_id', user.id);

      if (visitedError) {
        console.error('Error fetching travel data', visitedError);
      } else if (visitedData) {
        const visitedIds = visitedData.map((entry: any) => entry.destination_id);
        setVisited(visitedIds);
      }

      // Fetch all destinations
      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations')
        .select('*');

      if (destinationsError) {
        console.error('Error fetching destinations', destinationsError);
      } else if (destinationsData) {
        setDestinations(destinationsData);
      }
    };

    fetchData();
  }, [supabase]);

  const MAX_DISPLAY_DESTINATIONS = 20;

  return (
    <Card>
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-lg lowercase font-semibold">my travel tracker</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <ScrollArea className="h-[250px] pr-3"> {/* Adjust height as needed */}
          <div className="space-y-3">
            {destinations.slice(0, MAX_DISPLAY_DESTINATIONS).map(destination => {
              const displayName = `${destination.city}, ${destination.country}`;
              const isChecked = visited.includes(destination.id);
              return (
                <div key={destination.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`dest-${destination.id}`} 
                    checked={isChecked} 
                    // Add onCheckedChange handler if needed
                    // onCheckedChange={(checked) => handleCheckChange(destination.id, checked)}
                  />
                  <label
                    htmlFor={`dest-${destination.id}`}
                    className={`text-sm font-medium leading-none ${isChecked ? 'line-through text-muted-foreground' : ''} peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
                  >
                    {displayName}
                  </label>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {destinations.length > MAX_DISPLAY_DESTINATIONS && (
          <Button 
            variant="link" 
            className="w-full justify-start lowercase mt-2 px-0 text-sm h-auto py-1"
            asChild
          >
            <Link href="/travel-map"> {/* Link to the future map page */}
              view all {destinations.length} destinations
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelTracker; 