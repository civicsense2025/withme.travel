"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import React from "react"
import {
  ArrowLeft,
  Calendar,
  Globe,
  DollarSign,
  Utensils,
  Camera,
  Moon,
  Sun,
  MapPin,
  Wifi,
  Train,
  Leaf,
  FootprintsIcon as Walking,
  Heart,
  Instagram,
  Briefcase,
  Shield,
  Accessibility,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Destination {
  id: string
  name: string
  city: string
  state_province: string | null
  country: string
  continent: string
  description: string
  best_season: string
  avg_cost_per_day: number
  local_language: string
  time_zone: string
  cuisine_rating: number
  cultural_attractions: number
  nightlife_rating: number
  family_friendly: boolean
  outdoor_activities: number
  beach_quality: number | null
  shopping_rating: number
  safety_rating: number
  wifi_connectivity: number
  public_transportation: number
  eco_friendly_options: number
  walkability: number
  instagram_worthy_spots: number
  off_peak_appeal: number
  digital_nomad_friendly: number
  lgbtq_friendliness: number
  accessibility: number
  highlights: string
  tourism_website: string
  image_url: string
}

export default function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Unwrap params promise using React.use()
  const { city: cityParam } = React.use(params)

  useEffect(() => {
    let decodedCityName = "";
    try {
       decodedCityName = decodeURIComponent(cityParam.replace(/-/g, " "));
    } catch (e) {
        console.error("Error decoding city name from params:", e);
        setError("Invalid city name in URL");
        setIsLoading(false);
        return; // Exit if decoding fails
    }

    async function fetchDestination() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/destinations/${encodeURIComponent(decodedCityName)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Destination '${decodedCityName}' not found`); 
            return
          }
          throw new Error(`Failed to fetch destination: ${response.status}`)
        }

        const data = await response.json()
        setDestination(data.destination)
      } catch (err: any) {
        console.error("Error fetching destination:", err)
        setError(err.message || "Failed to load destination details")
        toast({
          title: "Error loading destination",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDestination()
  }, [cityParam, toast])

  // Helper function to render rating stars
  const renderRating = (rating: number | null | undefined, max = 5) => {
    if (rating === null || rating === undefined) return "N/A"

    const stars = []
    for (let i = 0; i < max; i++) {
      stars.push(
        <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>,
      )
    }
    return <div className="flex">{stars}</div>
  }

  // Helper function to get the image URL
  const getDestinationImageUrl = (destination: Destination | null) => {
    if (!destination) return "/tropical-beach-getaway.png"

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
    return `/placeholder.svg?height=800&width=1200&query=${encodeURIComponent(destination.city + " " + destination.country)}`
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/destinations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              back to destinations
            </Button>
          </Link>
        </div>
        <div className="h-64 w-full rounded-lg bg-muted animate-pulse"></div>
        <div className="mt-6 h-8 w-1/3 bg-muted animate-pulse rounded"></div>
        <div className="mt-4 h-4 w-2/3 bg-muted animate-pulse rounded"></div>
        <div className="mt-2 h-4 w-1/2 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (error || !destination) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/destinations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              back to destinations
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Destination Not Found</h2>
          <p className="text-muted-foreground mt-2">We couldn't find information about {decodeURIComponent(cityParam.replace(/-/g, " "))}.</p>
          <Button className="mt-4" onClick={() => router.push("/destinations")}>
            Browse All Destinations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/destinations">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            back to destinations
          </Button>
        </Link>
      </div>

      <div className="relative h-80 w-full rounded-lg overflow-hidden mb-6">
        <Image
          src={getDestinationImageUrl(destination) || "/placeholder.svg"}
          alt={destination.name || destination.city}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white">{destination.city}</h1>
            <div className="flex items-center gap-2 text-white/90 mt-2">
              <Globe className="h-4 w-4" />
              <span>
                {destination.state_province ? `${destination.state_province}, ` : ""}
                {destination.country} • {destination.continent}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">About {destination.city}</h2>
              <p className="text-muted-foreground">{destination.description}</p>

              <Button 
                className="mt-6 w-full md:w-auto"
                onClick={() => router.push(`/trips/create?destinationId=${destination.id}`)}
              >
                Plan a trip to {destination.city}
              </Button>

              {destination.highlights && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Highlights</h3>
                  <div dangerouslySetInnerHTML={{ __html: destination.highlights }} />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {destination.family_friendly && <Badge variant="outline">Family Friendly</Badge>}
                {destination.digital_nomad_friendly >= 4 && <Badge variant="outline">Digital Nomad Friendly</Badge>}
                {destination.beach_quality !== null && destination.beach_quality >= 4 && <Badge variant="outline">Great Beaches</Badge>}
                {destination.cultural_attractions >= 4 && <Badge variant="outline">Cultural Hotspot</Badge>}
                {destination.nightlife_rating >= 4 && <Badge variant="outline">Vibrant Nightlife</Badge>}
                {destination.outdoor_activities >= 4 && <Badge variant="outline">Outdoor Activities</Badge>}
                {destination.lgbtq_friendliness >= 4 && <Badge variant="outline">LGBTQ+ Friendly</Badge>}
                {destination.accessibility >= 4 && <Badge variant="outline">Accessible</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Plan Your Trip</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Best Time to Visit
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.best_season}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Average Daily Cost
                  </h3>
                  <p className="text-sm text-muted-foreground">${destination.avg_cost_per_day} USD</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Globe className="h-4 w-4" /> Local Language
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.local_language}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Time Zone
                  </h3>
                  <p className="text-sm text-muted-foreground">{destination.time_zone}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/trips/new?destination=${encodeURIComponent(destination.city)}&placeId=${destination.id}`,
                    )
                  }
                >
                  Create a Trip to {destination.city}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">City Ratings</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Utensils className="h-4 w-4" /> Cuisine
                  </span>
                  {renderRating(destination.cuisine_rating)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Camera className="h-4 w-4" /> Cultural Attractions
                  </span>
                  {renderRating(destination.cultural_attractions)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Moon className="h-4 w-4" /> Nightlife
                  </span>
                  {renderRating(destination.nightlife_rating)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Sun className="h-4 w-4" /> Outdoor Activities
                  </span>
                  {renderRating(destination.outdoor_activities)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Safety
                  </span>
                  {renderRating(destination.safety_rating)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Train className="h-4 w-4" /> Public Transportation
                  </span>
                  {renderRating(destination.public_transportation)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Walking className="h-4 w-4" /> Walkability
                  </span>
                  {renderRating(destination.walkability)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Wifi className="h-4 w-4" /> Wi-Fi Connectivity
                  </span>
                  {renderRating(destination.wifi_connectivity)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Heart className="h-4 w-4" /> LGBTQ+ Friendliness
                  </span>
                  {renderRating(destination.lgbtq_friendliness)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Accessibility className="h-4 w-4" /> Accessibility
                  </span>
                  {renderRating(destination.accessibility)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Leaf className="h-4 w-4" /> Eco-Friendly Options
                  </span>
                  {renderRating(destination.eco_friendly_options)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Instagram className="h-4 w-4" /> Instagram-Worthy Spots
                  </span>
                  {renderRating(destination.instagram_worthy_spots)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> Digital Nomad Friendly
                  </span>
                  {renderRating(destination.digital_nomad_friendly)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" /> Family Friendly
                  </span>
                  {destination.family_friendly ? "Yes" : "No"}
                </div>
              </div>

              {destination.tourism_website && (
                <div className="mt-6">
                  <a
                    href={destination.tourism_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    Official Tourism Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Popular in {destination.city}</h2>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
              <div className="mt-4 text-center">
                <Button variant="link">View All Attractions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
