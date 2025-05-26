"use client"

import { useState } from "react"
import { Star, Heart, Share, MapPin, Calendar, ArrowRight, Clock, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sampleDestinations } from "../../data/sample-destinations"
import Link from "next/link"

export default function DestinationCardGallery() {
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set())

  const toggleLike = (cardId: string) => {
    const newLiked = new Set(likedCards)
    if (newLiked.has(cardId)) {
      newLiked.delete(cardId)
    } else {
      newLiked.add(cardId)
    }
    setLikedCards(newLiked)
  }

  const destination = sampleDestinations[0] // Using Paris as example

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
                Gallery
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </span>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 Destination Card Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore 10 different card layouts for showcasing destinations
          </p>
        </div>

        <div className="space-y-16">
          {/* Layout 1: Minimal Text-Only */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Minimal Text-Only</h2>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{destination.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{destination.name}</h3>
                    <p className="text-gray-600">{destination.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="rounded-full">
                    {destination.experienceCount} experiences
                  </Badge>
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">Explore</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 2: Hero Image with Overlay */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hero Image with Overlay</h2>
            <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src={destination.imageUrl || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">{destination.emoji}</span>
                  <h3 className="text-3xl font-bold">{destination.name}</h3>
                </div>
                <p className="text-lg opacity-90">{destination.country}</p>
              </div>
              <div className="absolute top-6 right-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30 rounded-full h-10 w-10 p-0"
                  onClick={() => toggleLike("hero")}
                >
                  <Heart className={`w-4 h-4 ${likedCards.has("hero") ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Layout 3: Two-Column with Thumbnails */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Two-Column with Thumbnails</h2>
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-2">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{destination.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <p className="text-gray-600">{destination.country}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{destination.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">View Details</Button>
                </div>
                <div className="grid grid-cols-2 gap-1 p-1">
                  <img
                    src={destination.imageUrl || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {destination.thumbnails.slice(0, 3).map((thumb, index) => (
                    <img
                      key={index}
                      src={thumb || "/placeholder.svg"}
                      alt={`${destination.name} ${index + 1}`}
                      className="w-full h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Layout 4: Compact Card with Stats */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compact Card with Stats</h2>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow max-w-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{destination.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{destination.name}</h3>
                    <p className="text-sm text-gray-600">{destination.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{destination.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{destination.experienceCount}</div>
                  <div className="text-xs text-gray-600">Experiences</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{destination.weather}</div>
                  <div className="text-xs text-gray-600">Weather</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{destination.price}</div>
                  <div className="text-xs text-gray-600">From</div>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">Explore {destination.name}</Button>
            </div>
          </div>

          {/* Layout 5: Instagram-Style Square */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Instagram-Style Square</h2>
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow max-w-sm">
              <div className="relative">
                <img
                  src={destination.imageUrl || "/placeholder.svg"}
                  alt={destination.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/20 text-white hover:bg-black/30 rounded-full h-8 w-8 p-0"
                    onClick={() => toggleLike("instagram")}
                  >
                    <Heart className={`w-4 h-4 ${likedCards.has("instagram") ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/20 text-white hover:bg-black/30 rounded-full h-8 w-8 p-0"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{destination.emoji}</span>
                    <h3 className="font-bold text-gray-900">{destination.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{destination.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{destination.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{destination.experienceCount} experiences</span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 6: Horizontal Card */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Horizontal Card</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex">
                <img
                  src={destination.imageUrl || "/placeholder.svg"}
                  alt={destination.name}
                  className="w-48 h-32 object-cover"
                />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{destination.emoji}</span>
                        <h3 className="text-lg font-bold text-gray-900">{destination.name}</h3>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {destination.country}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{destination.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{destination.experienceCount} experiences</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Thermometer className="w-4 h-4" />
                          <span>{destination.weather}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{destination.rating}</span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 7: Glassmorphism Style */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Glassmorphism Style</h2>
            <div className="relative max-w-md">
              <img
                src={destination.imageUrl || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-80 object-cover rounded-3xl"
              />
              <div className="absolute inset-x-4 bottom-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{destination.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                      <p className="text-white/80">{destination.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">{destination.rating}</span>
                    </div>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl">
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 8: Detailed Info Card */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Detailed Info Card</h2>
            <div className="bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow max-w-lg">
              <img
                src={destination.imageUrl || "/placeholder.svg"}
                alt={destination.name}
                className="w-full h-48 object-cover rounded-t-3xl"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{destination.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <p className="text-gray-600">{destination.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm">{destination.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Best: {destination.bestTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{destination.weather}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{destination.experienceCount} experiences</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">From {destination.price}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">Plan Trip</Button>
                  <Button variant="outline" className="rounded-xl">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout 9: Minimalist Border */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Minimalist Border</h2>
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-300 transition-colors max-w-md">
              <div className="text-center">
                <span className="text-5xl mb-4 block">{destination.emoji}</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                <p className="text-gray-600 mb-4">{destination.country}</p>
                <div className="flex items-center justify-center space-x-1 mb-6">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-lg">{destination.rating}</span>
                  <span className="text-gray-500">({destination.experienceCount} experiences)</span>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8">Discover</Button>
              </div>
            </div>
          </div>

          {/* Layout 10: Grid Thumbnail Gallery */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Grid Thumbnail Gallery</h2>
            <div className="bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{destination.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                      <p className="text-gray-600">{destination.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <img
                    src={destination.imageUrl || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-20 object-cover rounded-lg col-span-2 row-span-2"
                  />
                  {destination.thumbnails.map((thumb, index) => (
                    <img
                      key={index}
                      src={thumb || "/placeholder.svg"}
                      alt={`${destination.name} ${index + 1}`}
                      className="w-full h-10 object-cover rounded-lg"
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-600 mb-4">{destination.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{destination.experienceCount} experiences</span>
                    <span>From {destination.price}</span>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                    View All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
