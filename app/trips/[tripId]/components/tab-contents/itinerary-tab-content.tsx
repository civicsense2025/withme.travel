'use client';
import { useAuth } from '@/lib/hooks/use-auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import { type ItemStatus, ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { useRouter } from 'next/navigation';
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { VerticalStepper } from '@/components/itinerary/VerticalStepper';
import { PlusCircle, MapPin, CalendarPlus, ChevronDown, Palmtree } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TripsFeedbackButton } from '@/app/trips/TripsFeedbackButton';
import { QuickAddItemDialog } from '@/components/itinerary/QuickAddItemDialog';
import { AddViatorButton } from '@/components/viator/AddViatorButton';
import { useItinerary } from '@/hooks/use-itinerary';

import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import type { GeocoderOptions } from '@mapbox/mapbox-gl-geocoder';
import { cn } from '@/lib/utils';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryDaySection, UnscheduledItemsSection } from '@/components/itinerary/molecules';
import { ItineraryTabTemplate } from '@/components/itinerary/templates';

// Dynamically import MapboxGeocoderComponent to avoid SSR issues
const MapboxGeocoderComponent = dynamic(() => import('@/components/maps/mapbox-geocoder'), {
  ssr: false,
  loading: () => (
    <div className="p-2 border rounded text-sm text-muted-foreground">
      Loading location search...
    </div>
  ),
});

// Define GeocoderResult interface
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any;
  [key: string]: any;
}

// Explicitly define TripRole type here to avoid import issues
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

interface ItineraryTabContentProps {
  tripId: string;
  userRole: TripRole | null;
  startDate: string | null;
  durationDays: number;
}

// Helper function to adapt the specific ItineraryItem type that comes from useItinerary hook
const adaptToDisplayItemLocal = (item: any): DisplayItineraryItem => {
  return {
    id: item.id,
    title: item.title || '',
    description: item.description,
    day_number: item.day_number,
    category: item.category,
    votes: [],
    creatorProfile: null,
    section_id: '',
    type: '',
    status: item.status || 'suggested',
    position: item.position || 0,
    place_id: item.place_id || null,
    details: item.metadata || {},
  };
};

export function ItineraryTabContent({
  tripId,
  userRole,
  startDate,
  durationDays,
}: ItineraryTabContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, isLoading, error, fetchItems, addItem, updateItem, deleteItem, reorderItems } = useItinerary(tripId);
  const { user: authUser } = useAuth();

  // State for edit sheet
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<DisplayItineraryItem | null>(null);

  // State for add item dialog
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(null);

  // Ref for importMapButton to avoid nesting buttons
  const importMapButtonRef = useRef<HTMLDivElement>(null);

  // Convert itinerary items to display items
  const displayItems = useMemo(() => {
    return items.map(item => adaptToDisplayItemLocal(item));
  }, [items]);

  // Generate sections for vertical stepper
  const sections = useMemo(() => {
    const result: React.ReactNode[] = [];
    const unscheduledItems = displayItems.filter((item) => item.day_number === null);
    if (unscheduledItems.length > 0) {
      result.push(
        <UnscheduledItemsSection
          key="unscheduled"
          items={unscheduledItems}
          onEdit={item => { setCurrentEditItem(item); setIsEditSheetOpen(true); }}
          onDelete={id => deleteItem(id)}
        />
      );
    }
    for (let day = 1; day <= durationDays; day++) {
      const dayItems = displayItems.filter(item => item.day_number === day);
      result.push(
        <ItineraryDaySection
          key={`day-${day}`}
          title={`Day ${day}`}
          items={dayItems}
          onEdit={item => { setCurrentEditItem(item); setIsEditSheetOpen(true); }}
          onDelete={id => deleteItem(id)}
        />
      );
    }
    return result;
  }, [displayItems, durationDays, deleteItem]);

  // Loading and error UI
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading itinerary...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  // Use atomic template
  return (
    <ItineraryTabTemplate 
      sections={sections} 
      onAddItem={() => setIsAddItemDialogOpen(true)} 
    />
  );
}
