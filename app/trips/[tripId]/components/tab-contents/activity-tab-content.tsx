'use client';

import { ActivityFeed as ActivityFeedComponent } from '@/components/features/activities/organisms/ActivityFeed';
import { useState, useEffect } from 'react';

interface ActivityTabContentProps {
  tripId: string;
}

export function ActivityTabContent({ tripId }: ActivityTabContentProps) {
  // Mock activities for now - we'll replace with real data later
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading activities
  useEffect(() => {
    // This would be replaced with a real API call in the future
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full">
        <ActivityFeedComponent 
          activities={activities}
          isLoading={isLoading}
          hasMore={false}
          className="max-h-[80vh] overflow-y-auto"
          showFilters={true}
          title="Trip Activity"
        />
    </div>
  );
}
