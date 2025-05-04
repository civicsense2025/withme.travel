'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { TRIP_ROLES } from '@/utils/constants/status';

// Dynamically import the GoogleMapsUrlImport component to reduce bundle size
const GoogleMapsUrlImport = dynamic(
  () => import('./google-maps-url-import'),
  { ssr: false }
);

interface Destination {
  id: string;
  name?: string;
  city?: string;
  country?: string;
  image_url?: string;
  [key: string]: any;
}

export interface ImportMapButtonProps {
  tripId: string;
  canEdit: boolean;
}

export default function ImportMapButton({ tripId, canEdit }: ImportMapButtonProps) {
  const [open, setOpen] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <MapPin className="mr-1 h-4 w-4" />
          Import from Google Maps
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import from Google Maps</DialogTitle>
          <DialogDescription>
            Paste a Google Maps URL to import places to your trip.
          </DialogDescription>
        </DialogHeader>
        <GoogleMapsUrlImport
          tripId={tripId}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
