'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { MultiCityItinerary } from '@/components/ui/MultiCityItinerary';
/**
 * Marketing section that showcases real-time collaboration features
 * with the MultiCityItinerary component as a visual example
 */
export function SharedPresenceSection() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Component: First on both mobile and desktop */}
        <div className="order-1 flex justify-center">
          <MultiCityItinerary 
            disablePopup={false} 
            className="max-w-md mx-auto"
          />
        </div>
        
        {/* Marketing Copy: Second on both mobile and desktop */}
        <div className="order-2 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan together, in real time</h2>
          <p className="text-lg text-muted-foreground mb-6">
            See who's online, brainstorm ideas, and make decisions as a group. 
            withme.travel brings everyone together—no more lost messages or missed updates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Start planning together
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SharedPresenceSection; 