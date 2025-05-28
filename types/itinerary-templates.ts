export type ItineraryTemplateItem = {
  id: string
  day: number
  time?: string
  title: string
  description: string
  location: string
  duration: string
  cost?: number
  type: "activity" | "meal" | "transport" | "accommodation" | "experience"
  category: string
  difficulty?: "easy" | "moderate" | "challenging"
  rating: number
  votes: number
  hasVoted?: boolean
  imageUrl?: string
  bookingUrl?: string
}

export type ItineraryTemplate = {
  id: string
  name: string
  destination: string
  emoji: string
  description: string
  duration: number
  difficulty: "easy" | "moderate" | "challenging"
  budget: "budget" | "mid-range" | "luxury"
  tags: string[]
  rating: number
  reviewCount: number
  items: ItineraryTemplateItem[]
  createdBy: string
  createdAt: string
  featured: boolean
  imageUrl: string
  totalCost: number
}

export type UserTrip = {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  emoji: string
  itemCount: number
}
