// Keep only what's needed for a Server Component
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import PublicTripPageClient from './public-trip-page-client'

// Simple loading component
function PublicTripPageLoading() {
  return <div className="container py-6">Loading trip details...</div>
}

export default async function PublicTripPage({ params: { slug } }: { params: { slug: string } }) {
  if (!slug) {
    notFound()
  }

  return (
    <Suspense fallback={<PublicTripPageLoading />}>
      <PublicTripPageClient slug={slug} />
    </Suspense>
  )
}
