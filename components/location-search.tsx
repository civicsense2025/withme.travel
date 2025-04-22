"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { API_ROUTES } from "@/utils/constants"

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
  onLocationSelect: (location: Destination) => void
  placeholder?: string
  className?: string
  containerClassName?: string
}

export function LocationSearch({
  onLocationSelect,
  placeholder = "Search city, state, or country...",
  className = "",
  containerClassName = "",
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Destination[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

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

  useEffect(() => {
    async function fetchDestinations() {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([])
        return
      }
      try {
        setIsSearching(true)
        const response = await fetch(API_ROUTES.DESTINATION_SEARCH(debouncedSearchQuery))
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
    setSearchQuery(`${location.city}, ${location.country}`)
    setSearchResults([])
    onLocationSelect(location)
  }

  return (
    <div className={`relative ${containerClassName}`} ref={searchRef}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className={`pl-10 pr-4 py-2 ${className}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg max-h-60 overflow-y-auto">
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
