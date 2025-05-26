"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExperienceCard } from "../../components/experience-card"
import { experiences } from "../../data/experiences"
import Link from "next/link"

export default function ExperiencesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const categories = ["All", "Museums", "Day Trips", "City Tours", "Entertainment", "River Cruises"]
  const locations = ["All", ...Array.from(new Set(experiences.map((exp) => exp.location)))]

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === "All" || exp.category === selectedCategory
    const matchesLocation = !selectedLocation || selectedLocation === "All" || exp.location === selectedLocation

    return matchesSearch && matchesCategory && matchesLocation
  })

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
              <Link href="/destinations" className="text-gray-400 hover:text-gray-600 font-medium">
                Destinations
              </Link>
              <span className="text-black font-medium relative">
                Experiences
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </span>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">✨ Discover Amazing Experiences</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated activities and tours from trusted partners worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search experiences, destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={selectedLocation || "All"}
                onChange={(e) => setSelectedLocation(e.target.value === "All" ? null : e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <Button variant="outline" className="rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
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
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{filteredExperiences.length} experiences found</h2>
            <p className="text-gray-600">
              {selectedLocation && `in ${selectedLocation}`}
              {selectedCategory && ` • ${selectedCategory}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Duration</option>
            </select>
          </div>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>

        {/* Load More */}
        {filteredExperiences.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-xl px-8">
              Load More Experiences
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredExperiences.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No experiences found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory(null)
                setSelectedLocation(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
