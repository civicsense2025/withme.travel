"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { motion } from "framer-motion"
import type { Trip } from "@/lib/db"

interface TripCardProps {
  trip: Trip & {
    members: number
  }
}

export function TripCard({ trip }: TripCardProps) {
  // Extract location from description or use placeholder
  const locations = trip.description?.match(/in ([^,]+)/)
    ? [trip.description.match(/in ([^,]+)/)?.[1] || ""]
    : ["Unknown location"]

  // Determine which color to use based on the trip ID
  const colorClasses = [
    "bg-travel-blue text-blue-900",
    "bg-travel-pink text-pink-900",
    "bg-travel-yellow text-amber-900",
    "bg-travel-purple text-purple-900",
    "bg-travel-mint text-emerald-900",
    "bg-travel-peach text-orange-900",
  ]

  const colorIndex = trip.id
    ? Math.abs(trip.id.charCodeAt(0) + trip.id.charCodeAt(trip.id.length - 1)) % colorClasses.length
    : 0
  const colorClass = colorClasses[colorIndex]

  return (
    <Link href={`/trips/${trip.id}`}>
      <motion.div
        className="rounded-3xl overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-300 max-w-xs mx-auto"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-48 w-full">
          <Image
            src={trip.cover_image || "/placeholder.svg?height=200&width=400&query=travel"}
            alt={trip.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-white font-bold text-xl lowercase">{trip.title}</h3>
          </div>
        </div>

        <div className={`p-4 ${colorClass} bg-opacity-30`}>
          <p className="text-sm line-clamp-2 mb-4">{trip.description}</p>

          <div className="space-y-2">
            {trip.start_date && trip.end_date && (
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{locations.join(", ")}</span>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              <span>{trip.members} travelers</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
            {trip.total_budget && <span className="text-sm font-medium">${trip.total_budget.toLocaleString()}</span>}
            <span className="text-xs lowercase bg-white/30 px-2 py-1 rounded-full">view trip →</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
