import type { Metadata } from "next"
import Link from "next/link"
import { PlusCircle, Search, Filter, List, LayoutGrid } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { SkeletonCard } from "@/components/skeleton-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItineraryFilters } from "@/components/itinerary-filters"
import { ItineraryTemplateCard } from "@/components/itinerary-template-card"

export const dynamic = 'force-dynamic' // Ensure dynamic rendering

export const metadata: Metadata = {
  title: "Browse Itineraries",
  description: "Explore travel itineraries shared by the community.",
}

// Define the Itinerary type based on expected data from the query
interface Itinerary {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  location: string | null
  duration: string | null
  duration_days: number | null
  category: string | null
  slug: string
  is_public: boolean
  upvotes: number
  user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null // Should be object or null
  destinations: {
    city: string;
    country: string;
    image_url: string | null;
  } | null // Should be object or null
  // Added fields (ensure they are selected or defaulted)
  groupSize?: string | null;
  tags?: string[];
}

// Fetch itineraries from the database
async function getItineraries() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select("*, destinations(*), created_by:users(id, full_name, avatar_url)") 
    .eq("is_published", true)
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching itineraries:", error)
    return []
  }
  
  // Map data to ensure consistency, especially if created_by is null
  return (data || []).map(item => ({
    ...item,
    author: item.created_by ? { 
      id: item.created_by.id, 
      name: item.created_by.full_name, 
      avatar_url: item.created_by.avatar_url 
    } : null,
  }))
}

export default async function ItinerariesPage() {
  const itineraries = await getItineraries()
  
  const hasItineraries = itineraries.length > 0
  const displayItineraries = hasItineraries ? itineraries : []

  // Fetch distinct filter options (Placeholder)
  const filterOptions = {
    locations: [],
    categories: [],
    durations: [],
  }

  return (
    <div className="container py-10">
      <PageHeader 
        heading="explore itineraries" 
        description="discover travel plans shared by the community"
      >
        <Button asChild>
          <Link href="/itineraries/submit" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Submit Yours
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-8">
        {/* Pass only the destinations prop */}
        <ItineraryFilters destinations={[]} /> {/* Pass fetched/mapped destinations here eventually */}
      </div>

      {displayItineraries.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No itineraries found yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to share your travel experience!</p>
          <Button asChild>
            <Link href="/itineraries/submit" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Submit Your Itinerary
            </Link>
          </Button>
        </div>
      )}

      {displayItineraries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItineraries.map((itinerary) => (
            <ItineraryTemplateCard 
              key={itinerary.id} 
              itinerary={{
                id: itinerary.id,
                title: itinerary.title,
                description: itinerary.description,
                // Use optional chaining for nested properties
                image: itinerary.image || itinerary.destinations?.image_url || "/placeholder.svg",
                location: itinerary.location || (itinerary.destinations ? `${itinerary.destinations.city}, ${itinerary.destinations.country}` : "Unknown Location"),
                duration: itinerary.duration || `${itinerary.duration_days || "N/A"} days`,
                groupSize: itinerary.groupSize || "N/A",
                tags: itinerary.tags || [],
                category: itinerary.category || "uncategorized",
                slug: itinerary.slug || itinerary.id // Use ID as fallback slug
              }} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
