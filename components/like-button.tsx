'use client';

import { useLikes } from '@/hooks/use-likes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type ItemType = 'destination' | 'itinerary' | 'trip' | 'template';

interface LikeButtonProps {
  itemId: string;
  itemType: ItemType;
  initialLiked?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
  onLikeChange?: (isLiked: boolean) => void;
}

export function LikeButton({
  itemId,
  itemType,
  initialLiked = false,
  variant = 'ghost',
  size = 'sm',
  iconOnly = false,
  className,
  onLikeChange,
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
        title: "Sign in required",
        description: "Please sign in to save items to your collection.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await toggleLike();
      
      if (onLikeChange) {
        onLikeChange(!isLiked);
      }
      
      // Show success toast
      toast({
        title: isLiked ? "Removed from saved items" : "Saved to your collection",
        variant: "default",
      });
    } catch (err) {
      // Error is handled in the hook, but we can show a toast here too
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
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
  
  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : 'default'}
      disabled={isLoading}
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from saved items' : 'Save to collection'}
      className={cn(
        'group transition-all',
        iconOnly && sizeClasses[size],
        className
      )}
    >
      {isLiked ? (
        <>
          <BookmarkCheck className={cn(
            iconSizes[size], 
            'fill-primary text-primary group-hover:text-primary',
            !iconOnly && 'mr-2'
          )} />
          {!iconOnly && (
            <span className="whitespace-nowrap">Saved</span>
          )}
        </>
      ) : (
        <>
          <Bookmark className={cn(
            iconSizes[size],
            'group-hover:fill-primary group-hover:text-primary',
            !iconOnly && 'mr-2'
          )} />
          {!iconOnly && (
            <span className="whitespace-nowrap">Save</span>
          )}
        </>
      )}
    </Button>
  );
}
