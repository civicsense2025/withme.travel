'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface TripListErrorProps {
  error?: Error;
  onRetry: () => void;
  title?: string;
  description?: string;
}

/**
 * Error component displayed when the trip list fails to load
 * Provides retry functionality and navigation options
 */
export function TripListError({
  error,
  onRetry,
  title = "Unable to load trips",
  description = "We encountered a problem while trying to load your trips.",
}: TripListErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(
    process.env.NODE_ENV === 'development' ? error?.message || null : null
  );

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
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
          <p>This could be due to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>A temporary connection issue</li>
            <li>The server might be experiencing problems</li>
            <li>You might not have permission to view these trips</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
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
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        
        <Link href="/destinations" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Explore Destinations
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

