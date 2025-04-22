import type { Metadata } from "next"
import Link from "next/link"
import { Filter } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ItineraryTemplateCard } from "@/components/itinerary-template-card"

export const metadata: Metadata = {
  title: "Itinerary Templates | withme.travel",
  description: "Browse and use travel itinerary templates for your next group adventure",
}

// Sample itinerary data - in a real app, this would come from the database
const itineraries = [
  {
    id: "weekend-in-paris",
    title: "Weekend in Paris",
    description: "A perfect 3-day itinerary for first-time visitors to the City of Light",
    image: "/Parisian-Cafe-Scene.png",
    location: "Paris, France",
    duration: "3 days",
    groupSize: "2-4 people",
    category: "city",
    tags: ["romantic", "food", "culture"],
  },
  {
    id: "tokyo-adventure",
    title: "Tokyo Adventure",
    description: "Explore the best of Tokyo in 5 days, from traditional temples to futuristic districts",
    image: "/tokyo-twilight.png",
    location: "Tokyo, Japan",
    duration: "5 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["food", "culture", "shopping"],
  },
  {
    id: "barcelona-weekend",
    title: "Barcelona Weekend",
    description: "Beach, tapas, and architecture in this perfect weekend getaway",
    image: "/barceloneta-sand-and-sea.png",
    location: "Barcelona, Spain",
    duration: "3 days",
    groupSize: "4-8 people",
    category: "beach",
    tags: ["food", "nightlife", "architecture"],
  },
  {
    id: "california-road-trip",
    title: "California Road Trip",
    description: "The ultimate coastal drive from San Francisco to Los Angeles",
    image: "/california-highway-one.png",
    location: "California, USA",
    duration: "7 days",
    groupSize: "2-5 people",
    category: "road-trip",
    tags: ["nature", "driving", "beaches"],
  },
  {
    id: "bangkok-explorer",
    title: "Bangkok Explorer",
    description: "Temples, markets, and street food in the vibrant Thai capital",
    image: "/bustling-bangkok-street.png",
    location: "Bangkok, Thailand",
    duration: "4 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["food", "culture", "budget"],
  },
  {
    id: "new-york-city-break",
    title: "New York City Break",
    description: "The essential NYC experience in just 4 days",
    image: "/manhattan-twilight.png",
    location: "New York, USA",
    duration: "4 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["shopping", "culture", "food"],
  },
]

export default function ItinerariesPage() {
  return (
    <div className="container py-10">
      <PageHeader
        heading="itinerary templates"
        subheading="browse and use travel templates for your next group adventure"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-8 mb-6">
        <div className="w-full md:w-auto">
          <Input placeholder="Search itineraries..." className="max-w-sm" />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3">1-3 days</SelectItem>
              <SelectItem value="4-7">4-7 days</SelectItem>
              <SelectItem value="8+">8+ days</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (2-4)</SelectItem>
              <SelectItem value="medium">Medium (5-8)</SelectItem>
              <SelectItem value="large">Large (9+)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all" className="lowercase">
            All
          </TabsTrigger>
          <TabsTrigger value="city" className="lowercase">
            City Breaks
          </TabsTrigger>
          <TabsTrigger value="beach" className="lowercase">
            Beach
          </TabsTrigger>
          <TabsTrigger value="road-trip" className="lowercase">
            Road Trips
          </TabsTrigger>
          <TabsTrigger value="nature" className="lowercase">
            Nature & Outdoors
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <ItineraryTemplateCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4 lowercase">Have a great itinerary to share?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Help other travelers by sharing your successful trip itinerary as a template
        </p>
        <Button asChild className="lowercase">
          <Link href="/itineraries/submit">Submit Your Itinerary</Link>
        </Button>
      </div>
    </div>
  )
}
