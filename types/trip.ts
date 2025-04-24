import { User } from './user'
import { Destination } from './destination'

export interface Trip {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  start_date: string | null
  end_date: string | null
  created_by: string | null
  user?: User
  default_currency: string | null
  status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  is_public: boolean
  destination_id: string | null
  budget: {
    total: number
    currency: string
    categories: {
      accommodation: number
      transportation: number
      activities: number
      food: number
      shopping: number
      other: number
    }
  } | null
  notes: string | null
  tags: string[]
  collaborators?: User[]
  likes_count: number
  comments_count: number
  shared_url?: string
  public_slug?: string | null
  splitwise_group_id?: number | null
} 