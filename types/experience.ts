export type Experience = {
  id: string
  title: string
  location: string
  country: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  duration: string
  category: string
  imageUrl: string
  description: string
  highlights: string[]
  provider: "viator" | "custom" | "getyourguide"
  availability: "available" | "limited" | "sold-out"
  tags: string[]
}

export type Destination = {
  id: string
  name: string
  country: string
  emoji: string
  imageUrl: string
  description: string
  experienceCount: number
  popularCategories: string[]
}
