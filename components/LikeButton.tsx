'use client';

import { useLikes } from '@/hooks/use-likes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion';

// Expand ItemType to include 'attraction' and any other types used in the codebase
export type ItemType =
  | 'destination'
  | 'itinerary'
  | 'trip'
  | 'template'
  | 'attraction'
  | 'place'
  | 'guide'
  | 'collection';

interface LikeButtonProps {
  itemId: string;
  itemType: ItemType;
  initialLiked?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
  glass?: boolean;
  onLikeChange?: (isLiked: boolean) => void;
  // Add backward compatibility props
  showCount?: boolean;
  count?: number;
  onClick?: (isLiked: boolean) => void; // Alias for onLikeChange for backward compatibility
}

export function LikeButton({
  itemId,
  itemType,
  initialLiked = false,
  variant = 'ghost',
  size = 'sm',
  iconOnly = false,
  glass = false,
  className,
  onLikeChange,
  showCount = false,
  count = 0,
  onClick,
}: LikeButtonProps) {
  const { isLiked, isLoading, error, toggleLike, isAuthenticated } = useLikes({
    itemId,
    itemType,
    initialLiked,
  });

  const { toast } = useToast();

  // Handle click with authentication check
  const handleClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save items to your collection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await toggleLike();

      // Support both callback methods for backward compatibility
      if (onLikeChange) {
        onLikeChange(!isLiked);
      }
      if (onClick) {
        onClick(!isLiked);
      }

      // Show success toast
      toast({
        title: isLiked ? 'Removed from saved items' : 'Saved to your collection',
        variant: 'default',
      });
    } catch (err) {
      // Error is handled in the hook, but we can show a toast here too
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // If glass effect is enabled, add appropriate classes
  const glassClasses = glass ? 'backdrop-blur-sm bg-white/10 dark:bg-black/10' : '';

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : 'default'}
      disabled={isLoading}
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from saved items' : 'Save to collection'}
      aria-pressed={isLiked}
      className={cn(
        'group transition-all duration-300',
        iconOnly && sizeClasses[size],
        glassClasses,
        className
      )}
    >
      <motion.div
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="flex items-center"
      >
        {isLiked ? (
          <>
            <BookmarkCheck
              className={cn(
                iconSizes[size],
                'fill-travel-purple text-travel-purple group-hover:text-travel-purple/80 transition-colors duration-300',
                !iconOnly && 'mr-2'
              )}
            />
            {!iconOnly && (
              <span className="whitespace-nowrap font-medium text-travel-purple group-hover:text-travel-purple/80 transition-colors duration-300">
                Saved {showCount && count > 0 && `(${count})`}
              </span>
            )}
          </>
        ) : (
          <>
            <Bookmark
              className={cn(
                iconSizes[size],
                'group-hover:fill-travel-purple/50 group-hover:text-travel-purple transition-all duration-300',
                !iconOnly && 'mr-2'
              )}
            />
            {!iconOnly && (
              <span className="whitespace-nowrap group-hover:text-travel-purple transition-colors duration-300">
                Save {showCount && count > 0 && `(${count})`}
              </span>
            )}
          </>
        )}
      </motion.div>
    </Button>
  );
}
