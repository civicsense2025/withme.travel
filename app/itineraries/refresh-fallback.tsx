'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RefreshFallback() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-medium mb-3">Itineraries</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Ready-made travel plans to inspire your next adventure
      </p>
      <div className="border rounded-lg p-8 bg-card text-center">
        <h2 className="text-xl font-semibold mb-2">Unable to load itineraries</h2>
        <p className="mb-4 text-muted-foreground">
          We're having trouble connecting to our servers. Please try again later.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
