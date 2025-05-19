'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MultiCityItineraryProps {
  disablePopup?: boolean;
  className?: string;
}

/**
 * A visual component that shows a multi-city itinerary with presence indicators
 * Used primarily for marketing purposes to showcase the collaborative features
 */
export function MultiCityItinerary({ disablePopup = true, className }: MultiCityItineraryProps) {
  return (
    <div className={cn('rounded-xl border bg-card shadow-sm overflow-hidden', className)}>
      <div className="bg-primary/10 p-3 border-b">
        <h3 className="font-semibold text-lg">Europe Trip Itinerary</h3>
      </div>
      
      <div className="p-4">
        {/* City 1 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Paris</h4>
            <div className="flex -space-x-2">
              {/* User presence indicators */}
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">JD</div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">SM</div>
            </div>
          </div>
          <div className="pl-4 border-l-2 border-blue-400 space-y-2">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-sm">Eiffel Tower Tour</div>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-sm">Seine River Cruise</div>
          </div>
        </div>
        
        {/* City 2 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Rome</h4>
            <div className="flex -space-x-2">
              {/* User presence indicators */}
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">TH</div>
            </div>
          </div>
          <div className="pl-4 border-l-2 border-purple-400 space-y-2">
            <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded text-sm">Colosseum</div>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded text-sm">Vatican Museums</div>
          </div>
        </div>
        
        {/* City 3 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Barcelona</h4>
            <div className="flex -space-x-2">
              {/* No one actively editing this city */}
            </div>
          </div>
          <div className="pl-4 border-l-2 border-gray-300 space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-sm">Sagrada Familia</div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-sm">Park Güell</div>
          </div>
        </div>
      </div>
    </div>
  );
} 