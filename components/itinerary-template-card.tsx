"use client"

import { useState } from "react"
import { Star, Clock, MapPin, Eye, Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ItineraryTemplate } from "../types/itinerary-templates"
import Link from "next/link"

type ItineraryTemplateCardProps = {
  template: ItineraryTemplate
  variant?: "grid" | "list"
}

export function ItineraryTemplateCard({ template, variant = "grid" }: ItineraryTemplateCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const visibleItems = template.items.slice(0, 3)
  const remainingCount = template.items.length - 3

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

  if (variant === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100">
        <div className="flex">
          <div className="relative w-48 h-32">
            <img
              src={template.imageUrl || "/placeholder.svg"}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge className={difficultyColors[template.difficulty]}>{template.difficulty}</Badge>
            </div>
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {template.destination}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {template.duration} days
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                {template.rating} ({template.reviewCount})
              </span>
              <span>{budgetIcons[template.budget]}</span>
            </div>

            <div className="flex gap-2 mb-3">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">${template.totalCost}</span>
              <div className="flex gap-2">
                <Link href={`/templates/${template.id}`}>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </Link>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 group">
      <div className="relative">
        <img
          src={template.imageUrl || "/placeholder.svg"}
          alt={template.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 left-3">
          <Badge className={difficultyColors[template.difficulty]}>{template.difficulty}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>
        </div>
        {template.featured && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-purple-600 text-white">⭐ Featured</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="text-lg mr-1">{template.emoji}</span>
              {template.destination}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {template.duration} days
          </span>
          <span className="flex items-center">
            <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
            {template.rating}
          </span>
          <span>{budgetIcons[template.budget]}</span>
        </div>

        {/* Preview Items */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-900">Preview:</h4>
          {visibleItems.map((item, index) => (
            <div key={item.id} className="flex items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
              <span className="w-8 h-5 bg-blue-100 text-blue-700 rounded text-center text-xs font-medium mr-2">
                D{item.day}
              </span>
              <span className="flex-1 truncate">{item.title}</span>
              {item.cost && <span className="text-gray-500">${item.cost}</span>}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-xs text-gray-500 text-center py-2 bg-gradient-to-t from-white via-gray-50/50 to-transparent">
              ... and {remainingCount} other ideas
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900">${template.totalCost}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <Link href={`/templates/${template.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-xl">
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </Link>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
            <Plus className="w-3 h-3 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
