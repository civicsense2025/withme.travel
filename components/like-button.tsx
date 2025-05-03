import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/use-auth';
import { useLikes } from '@/hooks/use-likes';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FirstLikeTour } from '@/components/first-like-tour';
import { AuthModal } from '@/components/auth-modal';

type LikeItemType = 'destination' | 'itinerary' | 'attraction';

interface LikeButtonProps {
  itemId: string;
  itemType: LikeItemType;
  className?: string;
  variant?: 'default' | 'icon' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  onClick?: (isLiked: boolean) => void;
}

// Track if this is the first like across the app
let hasShownFirstLikeTour = false;

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
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikes();
  const [isLikedState, setIsLikedState] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState(count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize the liked state when the component mounts or itemId changes
  useEffect(() => {
    if (isLiked) {
      setIsLikedState(isLiked(itemId));
    }
  }, [itemId, isLiked]);

  // Handle like toggle
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const newLikedState = await toggleLike(itemId, itemType);
      setIsLikedState(newLikedState);

      // Update count if showing count
      if (showCount && count !== undefined) {
        setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
      }

      // Check if this is the first like and show the tour
      if (newLikedState && !localStorage.getItem('has-shown-first-like-tour')) {
        localStorage.setItem('has-shown-first-like-tour', 'true');

        // Only show if we haven't shown it already in this session
        if (!hasShownFirstLikeTour) {
          hasShownFirstLikeTour = true;
          setShowTour(true);
        }
      }

      // Call optional onClick handler
      if (onClick) {
        onClick(newLikedState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get size class
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-1.5';
      case 'lg':
        return 'h-12 w-12 p-2.5';
      default:
        return 'h-10 w-10 p-2';
    }
  };

  // Helper to get heart icon size
  const getHeartSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  // Render based on variant
  return (
    <>
      <Button
        variant={variant === 'icon' ? 'ghost' : variant}
        size={variant === 'icon' ? 'icon' : 'default'}
        className={cn(
          variant === 'icon' && getSizeClass(),
          'group relative',
          'bg-white dark:bg-gray-950',
          'hover:bg-gray-100 dark:hover:bg-gray-900',
          'border border-gray-200 dark:border-gray-800',
          'shadow-sm',
          className
        )}
        onClick={handleToggleLike}
        disabled={isLoading}
      >
        {variant === 'icon' ? (
          <Heart
            className={cn(
              getHeartSize(),
              'transition-all duration-300',
              isLikedState
                ? 'fill-red-500 text-red-500'
                : 'text-gray-500 dark:text-gray-400 group-hover:scale-110 group-hover:text-red-500'
            )}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isLikedState
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
              )}
            />
            <span className="text-gray-700 dark:text-gray-200">
              {isLikedState ? 'Liked' : 'Like'}
            </span>
            {showCount && <span className="text-gray-500 dark:text-gray-400">({likeCount})</span>}
          </div>
        )}
      </Button>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* First like tour */}
      {showTour && <FirstLikeTour onClose={() => setShowTour(false)} />}
    </>
  );
}
