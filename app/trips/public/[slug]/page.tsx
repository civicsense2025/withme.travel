// Keep only what's needed for a Server Component
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PublicTripPageClient from './public-trip-page-client';

// Simple loading component
function PublicTripPageLoading() {
  return <div className="container pyU6">Loading trip details...</div>;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicTripPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  return (
    <Suspense fallback={<PublicTripPageLoading />}>
      <PublicTripPageClient slug={slug} />
    </Suspense>
  );
}
