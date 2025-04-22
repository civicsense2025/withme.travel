import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { useLikes } from '@/hooks/use-likes'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { FirstLikeTour } from '@/components/first-like-tour'

type LikeItemType = 'destination' | 'itinerary' | 'attraction'

interface LikeButtonProps {
  itemId: string
  itemType: LikeItemType
  className?: string
  variant?: 'default' | 'icon' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  count?: number
  onClick?: (isLiked: boolean) => void
}

// Track if this is the first like across the app
let hasShownFirstLikeTour = false

export function LikeButton({
  itemId,
  itemType,
  className = '',
  variant = 'icon',
  size = 'md',
  showCount = false,
  count,
  onClick,
}: LikeButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { isLiked, toggleLike } = useLikes()
  const [isLikedState, setIsLikedState] = useState(isLiked(itemId))
  const [likeCount, setLikeCount] = useState(count || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [showTour, setShowTour] = useState(false)

  // Handle like toggle
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setIsLoading(true)
    try {
      const newLikedState = await toggleLike(itemId, itemType)
      setIsLikedState(newLikedState)
      
      // Update count if showing count
      if (showCount && count !== undefined) {
        setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
      }
      
      // Check if this is the first like and show the tour
      if (newLikedState && !localStorage.getItem('has-shown-first-like-tour')) {
        localStorage.setItem('has-shown-first-like-tour', 'true')
        
        // Only show if we haven't shown it already in this session
        if (!hasShownFirstLikeTour) {
          hasShownFirstLikeTour = true
          setShowTour(true)
        }
      }
      
      // Call optional onClick handler
      if (onClick) {
        onClick(newLikedState)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to get size class
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-1.5'
      case 'lg':
        return 'h-12 w-12 p-2.5'
      default:
        return 'h-10 w-10 p-2'
    }
  }

  // Helper to get heart icon size
  const getHeartSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  // Render based on variant
  return (
    <>
      {variant === 'default' ? (
        <Button
          size="sm"
          variant={isLikedState ? "default" : "outline"}
          className={cn(
            'gap-1 rounded-full lowercase',
            {
              'bg-rose-500 hover:bg-rose-600 text-white border-rose-500': isLikedState,
            },
            className
          )}
          onClick={handleToggleLike}
          disabled={isLoading}
        >
          <Heart className={cn(
            getHeartSize(),
            { 'fill-current': isLikedState }
          )} />
          {showCount && (
            <span>{likeCount}</span>
          )}
          {!showCount && (
            <span>{isLikedState ? 'Saved' : 'Save'}</span>
          )}
        </Button>
      ) : variant === 'outline' ? (
        <button
          className={cn(
            'group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
            {
              'border-rose-500 text-rose-500 hover:bg-rose-500/10': isLikedState,
              'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800': !isLikedState,
            },
            className
          )}
          onClick={handleToggleLike}
          disabled={isLoading}
        >
          <Heart className={cn(
            'h-4 w-4 transition-all',
            { 'fill-rose-500 text-rose-500': isLikedState }
          )} />
          {showCount ? (
            <span>{likeCount}</span>
          ) : (
            <span>{isLikedState ? 'Saved' : 'Save'}</span>
          )}
        </button>
      ) : (
        <button
          className={cn(
            'flex items-center justify-center rounded-full transition-colors',
            getSizeClass(),
            {
              'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800': !isLikedState,
              'bg-rose-500/90 hover:bg-rose-500 text-white': isLikedState,
            },
            className
          )}
          onClick={handleToggleLike}
          disabled={isLoading}
          aria-label={isLikedState ? "Remove from saved items" : "Save item"}
        >
          <Heart className={cn(
            getHeartSize(),
            { 
              'text-gray-600 dark:text-gray-300': !isLikedState,
              'fill-white text-white': isLikedState 
            }
          )} />
          {showCount && likeCount > 0 && (
            <span className="ml-1 text-xs font-medium">{likeCount}</span>
          )}
        </button>
      )}

      {/* First like tour */}
      {showTour && (
        <FirstLikeTour onClose={() => setShowTour(false)} />
      )}
    </>
  )
} 