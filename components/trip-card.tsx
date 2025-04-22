"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { motion } from "framer-motion"
import { THEME, PAGE_ROUTES } from "@/utils/constants"
import { formatDate, formatDateRange, getColorClassFromId } from "@/lib/utils"

// Updated Trip type to match actual database schema
interface Trip {
  id: string
  name: string
  created_by: string
  destination_id?: string
  destination_name?: string
  start_date?: string
  end_date?: string
  date_flexibility?: string
  travelers_count?: number
  vibe?: string
  budget?: string
  is_public: boolean
  slug?: string
  cover_image_url?: string
  created_at: string
  updated_at?: string
  
  // Fields added by the API
  title?: string
  description?: string
  cover_image?: string
  members?: number
}

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  // Extract location from destination_name or use name as fallback
  const location = trip.destination_name || trip.name
  
  // Use title if provided by API formatting, otherwise use name
  const displayTitle = trip.title || trip.name
  
  // Use description from API or create one based on destination if available
  const displayDescription = trip.description || 
    (trip.destination_name ? `Trip to ${trip.destination_name}` : 'Your trip adventure')
  
  // Handle travelers count
  const membersCount = trip.members || trip.travelers_count || 1

  // Use the utility function to get a consistent color
  const colorClass = getColorClassFromId(trip.id)

  return (
    <Link href={PAGE_ROUTES.TRIP_DETAILS(trip.id)}>
      <motion.div
        className="rounded-3xl overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-300 max-w-xs mx-auto"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-48 w-full">
          <Image
            src={trip.cover_image || trip.cover_image_url || "/placeholder.svg?height=200&width=400&query=travel"}
            alt={displayTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-white font-bold text-xl lowercase">{displayTitle}</h3>
          </div>
        </div>

        <div className={`p-4 ${colorClass} bg-opacity-30`}>
          <p className="text-sm line-clamp-2 mb-4">{displayDescription}</p>

          <div className="space-y-2">
            {trip.start_date && trip.end_date && (
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDateRange(trip.start_date, trip.end_date)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{location}</span>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              <span>{membersCount} travelers</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
            {trip.budget && <span className="text-sm font-medium">{trip.budget}</span>}
            <span className="text-xs lowercase bg-white/30 px-2 py-1 rounded-full">view trip →</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
