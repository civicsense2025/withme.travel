'use client';

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  Sun,
  Coffee,
  Utensils,
  Bed,
  Train,
  Ticket,
  Music,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/molecules/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/atoms/Avatar';
import { ScrollArea } from '../ui/scroll-area';

interface ItineraryItem {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'activity' | 'transport' | 'accommodation';
  title: string;
  time: string;
  location?: string;
  duration?: string;
  notes?: string;
  icon?: React.ReactNode;
}

interface Day {
  id: string;
  date: string;
  dayNumber: number;
  items: ItineraryItem[];
}

interface ItineraryTemplateDisplayProps {
  name?: string;
  destination?: string;
  days?: Day[];
  className?: string;
  collaborators?: any[];
}

export function ItineraryTemplateDisplay({
  name = 'Barcelona Weekend Getaway',
  destination = 'Barcelona, Spain',
  days,
  className,
  collaborators = [],
}: ItineraryTemplateDisplayProps) {
  const [activeDay, setActiveDay] = useState('1');

  // Define default days if none provided
  const defaultDays: Day[] = [
    {
      id: '1',
      date: 'Friday, June 10',
      dayNumber: 1,
      items: [
        {
          id: '1-1',
          type: 'breakfast',
          title: 'Breakfast at La Boqueria Market',
          time: '9:00 AM',
          location: 'La Rambla, 91',
          duration: '1h',
          notes: 'Try fresh fruit juices and local pastries',
          icon: <Coffee className="h-4 w-4" />,
        },
        {
          id: '1-2',
          type: 'activity',
          title: 'Visit Sagrada Familia',
          time: '11:00 AM',
          location: 'Carrer de Mallorca, 401',
          duration: '2h',
          notes: 'Book skip-the-line tickets online',
          icon: <Ticket className="h-4 w-4" />,
        },
        {
          id: '1-3',
          type: 'lunch',
          title: 'Lunch at El Nacional',
          time: '2:00 PM',
          location: 'Passeig de Gràcia, 24',
          duration: '1.5h',
          notes: 'Multi-cuisine food hall with Spanish specialties',
          icon: <Utensils className="h-4 w-4" />,
        },
        {
          id: '1-4',
          type: 'activity',
          title: 'Explore Gothic Quarter',
          time: '4:00 PM',
          location: 'Barri Gòtic',
          duration: '3h',
          notes: 'Visit Barcelona Cathedral and Plaça Reial',
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          id: '1-5',
          type: 'dinner',
          title: 'Tapas at El Xampanyet',
          time: '8:00 PM',
          location: 'Carrer de Montcada, 22',
          duration: '2h',
          notes: 'Famous local spot, arrive early to avoid queue',
          icon: <Utensils className="h-4 w-4" />,
        },
      ],
    },
    {
      id: '2',
      date: 'Saturday, June 11',
      dayNumber: 2,
      items: [
        {
          id: '2-1',
          type: 'breakfast',
          title: 'Brunch at Milk Bar & Bistro',
          time: '10:30 AM',
          location: "Carrer d'en Gignàs, 21",
          duration: '1h',
          notes: 'Popular spot for brunch, try the eggs benedict',
          icon: <Coffee className="h-4 w-4" />,
        },
        {
          id: '2-2',
          type: 'activity',
          title: 'Park Güell',
          time: '12:30 PM',
          location: "Carrer d'Olot, 5",
          duration: '2h',
          notes: 'Book tickets in advance, stunning views of the city',
          icon: <Sun className="h-4 w-4" />,
        },
        {
          id: '2-3',
          type: 'lunch',
          title: 'Lunch at La Paradeta',
          time: '3:00 PM',
          location: 'Carrer Comercial, 7',
          duration: '1.5h',
          notes: 'Pick your seafood by weight and they cook it for you',
          icon: <Utensils className="h-4 w-4" />,
        },
        {
          id: '2-4',
          type: 'activity',
          title: 'Beach Time at Barceloneta',
          time: '5:00 PM',
          location: 'Barceloneta Beach',
          duration: '2h',
          notes: 'Relax at the beach and enjoy a refreshing swim',
          icon: <Sun className="h-4 w-4" />,
        },
        {
          id: '2-5',
          type: 'dinner',
          title: 'Dinner at Can Paixano',
          time: '8:30 PM',
          location: 'Carrer de la Reina Cristina, 7',
          duration: '1.5h',
          notes: 'Local cava bar with amazing sandwiches',
          icon: <Utensils className="h-4 w-4" />,
        },
      ],
    },
    {
      id: '3',
      date: 'Sunday, June 12',
      dayNumber: 3,
      items: [
        {
          id: '3-1',
          type: 'breakfast',
          title: 'Breakfast at Caravelle',
          time: '9:30 AM',
          location: 'Carrer del Pintor Fortuny, 31',
          duration: '1h',
          notes: 'Great coffee and breakfast bowls',
          icon: <Coffee className="h-4 w-4" />,
        },
        {
          id: '3-2',
          type: 'activity',
          title: 'Visit Casa Batlló',
          time: '11:00 AM',
          location: 'Passeig de Gràcia, 43',
          duration: '1.5h',
          notes: 'Gaudí masterpiece, book tickets online',
          icon: <Ticket className="h-4 w-4" />,
        },
        {
          id: '3-3',
          type: 'lunch',
          title: 'Lunch at Cervecería Catalana',
          time: '1:00 PM',
          location: 'Carrer de Mallorca, 236',
          duration: '1.5h',
          notes: 'Popular tapas bar with great variety',
          icon: <Utensils className="h-4 w-4" />,
        },
        {
          id: '3-4',
          type: 'activity',
          title: 'Shopping at Passeig de Gràcia',
          time: '3:00 PM',
          location: 'Passeig de Gràcia',
          duration: '2h',
          notes: 'Luxury shopping avenue with architectural gems',
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          id: '3-5',
          type: 'transport',
          title: 'Airport Transfer',
          time: '6:00 PM',
          location: 'Barcelona El Prat Airport',
          duration: '45m',
          notes: 'Allow extra time for security checks',
          icon: <Train className="h-4 w-4" />,
        },
      ],
    },
  ];

  const itineraryDays = days || defaultDays;

  // Color mapping for item types
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return 'bg-food text-white';
      case 'activity':
        return 'bg-activities text-white';
      case 'transport':
        return 'bg-transportation text-white';
      case 'accommodation':
        return 'bg-accommodation text-white';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeBackgroundColor = (type: string): string => {
    switch (type) {
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return 'bg-food/10 text-food';
      case 'activity':
        return 'bg-activities/10 text-activities';
      case 'transport':
        return 'bg-transportation/10 text-transportation';
      case 'accommodation':
        return 'bg-accommodation/10 text-accommodation';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Default avatar collaborators
  const defaultCollaborators = [
    { image: 'https://i.pravatar.cc/150?img=1', name: 'Alex Morgan' },
    { image: 'https://i.pravatar.cc/150?img=2', name: 'Jamie Chen' },
    { image: 'https://i.pravatar.cc/150?img=3', name: 'Sam Taylor' },
  ];

  const displayCollaborators = collaborators.length > 0 ? collaborators : defaultCollaborators;

  return (
    <Card className="shadow-md dark:shadow-gray-900/30 border-border overflow-hidden">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-semibold">{name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
             
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
        <div className="px-6">
          <TabsList className="h-10 bg-transparent p-0 w-full justify-start gap-2 -mb-px relative">
            {itineraryDays.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className={`data-[state=active]:border-travel-purple data-[state=active]:text-foreground border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 rounded-none`}
              >
                Day {day.dayNumber}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="h-[420px]">
          {itineraryDays.map((day) => (
            <TabsContent key={day.id} value={day.id} className="p-0 m-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  
                 
                </div>
                <div className="flex flex-col gap-4">
                  {day.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/40">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-base">{item.title}</h4>
                          <Badge variant="outline" className={`text-xs px-2 py-0 h-5 ${getTypeBackgroundColor(item.type)}`}>{item.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                          {item.duration && (
                            <>
                              <span className="mx-1">•</span>
                              {item.duration}
                            </>
                          )}
                          {item.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </>
                          )}
                        </div>
                        {item.notes && <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>

      <CardFooter className="border-t border-border p-4 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Shared with {displayCollaborators.length} people
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          Use template
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
