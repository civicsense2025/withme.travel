export type TripStatus = "planning" | "upcoming" | "active" | "completed"

export type Trip = {
  id: string
  name: string
  emoji: string
  description: string
  destination: string
  startDate: string
  endDate: string
  duration: number
  travelers: number
  budget: number
  spent: number
  status: TripStatus
  privacy: "private" | "members-only" | "unlisted" | "public"
  createdBy: string
  createdAt: string
}

export type TripMember = {
  id: string
  email: string
  name: string
  avatar?: string
  role: "admin" | "editor" | "contributor" | "viewer"
  joinedAt: string
  lastSeen: string
  isOnline: boolean
}

export type TripTask = {
  id: string
  title: string
  completed: boolean
  assignedTo?: string
  dueDate?: string
  category: string
}

export type TripExpense = {
  id: string
  title: string
  amount: number
  category: string
  paidBy: string
  splitBetween: string[]
  date: string
  receipt?: string
}

export type ItineraryItem = {
  id: string
  day: number
  time?: string
  title: string
  description?: string
  location?: string
  duration?: string
  cost?: number
  type: "activity" | "meal" | "transport" | "accommodation" | "other"
}
