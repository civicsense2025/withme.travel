"use client"

import { useEffect, useState } from "react"
import { CityBubbles } from "./city-bubbles"
import { LocationSearch } from "@/components/location-search"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import type { AuthContextType } from "@/components/auth-provider"

export function HeroSection() {
  const [planningType, setPlanningType] = useState("group planning")
  const router = useRouter()
  const { user } = useAuth() as AuthContextType
  const planningTypes = [
    "group planning",
    "family vacations",
    "destination weddings",
    "work retreats",
    "friend getaways",
    "bachelor parties",
    "reunion trips",
    "festival groups",
  ]

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % planningTypes.length
      setPlanningType(planningTypes[currentIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleLocationSelect = (destination: any) => {
    if (destination && destination.city) {
      // Create a slug from the city name - replacing spaces with hyphens and removing special characters
      const citySlug = destination.city.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      router.push(`/destinations/${citySlug}`);
    }
  }

  const handleExploreClick = () => {
    if (user) {
      router.push('/trips')
    } else {
      router.push('/destinations')
    }
  }

  return (
    <div className="relative py-16 md:py-24 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 to-background/40" />

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-travel-blue/10 animate-pulse-soft"></div>
        <div className="absolute top-[30%] right-[10%] w-40 h-40 rounded-full bg-travel-pink/10 animate-float"></div>
        <div className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full bg-travel-yellow/10 animate-spin-slow"></div>
        <div className="absolute bottom-[10%] right-[20%] w-36 h-36 rounded-full bg-travel-purple/10 animate-pulse-soft"></div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black lowercase flex flex-col animate-fade-in-up mb-4">
        <span>say goodbye to the chaos of</span>
        <span className="min-h-[1.2em] text-travel-blue dark:text-travel-blue">{planningType}.</span>
      </h1>

      <p className="text-xl max-w-2xl mx-auto animate-fade-in-up mb-8" style={{ animationDelay: "0.1s" }}>
        plan your next adventure together, make decisions easily, and create unforgettable memories.
      </p>

      {/* Updated Search with Location Search component */}
      <div className="w-full max-w-xl animate-fade-in-up px-2 md:px-0 mb-4" style={{ animationDelay: "0.2s" }}>
        <div className="flex flex-col md:flex-row gap-3">
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            placeholder="where to? try 'barcelona' or 'tokyo'"
            className="rounded-full py-3"
            containerClassName="flex-1"
          />
          <Button 
            className="lowercase px-8 py-3 rounded-full h-auto w-full md:w-auto"
            onClick={handleExploreClick}
          >
            {user ? 'my trips' : 'explore'}
          </Button>
        </div>
      </div>

      {/* Full-width container for city bubbles with margin at top to create space */}
      <div className="w-full px-0 -mx-3 sm:-mx-6 lg:-mx-8 overflow-visible">
        <CityBubbles />
      </div>
    </div>
  )
}
