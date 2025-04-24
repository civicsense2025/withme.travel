import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Clock, Users, ArrowRight, Star, Share2 } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UseTemplateButton } from "@/components/use-template-button"
import { ItineraryShareButton } from "@/components/itinerary/itinerary-share-button"

// Force dynamic rendering for this page since it uses auth and data fetching
export const dynamic = 'force-dynamic';

// Define the structure for a single itinerary template (matching the DB query)
interface ItineraryTemplate {
  id: string
  title: string
  description: string | null
  image_url: string | null
  destination_id: string | null // Crucial for linking to create trip
  duration_days: number | null
  category: string | null
  tags: string[] | null
  days: any | null // Define more strictly if possible (e.g., Array<{ day: number; title: string; activities: any[] }>) 
  rating?: number // Assuming this might come from reviews or votes later
  reviewCount?: number // Assuming this might come from reviews or votes later
  destinations: {
    id: string;
    city: string;
    country: string;
    image_url: string | null;
  } | null // Joined data
  users: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null // Joined data
}

// Function to fetch a single itinerary template by slug
async function getItineraryBySlug(slug: string): Promise<ItineraryTemplate | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select(`
      *,
      destinations(*),
      users:created_by(id, full_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) {
    console.error(`Error fetching itinerary template by slug (${slug}):`, error)
    return null
  }
  return data
}

// Generate Metadata based on fetched data
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const itinerary = await getItineraryBySlug(params.slug)

  if (!itinerary) {
    return {
      title: "Itinerary Not Found",
      description: "Could not find the requested itinerary template.",
    }
  }

  return {
    title: `${itinerary.title} | Itinerary Template`,
    description: itinerary.description || `View the ${itinerary.duration_days}-day itinerary template for ${itinerary.destinations?.city || 'a destination'}.`,
  }
}

// The Page Component itself - now async
export default async function ItineraryPage({ params }: { params: { slug: string } }) {
  const itinerary = await getItineraryBySlug(params.slug)

  if (!itinerary) {
    notFound()
  }

  // Log the fetched itinerary data, specifically the destination_id
  // console.log("Fetched Itinerary Data:", itinerary)
  // console.log("Destination ID:", itinerary?.destination_id)

  const location = itinerary.destinations ? `${itinerary.destinations.city}, ${itinerary.destinations.country}` : "Unknown Location"
  const duration = itinerary.duration_days ? `${itinerary.duration_days} days` : "Variable duration"
  const imageUrl = itinerary.image_url || itinerary.destinations?.image_url || "/placeholder.svg"
  const authorName = itinerary.users?.full_name || "Anonymous"
  const authorAvatar = itinerary.users?.avatar_url || "/images/placeholder-avatar.png"

  return (
    <div className="container py-10">
      {/* Header Section */}
      <div className="relative mb-8 h-64 md:h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={itinerary.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 lowercase">{itinerary.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {location}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {duration}</span>
          </div>
          {/* Placeholder for potential rating */}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Itinerary Details) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="lowercase">About this Itinerary</CardTitle>
              <CardDescription>{itinerary.description || "No description provided."}</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                {itinerary.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
          
          {/* Itinerary Day Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="lowercase">Daily Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="day-1">
                <TabsList className="mb-4 flex flex-wrap h-auto justify-start">
                  {Array.isArray(itinerary.days) && itinerary.days.length > 0 ? (
                    itinerary.days.map((dayData, index) => (
                      <TabsTrigger key={`day-${dayData.day || index + 1}`} value={`day-${dayData.day || index + 1}`} className="lowercase">
                        Day {dayData.day || index + 1}
                      </TabsTrigger>
                    ))
                  ) : (
                     <TabsTrigger value="day-1" disabled>No Plan Available</TabsTrigger> 
                  )}
                </TabsList>
                
                {Array.isArray(itinerary.days) && itinerary.days.length > 0 ? (
                  itinerary.days.map((dayData, index) => (
                    <TabsContent key={`content-day-${dayData.day || index + 1}`} value={`day-${dayData.day || index + 1}`} className="space-y-4">
                      <h3 className="font-semibold text-lg">{dayData.title || `Day ${dayData.day || index + 1}`}</h3>
                      {Array.isArray(dayData.activities) && dayData.activities.length > 0 ? (
                          dayData.activities.map((activity: any, actIndex: number) => (
                            <div key={actIndex} className="flex gap-4 items-start">
                              <div className="text-xs text-muted-foreground pt-1 w-12 text-right">
                                {activity.time || "-"} 
                              </div>
                              <div className="flex-1 border-l pl-4">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                {activity.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3"/> {activity.location}</p>}
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-muted-foreground italic">No activities planned for this day.</p> 
                      )}
                    </TabsContent>
                  ))
                ) : (
                  <TabsContent value="day-1"> 
                    <p className="text-muted-foreground italic">No daily plan available for this template.</p> 
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div> 

        {/* Right Column (Use Template, Author) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-travel-blue/10 to-travel-purple/10">
            <CardHeader>
              <CardTitle className="lowercase">Use Template</CardTitle>
              <CardDescription>Start planning your trip based on this itinerary.</CardDescription>
            </CardHeader>
            <CardContent>
              <UseTemplateButton 
                templateId={itinerary.id} 
                className="w-full lowercase bg-travel-purple hover:bg-purple-400 text-purple-900"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base lowercase">Shared by</CardTitle>
                <CardDescription>{authorName}</CardDescription>
              </div>
            </CardHeader>
          </Card>
          
           <Card>
             <CardHeader>
                <CardTitle className="lowercase">Share</CardTitle>
             </CardHeader>
             <CardContent>
                 <ItineraryShareButton />
             </CardContent>
           </Card>

        </div> 
      </div> 
    </div> 
  )
}