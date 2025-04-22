"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"

// SVG texture overlay for gradients
const TextureOverlay = () => (
  <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
)

// Heart animation component
const HeartButton = () => {
  const [liked, setLiked] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        className="relative z-10"
        onClick={() => setLiked(!liked)}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`h-8 w-8 transition-colors duration-300 ${
            liked ? "fill-rose-500 text-rose-500" : "text-gray-400"
          }`}
        />
      </button>
      <AnimatePresence>
        {liked && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.35, type: "spring" }}
          >
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500 opacity-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DestinationCardProps {
  destination: {
    id: string
    city: string
    country: string
    image_url?: string | null
    description?: string | null
    slug?: string
  }
  href?: string
}

export function DestinationCard({ destination, href }: DestinationCardProps) {
  const { city, country, image_url, description, slug } = destination
  
  // Fallback for href if not provided
  const cardHref = href || `/destinations/${slug || city.toLowerCase().replace(/\s+/g, "-")}`
  
  // Fallback for image if not available
  const imageUrl = image_url || `/placeholder.svg?height=600&width=400&query=${encodeURIComponent(city)}`

  return (
    <Link href={cardHref}>
      <Card className="bg-transparent border-0 overflow-hidden rounded-xl h-full">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
          
          {/* Texture overlay for depth */}
          <TextureOverlay />
          
          {/* Destination info */}
          <div className="absolute bottom-6 left-6 z-20">
            <h3 className="text-2xl font-bold mb-1 text-white">{city}</h3>
            <p className="text-white/80 text-sm">{country}</p>
          </div>
          
          {/* Heart button */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton />
          </div>
          
          {/* Image with hover effect */}
          <div className="relative h-full w-full">
            <Image 
              src={imageUrl}
              alt={`${city}, ${country}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </Card>
    </Link>
  )
} 