"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { DestinationCard } from "@/components/destination-card"

interface Destination {
  id: string
  name: string
  city: string
  state_province: string | null
  country: string
  continent: string
  description: string | null
  image_url: string | null
  cuisine_rating: number
  nightlife_rating: number
  cultural_attractions: number
  outdoor_activities: number
  beach_quality: number
}

// Define card animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function DestinationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [displayedDestinations, setDisplayedDestinations] = useState<Destination[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [continentFilter, setContinentFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 12

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const loadDestinations = useCallback(async (refresh = false) => {
    try {
      setIsLoading(refresh)
      if (!refresh) setIsLoadingMore(true)
      
      const response = await fetch("/api/destinations")

      if (!response.ok) {
        throw new Error("Failed to fetch destinations")
      }

      const data = await response.json()
      
      if (refresh) {
        setDestinations(data.destinations || [])
        setFilteredDestinations(data.destinations || [])
        setPage(1)
      }
    } catch (error) {
      console.error("Error fetching destinations:", error)
      toast({
        title: "Error loading destinations",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [toast])

  useEffect(() => {
    loadDestinations(true)
  }, [loadDestinations])

  useEffect(() => {
    // Filter destinations based on search query and continent filter
    let filtered = [...destinations]

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (dest: Destination) =>
          dest.city.toLowerCase().includes(query) ||
          dest.country.toLowerCase().includes(query) ||
          (dest.state_province && dest.state_province.toLowerCase().includes(query)) ||
          dest.continent.toLowerCase().includes(query),
      )
    }

    if (continentFilter) {
      filtered = filtered.filter((dest: Destination) => dest.continent === continentFilter)
    }

    setFilteredDestinations(filtered)
    // Reset page when filter changes
    setPage(1)
  }, [debouncedSearchQuery, continentFilter, destinations])

  useEffect(() => {
    // Update displayed destinations based on pagination
    const endIndex = page * ITEMS_PER_PAGE
    const paginatedDestinations = filteredDestinations.slice(0, endIndex)
    setDisplayedDestinations(paginatedDestinations)
    
    // Check if we have more destinations to load
    setHasMore(filteredDestinations.length > endIndex)
  }, [filteredDestinations, page])

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1)
  }

  // Get unique continents for filtering, ensuring only strings are included
  const continents: string[] = Array.from(
    new Set(
      destinations
        .map((dest) => dest.continent)
        .filter((c): c is string => typeof c === 'string') // Filter out null/undefined
    )
  ).sort();

  return (
    <div className="container py-8">
      <PageHeader
        heading="explore destinations"
        description="discover amazing places around the world for your next adventure"
      />

      <div className="flex flex-col md:flex-row gap-4 mt-8 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="search destinations..."
            className="pl-9 rounded-full"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button
            variant={continentFilter === null ? "default" : "outline"}
            size="sm"
            className="lowercase rounded-full"
            onClick={() => setContinentFilter(null)}
          >
            all
          </Button>
          {continents.map((continent) => (
            <Button
              key={continent}
              variant={continentFilter === continent ? "default" : "outline"}
              size="sm"
              className="lowercase rounded-full"
              onClick={() => setContinentFilter(continent)}
            >
              {continent.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden h-64 bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold lowercase">no destinations found</h2>
          <p className="text-muted-foreground mt-2">try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDestinations.map((destination: Destination) => (
              <motion.div
                key={destination.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <DestinationCard 
                  destination={{
                    id: destination.id,
                    city: destination.city,
                    country: destination.country,
                    image_url: destination.image_url,
                    description: destination.description,
                    slug: destination.city.toLowerCase().replace(/\s+/g, "-"),
                  }}
                />
              </motion.div>
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
                {!isLoadingMore && <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
