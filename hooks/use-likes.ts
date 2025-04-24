import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/use-toast'

type LikeItemType = 'destination' | 'itinerary' | 'attraction'

interface Like {
  id: string
  user_id: string
  item_id: string
  item_type: LikeItemType
  created_at: string
}

export function useLikes() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [likes, setLikes] = useState<Like[]>([])
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Fetch likes when user changes
  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchLikes()
      } else {
        // Clear likes if user logs out
        setLikes([])
        setLikedItemIds(new Set())
      }
    }
  }, [user, isAuthLoading])

  // Fetch all likes for current user
  const fetchLikes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/likes', {
        credentials: 'include'
      })

      if (response.status === 401) {
        // Clear likes if unauthorized
        setLikes([])
        setLikedItemIds(new Set())
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch likes')
      }

      const data = await response.json()
      setLikes(data)
      setLikedItemIds(new Set(data.map((like: Like) => like.item_id)))
    } catch (error) {
      console.error('Error fetching likes:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch likes. Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if an item is liked
  const isLiked = (itemId: string) => {
    return likedItemIds.has(itemId)
  }

  // Toggle like status for an item
  const toggleLike = async (itemId: string, itemType: LikeItemType): Promise<boolean> => {
    if (!user) return false

    const currentlyLiked = isLiked(itemId)
    
    try {
      if (currentlyLiked) {
        // Unlike
        const response = await fetch(`/api/likes?itemId=${itemId}&itemType=${itemType}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to unlike item')
        }

        setLikes(prev => prev.filter(like => like.item_id !== itemId))
        setLikedItemIds(prev => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })

        return false
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemId,
            itemType
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to like item')
        }

        const newLike = await response.json()
        setLikes(prev => [...prev, newLike])
        setLikedItemIds(prev => new Set([...prev, itemId]))

        return true
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again later.',
        variant: 'destructive'
      })
      return currentlyLiked
    }
  }

  return {
    likes,
    isLiked,
    toggleLike,
    isLoading: isLoading || isAuthLoading
  }
} 