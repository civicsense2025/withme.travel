"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { DestinationCard } from "@/components/destination-card";
// Define card animation variants
const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};
export default function DestinationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [displayedDestinations, setDisplayedDestinations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [continentFilter, setContinentFilter] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 12;
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const loadDestinations = useCallback(async (refresh = false) => {
        try {
            setIsLoading(refresh);
            if (!refresh)
                setIsLoadingMore(true);
            const response = await fetch("/api/destinations");
            if (!response.ok) {
                throw new Error("Failed to fetch destinations");
            }
            const { destinations } = await response.json();
            if (refresh) {
                setDestinations(destinations || []);
                setFilteredDestinations(destinations || []);
                setPage(1);
            }
        }
        catch (error) {
            console.error("Error fetching destinations:", error);
            toast({
                title: "Error loading destinations",
                description: "Please try again later",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [toast]);
    useEffect(() => {
        loadDestinations(true);
    }, [loadDestinations]);
    useEffect(() => {
        // Filter destinations based on search query and continent filter
        let filtered = [...destinations];
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter((dest) => {
                var _a, _b, _c, _d;
                return (((_a = dest.city) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "").includes(query) ||
                    (((_b = dest.country) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "").includes(query) ||
                    (((_c = dest.state_province) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "").includes(query) ||
                    (((_d = dest.continent) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || "").includes(query);
            });
        }
        if (continentFilter) {
            filtered = filtered.filter((dest) => dest.continent === continentFilter);
        }
        setFilteredDestinations(filtered);
        // Reset page when filter changes
        setPage(1);
    }, [debouncedSearchQuery, continentFilter, destinations]);
    useEffect(() => {
        // Update displayed destinations based on pagination
        const endIndex = page * ITEMS_PER_PAGE;
        const paginatedDestinations = filteredDestinations.slice(0, endIndex);
        setDisplayedDestinations(paginatedDestinations);
        // Check if we have more destinations to load
        setHasMore(filteredDestinations.length > endIndex);
    }, [filteredDestinations, page]);
    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };
    // Get unique continents for filtering, ensuring only strings are included
    const continents = Array.from(new Set(destinations
        .map((dest) => dest.continent)
        .filter((c) => typeof c === 'string') // Filter out null/undefined
    )).sort();
    return (<div className="container py-12">
      <PageHeader heading="discover your next adventure" description="explore authentic local experiences and hidden gems in cities around the world, curated by fellow travelers"/>

      <div className="flex flex-col md:flex-row gap-6 mt-12 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input placeholder="find your perfect destination..." className="pl-9 rounded-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
          <Button variant={continentFilter === null ? "default" : "outline"} size="sm" className="lowercase rounded-full whitespace-nowrap" onClick={() => setContinentFilter(null)}>
            all regions
          </Button>
          {continents.map((continent) => (<Button key={continent} variant={continentFilter === continent ? "default" : "outline"} size="sm" className="lowercase rounded-full whitespace-nowrap" onClick={() => setContinentFilter(continent)}>
              {continent.toLowerCase()}
            </Button>))}
        </div>
      </div>

      {isLoading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (<div key={i} className="rounded-3xl overflow-hidden h-48 bg-muted animate-pulse"/>))}
        </div>) : filteredDestinations.length === 0 ? (<div className="text-center py-16">
          <h2 className="text-2xl font-medium lowercase">no destinations found</h2>
          <p className="text-muted-foreground mt-3">try adjusting your search or exploring different regions</p>
        </div>) : (<>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedDestinations.map((destination) => (<motion.div key={destination.id} variants={cardVariants} initial="initial" animate="animate" transition={{ duration: 0.3, delay: 0.1 }} className="h-full">
                <DestinationCard destination={destination} className="h-full"/>
              </motion.div>))}
          </div>

          {hasMore && (<div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="rounded-full lowercase" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "loading more..." : "discover more destinations"}
                <ChevronDown className="ml-2 h-4 w-4"/>
              </Button>
            </div>)}
        </>)}
    </div>);
}
