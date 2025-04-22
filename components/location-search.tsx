"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-provider"
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

interface LocationSearchProps {
  onLocationSelect?: (location: { name: string; placeId: string }) => void
  buttonText?: string
  placeholder?: string
  className?: string
  containerClassName?: string
}

export function LocationSearch({
  onLocationSelect,
  buttonText = "Plan Your Trip",
  placeholder = "Where do you want to go?",
  className = "",
  containerClassName = "",
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Destination[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Destination | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useAuth()

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch search results when debounced query changes
  useEffect(() => {
    async function fetchDestinations() {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([])
        return
      }

      try {
        setIsSearching(true)
        const response = await fetch(`/api/destinations/search?query=${encodeURIComponent(debouncedSearchQuery)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch destinations")
        }

        const data = await response.json()
        setSearchResults(data.destinations || [])
      } catch (error) {
        console.error("Error fetching destinations:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    fetchDestinations()
  }, [debouncedSearchQuery])

  const handleSelectLocation = (location: Destination) => {
    setSelectedLocation(location)
    setSearchQuery(location.city)
    setSearchResults([])

    if (onLocationSelect) {
      onLocationSelect({
        name: location.city,
        placeId: location.id,
      })
    }
  }

  const handleStartPlanning = () => {
    if (!searchQuery.trim()) return

    const destination = encodeURIComponent(searchQuery.trim())

    // Direct to the trip creation flow
    if (user) {
      router.push(
        `/trips/create?destination=${destination}${selectedLocation ? `&placeId=${selectedLocation.id}` : ""}`,
      )
    } else {
      router.push(
        `/login?redirect=/trips/create?destination=${destination}${selectedLocation ? `&placeId=${selectedLocation.id}` : ""}`,
      )
    }
  }

  return (
    <div className={`relative ${containerClassName}`} ref={searchRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleStartPlanning()
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            className={`pl-10 pr-4 py-6 text-lg ${className}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button type="submit" size="lg" className="px-6 py-6 text-base">
          {buttonText}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          {searchResults.map((place) => (
            <div
              key={place.id}
              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
              onClick={() => handleSelectLocation(place)}
            >
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">{place.city}</p>
                <p className="text-xs text-muted-foreground">
                  {place.state_province ? `${place.state_province}, ` : ""}
                  {place.country} • {place.continent}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
