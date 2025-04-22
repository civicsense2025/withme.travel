"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

interface Destination {
  id: string
  name: string
  city: string
  state_province: string | null
  country: string
  continent: string
  description: string | null
  image_url: string | null
}

export default function DestinationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [continentFilter, setContinentFilter] = useState<string | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/destinations")

        if (!response.ok) {
          throw new Error("Failed to fetch destinations")
        }

        const data = await response.json()
        setDestinations(data.destinations || [])
        setFilteredDestinations(data.destinations || [])
      } catch (error) {
        console.error("Error fetching destinations:", error)
        toast({
          title: "Error loading destinations",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDestinations()
  }, [toast])

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
  }, [debouncedSearchQuery, continentFilter, destinations])

  // Get unique continents for filtering
  const continents: string[] = Array.from(new Set(destinations.map((dest) => dest.continent))).sort()

  // Helper function to get the image URL
  const getDestinationImageUrl = (destination: Destination) => {
    // If the destination has an image_url that starts with '/', it's a local image
    if (destination.image_url && destination.image_url.startsWith("/")) {
      return destination.image_url
    }

    // If the destination has an external image URL
    if (
      destination.image_url &&
      (destination.image_url.startsWith("http://") || destination.image_url.startsWith("https://"))
    ) {
      return destination.image_url
    }

    // Fallback to a placeholder with the destination name
    return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(destination.city + " " + destination.country)}`
  }

  // Determine color class based on destination ID
  const getColorClass = (id: string | undefined) => {
    // Define color classes using CSS variables for theme compatibility
    const colorClasses = [
      "bg-travel-blue text-[hsl(var(--travel-blue-foreground))]",
      "bg-travel-pink text-[hsl(var(--travel-pink-foreground))]",
      "bg-travel-yellow text-[hsl(var(--travel-yellow-foreground))]",
      "bg-travel-purple text-[hsl(var(--travel-purple-foreground))]",
      "bg-travel-mint text-[hsl(var(--travel-mint-foreground))]",
      "bg-travel-peach text-[hsl(var(--travel-peach-foreground))]",
    ]

    // If id is undefined or null, return a default color
    if (!id) {
      return colorClasses[0] // Default to first color
    }

    const colorIndex = Math.abs(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % colorClasses.length
    return colorClasses[colorIndex]
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination: Destination) => {
            const colorClass = getColorClass(destination.id)

            return (
              <Link
                key={destination.id}
                href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, "-")}`}
                className="block"
              >
                <motion.div
                  className="rounded-3xl overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-300 max-w-xs mx-auto"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={getDestinationImageUrl(destination) || "/placeholder.svg"}
                      alt={destination.city}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-white font-bold text-xl lowercase">{destination.city}</h3>
                      <div className="flex items-center text-white/80 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {destination.state_province ? `${destination.state_province}, ` : ""}
                          {destination.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 ${colorClass} bg-opacity-30`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm lowercase">{destination.continent.toLowerCase()}</span>
                      <span className="text-xs lowercase bg-white/30 px-2 py-1 rounded-full">explore →</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
