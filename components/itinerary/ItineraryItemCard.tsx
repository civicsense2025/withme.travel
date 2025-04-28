import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisplayItineraryItem } from '@/types/itinerary';

export interface ItineraryItemCardProps {
  item: DisplayItineraryItem;
  className?: string;
  dayNumber?: number;
}

export const ItineraryItemCard: React.FC<ItineraryItemCardProps> = ({
  item,
  className,
  dayNumber,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    console.log(`Toggled like for item ${item.id}`);
  };

  const address = item.address || item.location;
  const scheduleTime = item.start_time ? 
    (item.end_time ? `${item.start_time} - ${item.end_time}` : item.start_time) 
    : null;

  // Generate a gradient based on day number or random if not provided
  const gradientClass = dayNumber 
    ? `bg-gradient-to-r from-travel-purple/10 to-travel-pink/5`
    : `bg-gradient-to-r from-travel-blue/5 via-white to-travel-mint/10`;

  return (
    <div 
      className={cn(
        "rounded-xl relative group transition-shadow duration-200 ease-in-out overflow-hidden",
        "border border-border/20 dark:border-border/10 hover:shadow-md dark:hover:border-border/30",
        gradientClass,
        className
      )}
    >
      {/* Visual day indicator */}
      {dayNumber && (
        <div className="absolute -left-3 -top-3 rounded-full bg-travel-purple text-white w-8 h-8 flex items-center justify-center shadow-md transform -rotate-12 opacity-70">
          <span className="text-xs font-semibold">{dayNumber}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          {/* Item time/icon */}
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
            {scheduleTime ? <Clock className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
          </div>

          {/* Main content */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-sm truncate" title={item.title ?? 'Untitled'}>
              {item.title || "Untitled Item"}
            </h3>
            
            {scheduleTime && (
              <p className="text-xs text-muted-foreground">
                {scheduleTime}
              </p>
            )}
            
            {address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" title={address}>
                <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
                <span className="truncate">{address}</span>
              </p>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLikeClick}
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 flex-shrink-0"
            title={isLiked ? "Unlike item" : "Like item"}
          >
            <Heart 
              className={cn("w-4 h-4 transition-all", isLiked ? "fill-destructive text-destructive" : "fill-none")}
            />
            <span className="sr-only">{isLiked ? "Unlike" : "Like"} item</span>
          </Button>
        </div>
      </div>

      {/* Decorative background elements to suggest a daily schedule */}
      <div className="absolute top-0 bottom-0 right-0 w-16 opacity-5 flex flex-col justify-between p-2 pointer-events-none">
        <div className="w-full h-1 bg-travel-purple rounded-full"></div>
        <div className="w-full h-1 bg-travel-blue rounded-full"></div>
        <div className="w-full h-1 bg-travel-pink rounded-full"></div>
        <div className="w-full h-1 bg-travel-mint rounded-full"></div>
        <div className="w-full h-1 bg-travel-yellow rounded-full"></div>
      </div>
    </div>
  );
};