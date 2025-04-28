import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WifiOff, Home } from "lucide-react";

export const metadata = {
  title: "You're Offline | withme.travel",
  description: "You appear to be offline. Some features may be unavailable.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      <div className="max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <WifiOff className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;re currently offline. Some features and content may be unavailable until you reconnect to the internet.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h2 className="mb-2 font-medium">What you can do:</h2>
            <ul className="space-y-2 text-sm text-left text-muted-foreground">
              <li>• Check your internet connection</li>
              <li>• Browse previously visited trips (if cached)</li>
              <li>• View saved content that&apos;s been cached</li>
              <li>• Try again when you&apos;re back online</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full" asChild variant="default">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        </div>
        
        <p className="pt-6 text-sm text-muted-foreground">
          withme.travel works offline for many features thanks to Progressive Web App technology.
        </p>
      </div>
    </div>
  );
} 