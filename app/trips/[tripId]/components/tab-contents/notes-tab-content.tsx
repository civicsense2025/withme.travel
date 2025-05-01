'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import * as Sentry from '@sentry/nextjs';

// Dynamically import CollaborativeNotes with no SSR
const CollaborativeNotes = dynamic(
  () => import('@/components/collaborative-notes').then((mod) => mod.CollaborativeNotes),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

interface NotesTabContentProps {
  tripId: string;
  canEdit: boolean;
}

export function NotesTabContent({ tripId, canEdit }: NotesTabContentProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Track component load in Sentry
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'component',
      message: 'Notes tab loaded',
      level: 'info',
      data: {
        tripId,
        canEdit,
      },
    });

    // Simulate loading state for SSR hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [tripId, canEdit]);

  // During initial load, show skeleton
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <CollaborativeNotes tripId={tripId} readOnly={!canEdit} />;
}
