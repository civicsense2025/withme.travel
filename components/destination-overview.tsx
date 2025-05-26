"use client"

import { useState } from "react"
import { ArrowLeft, Heart, Share, Plus, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExperienceCard } from "./experience-card"
import { experiences } from "../data/experiences"
import Link from "next/link"

type Destination = {
  id: string
  name: string
  country: string
  emoji: string
  heroImage: string
  description: string
  highlights: Array<{
    icon: string
    title: string
    description: string
  }>
  weather: {
    current: string
    condition: string
    humidity: string
    wind: string
    forecast: Array<{
      day: string
      high: number
      low: number
      condition: string
    }>
  }
  travelInfo: {
    bestTime: string
    language: string
    currency: string
    timezone: string
    airport: string
    metro: string
  }
  tags: string[]
}

type DestinationOverviewProps = {
  destination: Destination
}

export default function DestinationOverview({ destination }: DestinationOverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAllExperiences, setShowAllExperiences] = useState(false)

  const destinationExperiences = experiences.filter((exp) => exp.location === destination.name)
  const categories = ["All", ...Array.from(new Set(destinationExperiences.map((exp) => exp.category)))]

  const filteredExperiences = destinationExperiences.filter((exp) => {
    if (!selectedCategory || selectedCategory === "All") return true
    return exp.category === selectedCategory
  })

  const displayedExperiences = showAllExperiences ? filteredExperiences : filteredExperiences.slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              withme.
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 font-medium">
                Planner
              </Link>
              <Link href="/destinations" className="text-black font-medium relative">
                Destinations
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </Link>
              <Link href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Heart className="w-4 h-4" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/destinations" className="hover:text-gray-700 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Destinations
          </Link>
          <span>/</span>
          <span className="text-gray-900">{destination.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <img
          src={destination.heroImage || "/placeholder.svg"}
          alt={`${destination.name} cityscape`}
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">{destination.emoji}</span>
            <h1 className="text-5xl font-bold">{destination.name}</h1>
          </div>
          <p className="text-xl opacity-90">{destination.country}</p>
        </div>
        <div className="absolute top-8 right-8 flex space-x-3">
          <Button variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white rounded-xl">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Plan Your Visit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Add to Existing Trip</DropdownMenuItem>
              <DropdownMenuItem>Create New Trip</DropdownMenuItem>
              <DropdownMenuItem>Save to Wishlist</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this destination</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{destination.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl mb-2">{highlight.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{highlight.title}</h3>
                    <p className="text-xs text-gray-600">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Additional Information</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {destination.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🗓️ Profile Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrival</span>
                        <span className="font-medium">April 24, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Departure</span>
                        <span className="font-medium">May 28, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">ℹ️ Travel Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best Time</span>
                        <span className="font-medium">{destination.travelInfo.bestTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language</span>
                        <span className="font-medium">{destination.travelInfo.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency</span>
                        <span className="font-medium">{destination.travelInfo.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-sm text-blue-700">
                    <strong>Reference:</strong> data-4d8b-4f81-9f17-4ae85fce8
                  </p>
                </div>
              </div>
            </div>

            {/* Tours & Activities */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🎯 Tours & Activities</h2>
                  <p className="text-gray-600">Powered by Viator</p>
                </div>
                <Link href={`/experiences?location=${destination.name}`}>
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                    View All on Viator →
                  </Button>
                </Link>
              </div>

              <p className="text-gray-600 mb-6">
                Explore top-rated tours, activities, and experiences in {destination.name}. Book directly through our
                trusted partner Viator.
              </p>

              <div className="text-sm text-gray-500 mb-6">
                Showing {displayedExperiences.length} of {filteredExperiences.length} activities
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category === "All" ? null : category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Experiences Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedExperiences.map((experience) => (
                  <ExperienceCard key={experience.id} experience={experience} variant="compact" />
                ))}
              </div>

              {/* Load More */}
              {!showAllExperiences && filteredExperiences.length > 8 && (
                <div className="text-center mt-6">
                  <Button onClick={() => setShowAllExperiences(true)} variant="outline" className="rounded-xl px-8">
                    View Details → ({filteredExperiences.length - 8} more)
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Trip
                </Button>
                <Button variant="outline" className="w-full rounded-xl">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="w-full rounded-xl">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Thermometer className="w-5 h-5 mr-2" />
                🌤️ Weather
              </h3>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">{destination.weather.current}</div>
                <div className="text-gray-600">{destination.weather.condition}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Humidity</span>
                  <div className="font-medium">{destination.weather.humidity}</div>
                </div>
                <div>
                  <span className="text-gray-500">Wind</span>
                  <div className="font-medium">{destination.weather.wind}</div>
                </div>
              </div>

              <div className="space-y-2">
                {destination.weather.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{day.day}</span>
                    <div className="flex items-center space-x-2">
                      <span>{day.condition}</span>
                      <span className="font-medium">
                        {day.high}°/{day.low}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">✨ Highlights</h3>
              <div className="text-sm text-gray-600">
                <p>No highlights available</p>
              </div>
            </div>

            {/* Travel Information */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">ℹ️ Travel Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Airport</span>
                  <div className="font-medium">{destination.travelInfo.airport}</div>
                </div>
                <div>
                  <span className="text-gray-500">Metro</span>
                  <div className="font-medium">{destination.travelInfo.metro}</div>
                </div>
                <div>
                  <span className="text-gray-500">Timezone</span>
                  <div className="font-medium">{destination.travelInfo.timezone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
