import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { ItineraryFilters } from "@/components/itinerary-filters"
import { ItineraryTemplateCard } from "@/components/itinerary-template-card"
import { ClientWrapper } from "./client-wrapper"

export const dynamic = 'force-dynamic' // Ensure dynamic rendering

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
  is_published: boolean
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
  
  try {
    // First attempt to get all templates (published and unpublished)
    const { data, error } = await supabase
      .from("itinerary_templates")
      .select("*, destinations(*), creator:created_by(id, name, avatar_url)") 
      .order("created_at", { ascending: false })
      // .eq("is_published", true) - Removed to show all templates
    
    if (error) {
      console.error("Error fetching itineraries:", error)
      return []
    }
    
    // Map data to ensure consistency, especially if created_by is null
    return (data || []).map(item => ({
      ...item,
      author: item.creator ? { 
        id: item.creator.id, 
        name: item.creator.name, 
        avatar_url: item.creator.avatar_url 
      } : null,
    }))
  } catch (err) {
    console.error("Exception fetching itineraries:", err)
    return []
  }
}

export default async function ItinerariesPage() {
  const itineraries = await getItineraries()
  
  const hasItineraries = itineraries.length > 0
  const displayItineraries = hasItineraries ? itineraries : []

  console.log(`Found ${displayItineraries.length} itineraries`)

  // Transform itineraries into a format compatible with the client component
  const formattedItineraries = displayItineraries.map((itinerary) => ({
    id: itinerary.id,
    title: itinerary.title,
    description: itinerary.description,
    image: itinerary.cover_image_url || 
           (itinerary.destinations ? itinerary.destinations.image_url : null) || 
           "/images/placeholder-itinerary.jpg",
    location: itinerary.location || 
             (itinerary.destinations ? `${itinerary.destinations.city || ''}, ${itinerary.destinations.country || ''}` : "Unknown Location"),
    duration: itinerary.duration || `${itinerary.duration_days || "N/A"} days`,
    groupSize: itinerary.groupSize || "N/A",
    tags: itinerary.tags || [],
    category: itinerary.category || "uncategorized",
    slug: itinerary.slug || itinerary.id,
    is_published: itinerary.is_published || false
  }))

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

      {/* Client side components wrapped in a client component */}
      <ClientWrapper 
        itineraries={formattedItineraries}
        destinations={[]} // Pass fetched destinations here eventually
      />
    </div>
  )
}
