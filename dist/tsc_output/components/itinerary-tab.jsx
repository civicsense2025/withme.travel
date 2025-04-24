"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ThumbsDown, ThumbsUp, Users, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { getItineraryItems, voteForItem } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { CollaborativeEditor } from "@/components/collaborative-editor";
import { API_ROUTES, PAGE_ROUTES } from "@/utils/constants";
export function ItineraryTab({ tripId, canEdit = false }) {
    const [itineraryItems, setItineraryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItemId, setEditingItemId] = useState(null);
    const { toast } = useToast();
    // In a real app, you would get the current user ID from auth
    const currentUserId = "mock-user-id";
    useEffect(() => {
        async function loadItems() {
            try {
                const items = await getItineraryItems(tripId, currentUserId);
                setItineraryItems(items);
            }
            catch (error) {
                console.error("Failed to load itinerary items:", error);
                toast({
                    title: "Error",
                    description: "Failed to load itinerary items",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
        }
        loadItems();
    }, [tripId, toast]);
    const handleVote = async (itemId, isUpvote) => {
        try {
            await voteForItem(itemId, currentUserId, isUpvote ? "up" : "down");
            // Update the local state to reflect the vote
            setItineraryItems((items) => items.map((item) => {
                if (item.id === itemId) {
                    if (isUpvote) {
                        // If already upvoted, remove the upvote
                        if (item.user_vote === "up") {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) - 1, user_vote: null });
                        }
                        // If downvoted, remove downvote and add upvote
                        else if (item.user_vote === "down") {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) + 2, user_vote: "up" });
                        }
                        // If no vote, add upvote
                        else {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) + 1, user_vote: "up" });
                        }
                    }
                    else {
                        // If already downvoted, remove the downvote
                        if (item.user_vote === "down") {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) + 1, user_vote: null });
                        }
                        // If upvoted, remove upvote and add downvote
                        else if (item.user_vote === "up") {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) - 2, user_vote: "down" });
                        }
                        // If no vote, add downvote
                        else {
                            return Object.assign(Object.assign({}, item), { votes: (item.votes || 0) - 1, user_vote: "down" });
                        }
                    }
                }
                return item;
            }));
        }
        catch (error) {
            console.error("Failed to vote:", error);
            toast({
                title: "Error",
                description: "Failed to register your vote",
                variant: "destructive",
            });
        }
    };
    const handleSaveNotes = async (itemId, content) => {
        try {
            const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${itemId}/notes`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                throw new Error("Failed to save notes");
            }
            setEditingItemId(null);
            toast({
                title: "Notes saved",
                description: "Your changes have been saved",
            });
        }
        catch (error) {
            console.error("Failed to save notes:", error);
            toast({
                title: "Error",
                description: "Failed to save notes",
                variant: "destructive",
            });
        }
    };
    if (loading) {
        return <div className="py-8 text-center">Loading itinerary items...</div>;
    }
    // Group items by date
    const itemsByDate = itineraryItems.reduce((acc, item) => {
        const date = item.date || "Unscheduled";
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});
    // Sort dates
    const sortedDates = Object.keys(itemsByDate).sort((a, b) => {
        if (a === "Unscheduled")
            return 1;
        if (b === "Unscheduled")
            return -1;
        return a.localeCompare(b);
    });
    return (<div className="space-y-8 py-4">
      {sortedDates.length === 0 ? (<div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No itinerary items added yet.</p>
          {canEdit && (<Button variant="outline" as={Link} href={`${PAGE_ROUTES.TRIP_DETAILS(tripId)}/add-item`}>
              Add Your First Item
            </Button>)}
        </div>) : (sortedDates.map((date) => (<div key={date}>
            <h3 className="text-lg font-semibold mb-4">
              {date === "Unscheduled"
                ? "Unscheduled"
                : formatDate(date, "FULL_DATE")}
            </h3>
            <div className="space-y-4">
              {itemsByDate[date]
                .sort((a, b) => {
                // Sort by start time
                if (!a.start_time)
                    return 1;
                if (!b.start_time)
                    return -1;
                return a.start_time.localeCompare(b.start_time);
            })
                .map((item) => (<ItineraryItemComponent key={item.id} item={item} onVote={handleVote} canEdit={canEdit} isEditing={editingItemId === item.id} onEdit={() => setEditingItemId(item.id)} onSave={(content) => handleSaveNotes(item.id, content)} onCancel={() => setEditingItemId(null)} tripId={tripId}/>))}
            </div>
          </div>)))}
    </div>);
}
function ItineraryItemComponent({ item, onVote, canEdit = false, isEditing = false, onEdit, onSave, onCancel, tripId, }) {
    const [activeUsers, setActiveUsers] = useState([]);
    // In a real app, you would fetch active users from your presence system
    useEffect(() => {
        // Simulate fetching active users
        const interval = setInterval(() => {
            // This would be replaced with real-time updates
            setActiveUsers(Math.random() > 0.5 ? ["John", "Sarah"] : ["Mike"]);
        }, 5000);
        return () => clearInterval(interval);
    }, [item.id]);
    return (<Card className={`shadow hover:shadow-md transition-shadow duration-200 ${getCardClass()}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>{item.type}</CardDescription>
          </div>
          {item.cost && item.cost > 0 && <Badge variant="outline">${Number(item.cost).toFixed(2)}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="grid gap-2">
          {(item.start_time || item.end_time) && (<div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground"/>
              <span>
                {formatTime(item.start_time)} {item.end_time ? `- ${formatTime(item.end_time)}` : ""}
              </span>
            </div>)}
          {item.location && (<div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground"/>
              <span>{item.location}</span>
            </div>)}

          {item.notes && !isEditing && (<div className="mt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-sm">{item.notes}</p>
            </div>)}

          {isEditing && (<div className="mt-2">
              <CollaborativeEditor initialContent={item.notes || ""} documentId={`itinerary-${item.id}`} tripId={tripId} onSave={onSave} onCancel={onCancel}/>
            </div>)}

          {activeUsers.length > 0 && (<div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3 text-muted-foreground"/>
              <span className="text-xs text-muted-foreground">
                {activeUsers.join(", ")} {activeUsers.length === 1 ? "is" : "are"} viewing
              </span>
            </div>)}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4"/>
          <span>{item.date ? formatDate(item.date) : "Unscheduled"}</span>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !isEditing && (<Button variant="ghost" size="sm" onClick={onEdit} className="h-8 gap-1">
              <Edit className="h-3 w-3"/>
              Edit Notes
            </Button>)}
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", item.user_vote === "down" && "text-red-500")} onClick={() => onVote(item.id, false)}>
            <ThumbsDown className="h-4 w-4"/>
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.votes || 0}</span>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", item.user_vote === "up" && "text-green-500")} onClick={() => onVote(item.id, true)}>
            <ThumbsUp className="h-4 w-4"/>
          </Button>
        </div>
      </CardFooter>
      {canEdit && (<div className="flex justify-end mt-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`${API_ROUTES.TRIP_ITINERARY(tripId)}/${item.id}/edit`}>
              <Edit className="h-4 w-4 mr-1"/>
              Edit
            </Link>
          </Button>
        </div>)}
    </Card>);
}
