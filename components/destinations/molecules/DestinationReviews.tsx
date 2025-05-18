/**
 * Destination Reviews
 * 
 * Displays reviews from travelers about a destination
 * 
 * @module destinations/molecules
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  content: string;
  date: string;
  helpful?: number;
  images?: string[];
  tags?: string[];
}

export interface DestinationReviewsProps {
  /** Destination ID */
  destinationId: string;
  /** Maximum number of reviews to show initially */
  initialLimit?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationReviews({
  destinationId,
  initialLimit = 3,
  className,
}: DestinationReviewsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayCount, setDisplayCount] = useState(initialLimit);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/destinations/${destinationId}/reviews`);

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Could not load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    if (destinationId) {
      fetchReviews();
    }
  }, [destinationId]);

  const loadMoreReviews = () => {
    setDisplayCount(prev => prev + 3);
  };

  if (isLoading) {
    return (
      <div className={cn("mt-8 space-y-4", className)}>
        <h2 className="text-xl font-bold">Traveler Reviews</h2>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <div className={cn("mt-8 space-y-4", className)}>
        <h2 className="text-xl font-bold">Traveler Reviews</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || "No reviews yet for this destination."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("mt-8 space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Traveler Reviews</h2>
        <div className="flex items-center">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn("h-4 w-4", {
                  "text-yellow-400 fill-yellow-400": star <= Math.round(
                    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
                  ),
                  "text-gray-300": star > Math.round(
                    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
                  ),
                })}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.slice(0, displayCount).map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted mr-3">
                    {review.userAvatar ? (
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl font-semibold text-muted-foreground">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{review.userName}</CardTitle>
                    <CardDescription>
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn("h-4 w-4", {
                        "text-yellow-400 fill-yellow-400": star <= review.rating,
                        "text-gray-300": star > review.rating,
                      })}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm whitespace-pre-line">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.images.map((image, i) => (
                    <div
                      key={i}
                      className="relative h-20 w-20 rounded-md overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Review photo ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {review.tags && review.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t bg-muted/20 py-2 px-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <button className="flex items-center hover:text-foreground">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Reply</span>
                </button>
                {review.helpful !== undefined && (
                  <div className="ml-4 flex items-center">
                    <span>{review.helpful} people found this helpful</span>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {displayCount < reviews.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMoreReviews}
            className="mt-2"
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
} 