/**
 * @deprecated This component has been moved to components/features/trips/molecules/TripDetailError.tsx
 * Please update your imports to use the new location.
 */
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ArrowLeft, Home, Copy } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface TripDetailErrorProps {
  tripId: string;
  error?: Error;
  onRetry: () => Promise<void>;
  isNotFound?: boolean;
  isPermissionDenied?: boolean;
}

/**
 * Error component displayed when a trip detail fails to load
 * Provides retry functionality and navigation options
 */
export function TripDetailError({
  tripId,
  error,
  onRetry,
  isNotFound = false,
  isPermissionDenied = false,
}: TripDetailErrorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(
    process.env.NODE_ENV === 'development' ? error?.message || null : null
  );

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await onRetry();
      // If successful, the parent component will re-render with new data
    } catch (e) {
      // If retry still fails, update error details if in development
      if (process.env.NODE_ENV === 'development') {
        setErrorDetails(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCopyTripId = () => {
    navigator.clipboard.writeText(tripId);
    toast({
      title: 'Trip ID copied',
      description: 'The trip ID has been copied to your clipboard',
    });
  };

  // Determine title and description based on error type
  let title = 'Unable to load trip';
  let description = 'We encountered a problem while trying to load this trip.';

  if (isNotFound) {
    title = 'Trip not found';
    description = "This trip doesn't exist or may have been deleted.";
  } else if (isPermissionDenied) {
    title = 'Access denied';
    description = "You don't have permission to view this trip.";
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive mb-1">
          <AlertCircle className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorDetails && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {errorDetails}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          {!isNotFound && !isPermissionDenied && (
            <>
              <p>This could be due to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>A temporary connection issue</li>
                <li>The server might be experiencing problems</li>
                <li>The trip might have been deleted or made private</li>
              </ul>
            </>
          )}

          {isPermissionDenied && (
            <p>
              You need to be invited to this trip to view it. Contact the trip owner if you believe
              you should have access.
            </p>
          )}

          {isNotFound && (
            <p>
              The trip you're looking for might have been deleted or never existed. Check the URL
              and try again.
            </p>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded-md">
            <span className="text-xs font-mono">{tripId}</span>
            <Button variant="ghost" size="icon" onClick={handleCopyTripId}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <Link href="/trips" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            <Home className="mr-2 h-4 w-4" />
            My Trips
          </Button>
        </Link>

        {!isNotFound && !isPermissionDenied && (
          <Button
            variant="default"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again {retryCount > 0 && `(${retryCount})`}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
