"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Destination {
  id: string
  city: string
  country: string
  continent: string
  image_url: string | null
  travelers_count: number
  avg_days: number
}

interface DestinationsResponse {
  destinations: Destination[]
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<DestinationsResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}

export function TrendingDestinations() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Using SWR for data fetching with stale-while-revalidate strategy
  const { data, error, isValidating } = useSWR<DestinationsResponse>(
    '/api/destinations?trending=true&limit=6',
    fetcher,
    {
      revalidateOnFocus: false,  // Don't revalidate when window gets focus
      revalidateIfStale: true,   // Revalidate if data is stale
      dedupingInterval: 60000,   // Dedupe requests within 1 minute
      errorRetryCount: 3,        // Retry 3 times on failure
    }
  )
  
  const destinations = data?.destinations || []
  const isLoading = !data && !error

  // Show error toast only once when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading trending destinations",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Helper function to get the image URL
  const getDestinationImageUrl = (destination: Destination) => {
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
    return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(destination.city + " " + destination.country)}`
  }

  // Determine color class based on destination ID
  const getColorClass = (id: string | null | undefined) => {
    const colorClasses = [
      "bg-travel-blue text-blue-900",
      "bg-travel-pink text-pink-900",
      "bg-travel-yellow text-amber-900",
      "bg-travel-purple text-purple-900",
      "bg-travel-mint text-emerald-900",
      "bg-travel-peach text-orange-900",
    ]

    // If id is undefined or null, return a default color
    if (!id) {
      return colorClasses[0] // Default to first color
    }

    const colorIndex = Math.abs(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % colorClasses.length
    return colorClasses[colorIndex]
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold lowercase">trending destinations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-3xl overflow-hidden h-64 bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // If no destinations after loading, show empty state
  if (destinations.length === 0 && !isLoading) {
    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold lowercase">trending destinations</h2>
        </div>
        <div className="text-center py-10">
          <p className="text-muted-foreground">No trending destinations found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold lowercase">trending destinations</h2>
        <Button
          variant="ghost"
          onClick={() => router.push("/destinations")}
          className="lowercase rounded-full hover:bg-travel-purple hover:bg-opacity-20"
        >
          view all <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination: Destination, index: number) => {
          const colorClass = getColorClass(destination.id)

          return (
            <Link
              key={destination.id ? `destination-${destination.id}` : `destination-index-${index}`}
              href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, "-")}`}
              className="block"
            >
              <motion.div
                className="rounded-3xl overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-300 max-w-xs mx-auto"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={getDestinationImageUrl(destination) || "/placeholder.svg"}
                    alt={destination.city}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-bold text-xl lowercase">{destination.city}</h3>
                    <p className="text-white/80 text-sm">{destination.country}</p>
                  </div>
                </div>

                <div className={`p-4 ${colorClass} bg-opacity-30`}>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="px-2 py-1 rounded-full bg-white/30">
                      {(destination.travelers_count ?? 0).toLocaleString()} travelers
                    </Badge>
                    <span className="text-sm">Avg. {destination.avg_days ?? '-'} days</span>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="text-xs lowercase bg-white/30 px-2 py-1 rounded-full">explore →</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
      
      {/* Show subtle loading indicator while revalidating */}
      {isValidating && !isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-10 bg-travel-purple/50 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}
