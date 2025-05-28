"use client"

import { useState } from "react"
import { Search, Filter, Grid, List, Star, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ItineraryTemplateCard } from "../../components/itinerary-template-card"
import { itineraryTemplates } from "../../data/itinerary-templates"
import Link from "next/link"

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  const featuredTemplates = itineraryTemplates.filter((t) => t.featured)
  const allTemplates = itineraryTemplates

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter =
      !selectedFilter ||
      template.difficulty === selectedFilter ||
      template.budget === selectedFilter ||
      template.tags.includes(selectedFilter)

    return matchesSearch && matchesFilter
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "duration":
        return a.duration - b.duration
      case "cost":
        return a.totalCost - b.totalCost
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  const filterOptions = [
    { label: "All Templates", value: null },
    { label: "Easy", value: "easy" },
    { label: "Moderate", value: "moderate" },
    { label: "Challenging", value: "challenging" },
    { label: "Budget", value: "budget" },
    { label: "Mid-range", value: "mid-range" },
    { label: "Luxury", value: "luxury" },
    { label: "Romantic", value: "Romantic" },
    { label: "Culture", value: "Culture" },
    { label: "Adventure", value: "Adventure" },
    { label: "Food & Wine", value: "Food & Wine" },
  ]

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
              <Link href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </Link>
              <span className="text-black font-medium relative">
                Templates
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">✨ Itinerary Templates</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Expertly crafted itineraries to kickstart your next adventure. Browse, customize, and add to your trips with
            just a few clicks.
          </p>
        </div>

        {/* Featured Templates */}
        {featuredTemplates.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🌟 Featured Templates</h2>
              <Badge className="bg-purple-100 text-purple-700">Curated by experts</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map((template) => (
                <ItineraryTemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search destinations, activities, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedFilter || "All Templates"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.label}
                      onClick={() => setSelectedFilter(option.value)}
                      className={selectedFilter === option.value ? "bg-blue-50" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    Sort by:{" "}
                    {sortBy === "featured"
                      ? "Featured"
                      : sortBy === "rating"
                        ? "Rating"
                        : sortBy === "duration"
                          ? "Duration"
                          : "Cost"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuItem onClick={() => setSortBy("featured")}>
                    <Star className="w-4 h-4 mr-2" />
                    Featured
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>
                    <Star className="w-4 h-4 mr-2" />
                    Rating
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("duration")}>
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("cost")}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Templates</h2>
          <p className="text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Templates Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTemplates.map((template) => (
              <ItineraryTemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTemplates.map((template) => (
              <ItineraryTemplateCard key={template.id} template={template} variant="list" />
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedFilter(null)
              }}
              variant="outline"
              className="rounded-xl"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
