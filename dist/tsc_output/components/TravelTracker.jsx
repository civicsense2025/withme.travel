"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
// Importing design system components. Adjust the import path as needed to match our design system.
import { Box, Card, Checkbox, Text } from './ui';
const TravelTracker = () => {
    // State to hold destinations from Supabase
    const [destinations, setDestinations] = useState([]);
    const [visited, setVisited] = useState([]);
    const supabase = createClient();
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            // Fetch visited destinations
            const { data: visitedData, error: visitedError } = await supabase
                .from('user_travel')
                .select('destination_id')
                .eq('user_id', user.id);
            if (visitedError) {
                console.error('Error fetching travel data', visitedError);
            }
            else if (visitedData) {
                const visitedIds = visitedData.map((entry) => entry.destination_id);
                setVisited(visitedIds);
            }
            // Fetch all destinations
            const { data: destinationsData, error: destinationsError } = await supabase
                .from('destinations')
                .select('*');
            if (destinationsError) {
                console.error('Error fetching destinations', destinationsError);
            }
            else if (destinationsData) {
                setDestinations(destinationsData);
            }
        };
        fetchData();
    }, [supabase]);
    return (<Box margin="medium">
      <Text variant="headline" marginBottom="small">My Travel Tracker</Text>
      {destinations.map(destination => {
            const displayName = `${destination.city}, ${destination.country}`;
            return (<Card key={destination.id} padding="small" marginBottom="small">
            <Checkbox checked={visited.includes(destination.id)}>
              {displayName}
            </Checkbox>
          </Card>);
        })}
    </Box>);
};
export default TravelTracker;
