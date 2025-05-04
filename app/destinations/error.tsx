'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LAYOUT } from './constants';
import { useRouter } from 'next/navigation';

// Error component for the destinations page
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // Log error to an error reporting service
  useEffect(() => {
    console.error('Destination page error:', error);
  }, [error]);

  return (
    <main className={LAYOUT.CONTAINER_CLASS}>
      <div className="text-center py-12" role="alert" aria-live="assertive">
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        
        {/* Show error message if it exists and is safe to display */}
        {error.message && !error.message.includes('fetch failed') && (
          <p className="text-muted-foreground mb-2">
            {error.message}
          </p>
        )}
        
        {/* Generic fallback message */}
        <p className="text-muted-foreground mb-6">
          We're having trouble loading the destinations page. Please try again.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {/* Primary retry button */}
          <Button 
            onClick={reset}
            aria-label="Try again"
          >
            Try again
          </Button>
          
          {/* Secondary go home button */}
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            aria-label="Go to homepage"
          >
            Go home
          </Button>
        </div>
      </div>
    </main>
  );
}

