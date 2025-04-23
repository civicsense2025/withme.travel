"use client"

import { SearchForm } from "@/components/search/search-form"
import { useEffect, useState } from "react"
import { CityBubbles } from "./city-bubbles"

export function HeroSection() {
  const [planningType, setPlanningType] = useState("group planning")
  const planningTypes = [
    "group planning",
    "family vacations",
    "destination weddings",
    "business retreats",
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

  return (
    <div className="relative py-28 md:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 to-background/40" />

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-travel-blue/10 animate-pulse-soft"></div>
        <div className="absolute top-[30%] right-[10%] w-40 h-40 rounded-full bg-travel-pink/10 animate-float"></div>
        <div className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full bg-travel-yellow/10 animate-spin-slow"></div>
        <div className="absolute bottom-[10%] right-[20%] w-36 h-36 rounded-full bg-travel-purple/10 animate-pulse-soft"></div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black lowercase flex flex-col animate-fade-in-up mb-6">
        <span>say goodbye to the chaos of</span>
        <span className="min-h-[1.2em] text-travel-blue dark:text-travel-blue">{planningType}.</span>
      </h1>

      <p className="mt-6 text-xl max-w-2xl mx-auto animate-fade-in-up mb-12" style={{ animationDelay: "0.1s" }}>
        plan your next adventure together, make decisions easily, and create unforgettable memories.
      </p>

      <div className="mt-16 mb-16 w-full max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <SearchForm placeholder="where to? try 'barcelona' or 'tokyo'" />
      </div>

      <div className="mt-12">
        <CityBubbles />
      </div>
    </div>
  )
}
