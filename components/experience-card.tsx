import { Star, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Experience } from "../types/experience"

type ExperienceCardProps = {
  experience: Experience
  variant?: "default" | "compact"
}

export function ExperienceCard({ experience, variant = "default" }: ExperienceCardProps) {
  const isCompact = variant === "compact"

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 group">
      <div className="relative">
        <img
          src={experience.imageUrl || "/placeholder.svg"}
          alt={experience.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant={experience.availability === "available" ? "default" : "secondary"}
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            {experience.provider === "viator" && "🎯 Viator"}
            {experience.provider === "custom" && "⭐ Featured"}
            {experience.provider === "getyourguide" && "🎪 GetYourGuide"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-600 text-white">
            ${experience.price}
            {experience.originalPrice && (
              <span className="line-through text-green-200 ml-1">${experience.originalPrice}</span>
            )}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">{experience.title}</h3>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{experience.rating}</span>
            <span>({experience.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{experience.duration}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4" />
          <span>
            {experience.location}, {experience.country}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{experience.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {experience.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">View Details</Button>
      </div>
    </div>
  )
}
