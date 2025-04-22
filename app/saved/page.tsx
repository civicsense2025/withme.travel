"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Bookmark, Map, FileText, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { LikeButton } from "@/components/like-button"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useLikes } from "@/hooks/use-likes"

export default function SavedPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { likes, isLoading, refetch } = useLikes()
  const [activeTab, setActiveTab] = useState("all")
  
  const [destinations, setDestinations] = useState<any[]>([])
  const [itineraries, setItineraries] = useState<any[]>([])
  const [attractions, setAttractions] = useState<any[]>([])
  
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login?redirect=/saved")
    }
  }, [user, isLoading, router])

  // Group likes by type and fetch details
  useEffect(() => {
    if (!likes.length) return
    
    setIsLoadingDetails(true)
    
    const fetchDetails = async () => {
      // Group likes by type
      const destinationLikes = likes.filter(like => like.item_type === 'destination')
      const itineraryLikes = likes.filter(like => like.item_type === 'itinerary')
      const attractionLikes = likes.filter(like => like.item_type === 'attraction')
      
      // Fetch details for destinations
      if (destinationLikes.length) {
        try {
          const ids = destinationLikes.map(like => like.item_id)
          const query = ids.map(() => "id=eq.").join("&")
          const response = await fetch(`/api/destinations?${query}${ids.join(",")}`)
          if (response.ok) {
            const data = await response.json()
            setDestinations(data.destinations || [])
          }
        } catch (error) {
          console.error("Error fetching destination details:", error)
        }
      }
      
      // Fetch details for itineraries (placeholder)
      if (itineraryLikes.length) {
        // Implement when itinerary API is ready
        setItineraries([])
      }
      
      // Fetch details for attractions (placeholder)
      if (attractionLikes.length) {
        // Implement when attractions API is ready
        setAttractions([])
      }
      
      setIsLoadingDetails(false)
    }
    
    fetchDetails()
  }, [likes])

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p>Please log in to view your saved items.</p>
      </div>
    )
  }

  const totalSaved = destinations.length + itineraries.length + attractions.length

  return (
    <div className="container py-8">
      <PageHeader
        heading="saved items"
        description="all your favorite destinations, itineraries, and attractions in one place"
      />

      {isLoading || isLoadingDetails ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : totalSaved === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">no saved items yet</h2>
          <p className="text-muted-foreground mb-6">
            items you save will appear here so you can easily find them later
          </p>
          <Button onClick={() => router.push("/destinations")}>
            explore destinations
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList>
            <TabsTrigger value="all">All ({totalSaved})</TabsTrigger>
            <TabsTrigger value="destinations">Destinations ({destinations.length})</TabsTrigger>
            <TabsTrigger value="itineraries">Itineraries ({itineraries.length})</TabsTrigger>
            <TabsTrigger value="attractions">Attractions ({attractions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {destinations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Destinations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((destination) => (
                    <DestinationCard 
                      key={destination.id} 
                      destination={destination} 
                      onUnlike={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}

            {itineraries.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Itineraries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itineraries.map((itinerary) => (
                    <ItineraryCard 
                      key={itinerary.id} 
                      itinerary={itinerary} 
                      onUnlike={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}

            {attractions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Attractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attractions.map((attraction) => (
                    <AttractionCard 
                      key={attraction.id} 
                      attraction={attraction} 
                      onUnlike={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="destinations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <DestinationCard 
                  key={destination.id} 
                  destination={destination}
                  onUnlike={() => refetch()}
                />
              ))}
            </div>
            {destinations.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No saved destinations</h2>
                <p className="text-muted-foreground mt-2">
                  Destinations you save will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="itineraries" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <ItineraryCard 
                  key={itinerary.id} 
                  itinerary={itinerary}
                  onUnlike={() => refetch()}
                />
              ))}
            </div>
            {itineraries.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No saved itineraries</h2>
                <p className="text-muted-foreground mt-2">
                  Itineraries you save will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attractions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction) => (
                <AttractionCard 
                  key={attraction.id} 
                  attraction={attraction}
                  onUnlike={() => refetch()}
                />
              ))}
            </div>
            {attractions.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No saved attractions</h2>
                <p className="text-muted-foreground mt-2">
                  Attractions you save will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function DestinationCard({ destination, onUnlike }: { destination: any, onUnlike?: () => void }) {
  // Get country code for flag emoji
  const getCountryFlag = (countryName: string) => {
    // This is a simplified version - in production you'd want a more robust mapping
    const countryFlags: Record<string, string> = {
      "Japan": "🇯🇵",
      "Italy": "🇮🇹",
      "France": "🇫🇷",
      "Spain": "🇪🇸",
      "United States": "🇺🇸",
      "Thailand": "🇹🇭",
      "Mexico": "🇲🇽",
      "Brazil": "🇧🇷",
      "UK": "🇬🇧",
      "Greece": "🇬🇷",
    };
    
    return countryFlags[countryName] || "🏳️";
  };

  // Get tags for this destination
  const getTags = () => {
    const tags = [];
    if (destination.cuisine_rating >= 4) tags.push("food");
    if (destination.nightlife_rating >= 4) tags.push("nightlife");
    if (destination.cultural_attractions >= 4) tags.push("history");
    if (destination.outdoor_activities >= 4) tags.push("outdoors");
    if (destination.beach_quality >= 4) tags.push("beach");
    return tags.slice(0, 3);
  };

  const tags = getTags();

  return (
    <Link href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border">
        <div className="relative h-48 w-full bg-travel-purple/10">
          <div className="absolute top-3 right-3 z-10">
            <LikeButton 
              itemId={destination.id} 
              itemType="destination" 
              size="sm"
              className="shadow-sm"
              onClick={(isLiked) => {
                if (!isLiked && onUnlike) onUnlike();
              }}
            />
          </div>
          <Image
            src={
              destination.image_url ||
              `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(destination.name || destination.city)}`
            }
            alt={destination.name || destination.city}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getCountryFlag(destination.country)}</span>
            <h3 className="text-xl font-bold">{destination.city.toLowerCase()}</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map(tag => (
              <span 
                key={tag} 
                className={`text-sm px-4 py-1.5 rounded-full ${
                  tag === 'food' ? 'bg-travel-mint/80 text-travel-mint-foreground' :
                  tag === 'nightlife' ? 'bg-travel-peach/80 text-travel-peach-foreground' :
                  tag === 'history' ? 'bg-travel-blue/80 text-travel-blue-foreground' :
                  tag === 'outdoors' ? 'bg-travel-purple/80 text-travel-purple-foreground' :
                  'bg-travel-yellow/80 text-travel-yellow-foreground'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {destination.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{destination.description}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

// Placeholder components for itineraries and attractions
// These will be implemented when those features are ready
function ItineraryCard({ itinerary, onUnlike }: { itinerary: any, onUnlike?: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-travel-blue/20">
        <div className="absolute top-3 right-3 z-10">
          <LikeButton 
            itemId={itinerary.id} 
            itemType="itinerary" 
            size="sm"
            className="shadow-sm"
            onClick={(isLiked) => {
              if (!isLiked && onUnlike) onUnlike();
            }}
          />
        </div>
        {/* Placeholder image */}
        <div className="flex items-center justify-center h-full">
          <FileText className="h-16 w-16 text-travel-blue" />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">Itinerary (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">
          Itinerary details will be displayed here
        </p>
      </CardContent>
    </Card>
  )
}

function AttractionCard({ attraction, onUnlike }: { attraction: any, onUnlike?: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-travel-yellow/20">
        <div className="absolute top-3 right-3 z-10">
          <LikeButton 
            itemId={attraction.id} 
            itemType="attraction" 
            size="sm"
            className="shadow-sm"
            onClick={(isLiked) => {
              if (!isLiked && onUnlike) onUnlike();
            }}
          />
        </div>
        {/* Placeholder image */}
        <div className="flex items-center justify-center h-full">
          <MapPin className="h-16 w-16 text-travel-yellow" />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">Attraction (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">
          Attraction details will be displayed here
        </p>
      </CardContent>
    </Card>
  )
} 