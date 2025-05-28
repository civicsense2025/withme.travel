"use client"

import { useState } from "react"
import { ArrowLeft, Share, Heart, Plus, Clock, DollarSign, Users, Star, Vote, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { itineraryTemplates, userTrips } from "../../../data/itinerary-templates"
import { DestinationOverview } from "../../../components/destination-overview"
import type { ItineraryTemplateItem } from "../../../types/itinerary-templates"
import Link from "next/link"
import DestinationDetails from "../../destination-details"

type TemplateDetailPageProps = {
  params: { id: string }
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = params
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [showAddToTripDialog, setShowAddToTripDialog] = useState(false)
  const [showCreateTripDialog, setShowCreateTripDialog] = useState(false)
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set())

  const template = itineraryTemplates.find((t) => t.id === id)

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template not found</h1>
          <Link href="/templates">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">← Back to Templates</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleVote = (itemId: string) => {
    setVotedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleAddToTrip = () => {
    if (selectedTrip && selectedItems.length > 0) {
      // Logic to add selected items to trip
      console.log(`Adding ${selectedItems.length} items to trip ${selectedTrip}`)
      setShowAddToTripDialog(false)
      setSelectedItems([])
      setSelectedTrip(null)
    }
  }

  const destinationData = {
    id: template.destination.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: template.destination.split(",")[0],
    country: template.destination.split(",").slice(1).join(",").trim(),
    emoji: template.emoji,
    imageUrl: template.imageUrl,
    description: template.description,
  }

  const groupedItems = template.items.reduce(
    (groups, item) => {
      const day = item.day
      if (!groups[day]) groups[day] = []
      groups[day].push(item)
      return groups
    },
    {} as Record<number, ItineraryTemplateItem[]>,
  )

  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700",
    challenging: "bg-red-100 text-red-700",
  }

  const budgetIcons = {
    budget: "💰",
    "mid-range": "💰💰",
    luxury: "💰💰💰",
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
              <Link href="/destinations" className="text-gray-400 hover:text-gray-600 font-medium">
                Destinations
              </Link>
              <Link href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </Link>
              <Link href="/templates" className="text-black font-medium relative">
                Templates
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </Link>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/templates" className="hover:text-gray-700 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Templates
          </Link>
          <span>/</span>
          <span className="text-gray-900">{template.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Header */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{template.emoji}</span>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                      <p className="text-gray-600">{template.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <Badge className={difficultyColors[template.difficulty]}>{template.difficulty}</Badge>
                    {template.featured && <Badge className="bg-purple-600 text-white">⭐ Featured</Badge>}
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                      {template.rating} ({template.reviewCount} reviews)
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">{template.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" className="rounded-xl">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">{template.duration} days</p>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">${template.totalCost}</p>
                  <p className="text-xs text-gray-600">Total Cost</p>
                </div>
                <div className="text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">2-4 people</p>
                  <p className="text-xs text-gray-600">Group Size</p>
                </div>
                <div className="text-center">
                  <span className="text-lg mb-1 block">{budgetIcons[template.budget]}</span>
                  <p className="text-sm font-medium text-gray-900 capitalize">{template.budget}</p>
                  <p className="text-xs text-gray-600">Budget</p>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📅 Day-by-Day Itinerary</h2>
                <div className="flex gap-2">
                  <Dialog open={showAddToTripDialog} onOpenChange={setShowAddToTripDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Selected to Trip
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add to Existing Trip</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Select a trip to add {selectedItems.length} selected item
                          {selectedItems.length !== 1 ? "s" : ""}:
                        </p>
                        <div className="space-y-2">
                          {userTrips.map((trip) => (
                            <Card
                              key={trip.id}
                              className={`cursor-pointer transition-colors ${
                                selectedTrip === trip.id ? "ring-2 ring-blue-500" : ""
                              }`}
                              onClick={() => setSelectedTrip(trip.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{trip.emoji}</span>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{trip.name}</h3>
                                    <p className="text-sm text-gray-600">{trip.destination}</p>
                                    <p className="text-xs text-gray-500">{trip.itemCount} items</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => setShowAddToTripDialog(false)}
                            variant="outline"
                            className="flex-1 rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddToTrip}
                            disabled={!selectedTrip || selectedItems.length === 0}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                          >
                            Add Items
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showCreateTripDialog} onOpenChange={setShowCreateTripDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create New Trip
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Trip from Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          This will create a new trip with all items from "{template.name}".
                        </p>
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <h3 className="font-medium text-blue-900">{template.name}</h3>
                          <p className="text-sm text-blue-700">{template.destination}</p>
                          <p className="text-sm text-blue-700">
                            {template.items.length} activities • {template.duration} days • ${template.totalCost}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => setShowCreateTripDialog(false)}
                            variant="outline"
                            className="flex-1 rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              console.log(`Creating new trip from template: ${template.id}`)
                              setShowCreateTripDialog(false)
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                          >
                            Create Trip
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedItems).map(([day, items]) => (
                  <div key={day} className="border-l-4 border-blue-200 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3 -ml-10">
                        {day}
                      </span>
                      Day {day}
                    </h3>

                    <div className="space-y-4">
                      {items.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow border border-gray-100">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <Checkbox
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => handleSelectItem(item.id)}
                                />

                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl || "/placeholder.svg"}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {item.category}
                                    </Badge>
                                  </div>

                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {item.time && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {item.time}
                                      </span>
                                    )}
                                    <span>{item.duration}</span>
                                    {item.cost && (
                                      <span className="flex items-center">
                                        <DollarSign className="w-3 h-3 mr-1" />${item.cost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  {item.rating}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVote(item.id)}
                                  className={`h-8 ${votedItems.has(item.id) ? "text-blue-600" : "text-gray-400"}`}
                                >
                                  <Vote className="w-4 h-4 mr-1" />
                                  {item.votes + (votedItems.has(item.id) ? 1 : 0)}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Overview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌍 About {destinationData.name}</h2>
              <DestinationOverview destination={destinationData} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="space-y-3">
                <Dialog open={showCreateTripDialog} onOpenChange={setShowCreateTripDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <Calendar className="w-4 h-4 mr-2" />
                      Create New Trip
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Dialog open={showAddToTripDialog} onOpenChange={setShowAddToTripDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Existing Trip
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button variant="outline" className="w-full rounded-xl">
                  <Share className="w-4 h-4 mr-2" />
                  Share Template
                </Button>
              </div>
            </div>

            {/* Template Stats */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">📊 Template Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Activities</span>
                  <span className="font-medium">{template.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                    {template.rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-medium">{template.items.reduce((sum, item) => sum + item.votes, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-medium">${template.totalCost}</span>
                </div>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedItems.length > 0 && (
              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4">✅ Selected Items</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Items Selected</span>
                    <span className="font-medium text-blue-900">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Estimated Cost</span>
                    <span className="font-medium text-blue-900">
                      $
                      {template.items
                        .filter((item) => selectedItems.includes(item.id))
                        .reduce((sum, item) => sum + (item.cost || 0), 0)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddToTripDialog(true)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Add Selected to Trip
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
