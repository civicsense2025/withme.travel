"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface Destination {
  id: string
  name: string
  country: string
}

interface ItineraryFiltersProps {
  destinations: Destination[]
}

export function ItineraryFilters({ destinations }: ItineraryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [destination, setDestination] = useState(searchParams.get("destination") || "")
  const [duration, setDuration] = useState(searchParams.get("duration") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")

  const durations = [
    { value: "1-3", label: "1-3 days" },
    { value: "4-7", label: "4-7 days" },
    { value: "8-14", label: "8-14 days" },
    { value: "15+", label: "15+ days" },
  ]

  const categories = [
    { value: "adventure", label: "Adventure" },
    { value: "beach", label: "Beach" },
    { value: "city", label: "City" },
    { value: "culture", label: "Culture" },
    { value: "family", label: "Family" },
    { value: "food", label: "Food & Drink" },
    { value: "nature", label: "Nature" },
    { value: "relaxation", label: "Relaxation" },
    { value: "romantic", label: "Romantic" },
  ]

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (destination) params.set("destination", destination)
    if (duration) params.set("duration", duration)
    if (category) params.set("category", category)

    router.push(`/itineraries?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setDestination("")
    setDuration("")
    setCategory("")
    router.push("/itineraries")
  }

  useEffect(() => {
    // Update state when URL params change
    setSearch(searchParams.get("search") || "")
    setDestination(searchParams.get("destination") || "")
    setDuration(searchParams.get("duration") || "")
    setCategory(searchParams.get("category") || "")
  }, [searchParams])

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Templates</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Select value={destination} onValueChange={setDestination}>
          <SelectTrigger>
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {destinations.map((dest) => (
              <SelectItem key={dest.id} value={dest.id}>
                {dest.name}, {dest.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Duration</SelectItem>
            {durations.map((dur) => (
              <SelectItem key={dur.value} value={dur.value}>
                {dur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
          <X size={14} />
          Clear
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}
