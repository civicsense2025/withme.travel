"use client"

import { useState } from "react"
import { Search, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { destinations, experiences } from "../../data/experiences"
import Link from "next/link"

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getDestinationExperiences = (destinationName: string) => {
    return experiences.filter((exp) => exp.location === destinationName).slice(0, 3)
  }

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
              <span className="text-black font-medium relative">
                Destinations
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </span>
              <Link href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </Link>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🌍 Explore Destinations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover amazing places and the experiences that await you
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="space-y-8">
          {filteredDestinations.map((destination) => {
            const destExperiences = getDestinationExperiences(destination.name)

            return (
              <div key={destination.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                {/* Destination Header */}
                <div className="relative">
                  <img
                    src={destination.imageUrl || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl">{destination.emoji}</span>
                      <h2 className="text-3xl font-bold">{destination.name}</h2>
                    </div>
                    <p className="text-lg opacity-90 mb-2">{destination.country}</p>
                    <p className="text-white/80 max-w-2xl">{destination.description}</p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                      {destination.experienceCount} experiences
                    </Badge>
                  </div>
                </div>

                {/* Destination Content */}
                <div className="p-6">
                  {/* Popular Categories */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Popular Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {destination.popularCategories.map((category) => (
                        <Badge key={category} variant="outline" className="rounded-full">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Featured Experiences */}
                  {destExperiences.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Featured Experiences</h3>
                        <Link href={`/experiences?location=${destination.name}`}>
                          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                            View all <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {destExperiences.map((experience) => (
                          <div
                            key={experience.id}
                            className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <img
                              src={experience.imageUrl || "/placeholder.svg"}
                              alt={experience.title}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                                {experience.title}
                              </h4>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{experience.rating}</span>
                                </div>
                                <span className="font-semibold text-green-600">${experience.price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Link href={`/destinations/${destination.id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                        Explore {destination.name}
                      </Button>
                    </Link>
                    <Button variant="outline" className="rounded-xl">
                      Add to Trip
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-6">Try a different search term</p>
            <Button onClick={() => setSearchQuery("")} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              Show All Destinations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
