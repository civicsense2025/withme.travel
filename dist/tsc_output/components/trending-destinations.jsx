"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/utils/constants";
import { DestinationCard } from "@/components/destination-card";
// Fetcher function for SWR
const fetcher = async (url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`Failed to fetch data: ${res.status} ${errorData}`);
        }
        return res.json();
    }
    catch (error) {
        console.error("Fetcher error:", error);
        throw error;
    }
};
export function TrendingDestinations() {
    const router = useRouter();
    const [errorDetails, setErrorDetails] = useState(null);
    // Using SWR for data fetching with stale-while-revalidate strategy
    const { data, error, isValidating } = useSWR(API_ENDPOINTS.TRENDING_DESTINATIONS + "&limit=6", fetcher, {
        revalidateOnFocus: false, // Don't revalidate when window gets focus
        revalidateIfStale: true, // Revalidate if data is stale
        dedupingInterval: 60000, // Dedupe requests within 1 minute
        errorRetryCount: 3, // Retry 3 times on failure
        onError: (err) => {
            console.error("SWR Error:", err);
            setErrorDetails(err.message || "Unknown error");
        }
    });
    const destinations = (data === null || data === void 0 ? void 0 : data.destinations) || [];
    const isLoading = !data && !error;
    if (isLoading) {
        return (<>
        {[...Array(6)].map((_, i) => (<div key={`skeleton-${i}`} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted animate-pulse"/>))}
      </>);
    }
    // Show error details for debugging
    if (error) {
        return (<Alert variant="destructive">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Error loading destinations</AlertTitle>
        <AlertDescription>
          <p>There was a problem loading destinations.</p>
          {errorDetails && (<details className="mt-2 text-xs">
              <summary>Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{errorDetails}</pre>
            </details>)}
        </AlertDescription>
      </Alert>);
    }
    // If no destinations after loading, show empty state
    if (destinations.length === 0 && !isLoading) {
        return (<div className="text-center py-10">
        <p className="text-muted-foreground">No trending destinations found.</p>
      </div>);
    }
    return (<>
      {destinations.map((destination, index) => (<motion.div key={destination.id || `dest-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{
                duration: 0.4,
                delay: index * 0.15,
                ease: "easeOut"
            }} className="h-full">
          <DestinationCard destination={destination} href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, "-")}`}/>
        </motion.div>))}
      
      {/* Show subtle loading indicator while revalidating */}
      {isValidating && !isLoading && (<div className="mt-4 flex justify-center col-span-full">
          <div className="h-1 w-10 bg-travel-purple/50 rounded-full animate-pulse"></div>
        </div>)}
    </>);
}
