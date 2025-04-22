import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'

type LikeItemType = 'destination' | 'itinerary' | 'attraction'

interface LikeItem {
  id: string
  item_id: string
  item_type: LikeItemType
  user_id: string
  created_at: string
}

interface UseLikesOptions {
  type?: LikeItemType
  initiallyLikedItemIds?: string[]
}

export function useLikes(options: UseLikesOptions = {}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [likes, setLikes] = useState<LikeItem[]>([])
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(
    new Set(options.initiallyLikedItemIds || [])
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch likes for the current user
  const fetchLikes = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Build query URL
      let url = '/api/likes'
      if (options.type) {
        url += `?type=${options.type}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch likes')
      }
      
      const data = await response.json()
      setLikes(data.likes || [])
      
      // Update the set of liked item IDs
      const newLikedIds = new Set<string>()
      data.likes.forEach((like: LikeItem) => {
        newLikedIds.add(like.item_id)
      })
      setLikedItemIds(newLikedIds)
    } catch (err: any) {
      console.error('Error fetching likes:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [user, options.type])

  // Check if an item is liked
  const isLiked = useCallback((itemId: string) => {
    return likedItemIds.has(itemId)
  }, [likedItemIds])

  // Toggle like status for an item
  const toggleLike = useCallback(async (itemId: string, itemType: LikeItemType) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to save items',
        variant: 'destructive',
      })
      return false
    }
    
    try {
      if (isLiked(itemId)) {
        // Unlike
        const response = await fetch(`/api/likes?item_id=${itemId}&item_type=${itemType}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to unlike item')
        }
        
        // Update local state
        setLikedItemIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
        
        setLikes(prev => prev.filter(like => like.item_id !== itemId))
        
        return false // Return new like status (false = unliked)
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId,
            item_type: itemType,
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to like item')
        }
        
        const data = await response.json()
        
        // Update local state
        setLikedItemIds(prev => {
          const newSet = new Set(prev)
          newSet.add(itemId)
          return newSet
        })
        
        setLikes(prev => [...prev, data.like])
        
        return true // Return new like status (true = liked)
      }
    } catch (err: any) {
      console.error('Error toggling like:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update like status',
        variant: 'destructive',
      })
      return isLiked(itemId) // Return original status
    }
  }, [user, isLiked, toast])

  // Fetch likes on initial load
  useEffect(() => {
    if (user) {
      fetchLikes()
    } else {
      // Clear likes when user logs out
      setLikes([])
      setLikedItemIds(new Set())
    }
  }, [user, fetchLikes])

  return {
    likes,
    isLiked,
    toggleLike,
    isLoading,
    error,
    refetch: fetchLikes,
  }
} 