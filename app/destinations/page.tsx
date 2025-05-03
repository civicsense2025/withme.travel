// Server component wrapper
import { Suspense } from 'react';
import DestinationsClient from './destinations-client';
import { PageHeader } from '@/components/page-header';

// Mark as a dynamic route
export const dynamic = 'force-dynamic';

export default function DestinationsPage() {
  return (
    <div className="container py-12">
      <PageHeader
        heading="discover your next adventure"
        description="explore authentic local experiences and hidden gems in cities around the world, curated by fellow travelers"
      />

      <Suspense fallback={<DestinationsLoadingSkeleton />}>
        <DestinationsClient />
      </Suspense>
    </div>
  );
}

function DestinationsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-3xl overflow-hidden h-48 bg-muted animate-pulse" />
      ))}
    </div>
  );
}
