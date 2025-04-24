"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, ThumbsDown, ThumbsUp, Users, Edit, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CollaborativeEditor } from "@/components/collaborative-editor"
import { API_ROUTES, ITINERARY_CATEGORIES, PAGE_ROUTES, TIME_FORMATS } from "@/utils/constants"
import { type ItineraryItem } from "@/types/itinerary"
import { useAuth } from "@/lib/hooks/use-auth"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard'

interface ItineraryTabProps {
  tripId: string
  initialItems: ItineraryItem[]
  canEdit: boolean
}

export function ItineraryTab({ tripId, initialItems, canEdit }: ItineraryTabProps) {
  const [items, setItems] = useState<ItineraryItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use fetch to call API route
        const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId));
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.error || `Failed to fetch items: ${response.statusText}`);
        }
        // Explicitly type the expected API response structure
        const data: { itemsByDay?: Record<number, ItineraryItem[]> } = await response.json();
        // Assuming the API returns { itemsByDay: { [day: number]: ItineraryItem[] }, durationDays: number }
        // We need to flatten itemsByDay or adjust how state is managed
        const fetchedItems: ItineraryItem[] = Object.values(data.itemsByDay || {}).flat();
        setItems(fetchedItems);
      } catch (err: any) {
        console.error("Error fetching itinerary items:", err);
        setError(err.message || "Failed to load itinerary items.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch only if initialItems is empty, assuming initialItems are server-rendered otherwise
     if (initialItems.length === 0 && tripId) {
       fetchItems();
     }

  }, [tripId, initialItems.length]) // Removed user?.id dependency as fetch is now generic

  const handleVote = async (itemId: string, voteType: "up" | "down" | null) => {
    if (!user) {
      toast({ title: "Login required", description: "You must be logged in to vote.", variant: "destructive" });
      return;
    }

    // Optimistically update UI
    const originalItems = [...items];
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const currentVote = item.user_vote;
          let voteChange = 0;
          let currentVoteCount = item.votes || 0;

          if (voteType === currentVote) {
            // Undoing vote
            voteChange = voteType === 'up' ? -1 : 1;
            return { ...item, user_vote: null, votes: currentVoteCount + voteChange };
          } else {
            // Changing vote or new vote
            if (currentVote === 'up') voteChange--;
            if (currentVote === 'down') voteChange++;
            if (voteType === 'up') voteChange++;
            if (voteType === 'down') voteChange--;
            return { ...item, user_vote: voteType, votes: currentVoteCount + voteChange };
          }
        }
        return item;
      });
    });

    try {
      // Use fetch to call the vote API Route
      const voteApiPath = API_ROUTES.ITINERARY_ITEM_VOTE(tripId, itemId); // Assuming this generates /api/trips/[tripId]/itinerary/[itemId]/vote
      const response = await fetch(voteApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_type: voteType }), // Send voteType in the body
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || `Failed to record vote: ${response.statusText}`);
      }

      // Optional: Update state with response data if API returns updated counts/voter lists
      // const updatedData = await response.json();
      // Example: setItems(prev => prev.map(item => item.id === itemId ? { ...item, votes: updatedData.newVoteCount } : item));
      // For now, relying on optimistic update.

    } catch (error: any) {
      console.error("Error voting on item:", error);
      toast({ title: "Error", description: error.message || "Failed to register vote.", variant: "destructive" });
      // Revert UI on error
      setItems(originalItems);
    }
  };

  const handleSaveNotes = async (itemId: string, content: any) => {
    try {
      const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${itemId}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to save notes")
      }

      setEditingItemId(null)
      toast({
        title: "Notes saved",
        description: "Your changes have been saved",
      })
    } catch (error) {
      console.error("Failed to save notes:", error)
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading itinerary...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateKey = item.date || "Unscheduled";
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Sort dates
  const sortedDates = Object.keys(groupedItems).sort((a: string, b: string) => {
    if (a === "Unscheduled") return 1
    if (b === "Unscheduled") return -1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-8 py-4">
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No itinerary items added yet.</p>
          {canEdit && (
            <Link href={PAGE_ROUTES.TRIP_DETAILS(tripId) + '/add-item'}>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Link>
          )}
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2 border-b">
              {date === "Unscheduled" ? "Unscheduled" : formatDate(date)}
            </h3>
            <div className="space-y-4">
              {groupedItems[date]
                .sort((a: ItineraryItem, b: ItineraryItem) => {
                  // Sort by start time
                  const timeA = a.start_time ? a.start_time.split(":").map(Number) : [24, 0];
                  const timeB = b.start_time ? b.start_time.split(":").map(Number) : [24, 0];
                  if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
                  return timeA[1] - timeB[1];
                })
                .map((item: ItineraryItem) => (
                  <ItineraryItemComponent
                    key={item.id}
                    item={item}
                    onVote={handleVote}
                    canEdit={canEdit}
                    isEditing={editingItemId === item.id}
                    onEdit={(id) => setEditingItemId(id)}
                    onSave={(content) => handleSaveNotes(item.id, content)}
                    onCancel={() => setEditingItemId(null)}
                    tripId={tripId}
                  />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface ItineraryItemProps {
  item: ItineraryItem
  onVote: (itemId: string, voteType: "up" | "down" | null) => void
  canEdit?: boolean
  isEditing?: boolean
  onEdit?: (itemId: string) => void
  onSave?: (content: any) => void
  onCancel?: () => void
  tripId: string
}

function ItineraryItemComponent({
  item,
  onVote,
  canEdit = false,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  tripId,
}: ItineraryItemProps) {
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  // In a real app, you would fetch active users from your presence system
  useEffect(() => {
    // Simulate fetching active users
    const interval = setInterval(() => {
      // This would be replaced with real-time updates
      setActiveUsers(Math.random() > 0.5 ? ["John", "Sarah"] : ["Mike"])
    }, 5000)

    return () => clearInterval(interval)
  }, [item.id])

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-4 bg-muted/30">
        <div>
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <CardDescription>{item.type}</CardDescription>
        </div>
        {item.cost && item.cost > 0 && <Badge variant="outline">${Number(item.cost).toFixed(2)}</Badge>}
      </CardHeader>
      <CardContent className="p-4 text-sm">
        {(item.start_time || item.end_time) && (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(item.start_time ?? undefined)} {item.end_time ? `- ${formatTime(item.end_time ?? undefined)}` : ""}
            </span>
          </div>
        )}
        {item.location && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{item.location}</span>
          </div>
        )}

        {item.notes && !isEditing && (
          <p className="mt-2 text-muted-foreground text-xs whitespace-pre-wrap">
            {typeof item.notes === 'string' ? item.notes : ""}
          </p>
        )}

        {isEditing && (
          <div className="mt-2">
            <CollaborativeEditor
              documentId={`${tripId}-${item.id}-notes`}
              initialContent={item.notes || ""}
              onSave={(content) => onSave?.(content)}
              tripId={tripId}
              onCancel={onCancel || (() => {})}
            />
          </div>
        )}

        {activeUsers.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {activeUsers.join(", ")} {activeUsers.length === 1 ? "is" : "are"} viewing
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t bg-muted/30">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>Votes:</span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", item.user_vote === "down" && "text-red-500")}
            onClick={() => onVote(item.id, "down")}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.votes || 0}</span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", item.user_vote === "up" && "text-green-500")}
            onClick={() => onVote(item.id, "up")}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </div>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(item.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Notes</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
