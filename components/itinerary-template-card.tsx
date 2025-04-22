import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Users } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ItineraryTemplateCardProps {
  itinerary: {
    id: string
    title: string
    description: string
    image: string
    location: string
    duration: string
    groupSize: string
    tags: string[]
    category?: string
    slug?: string
  }
  index?: number
}

export function ItineraryTemplateCard({ itinerary, index = 0 }: ItineraryTemplateCardProps) {
  return (
    <Link href={`/itineraries/${itinerary.slug || itinerary.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-all">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={itinerary.image || "/placeholder.svg?height=400&width=800&query=travel destination"}
            alt={itinerary.title}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 lowercase">{itinerary.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{itinerary.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {itinerary.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{itinerary.location}</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{itinerary.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{itinerary.groupSize}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
