import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown, Filter, ArrowUpDown, ChevronDown, Info, } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { API_ROUTES } from "@/utils/constants";
const seasonEmoji = {
    spring: "🌸",
    summer: "☀️",
    fall: "🍂",
    winter: "❄️",
};
const travelTypeEmoji = {
    solo: "🚶",
    couple: "👫",
    family: "👨‍👩‍👧‍👦",
    friends: "👥",
    business: "💼",
};
export function DestinationReviews({ destinationId, destinationName, }) {
    const router = useRouter();
    const { toast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState("recent");
    const [filterSeason, setFilterSeason] = useState(null);
    const [filterTravelType, setFilterTravelType] = useState(null);
    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams(Object.assign(Object.assign({ sort_by: sortBy }, (filterSeason && { season: filterSeason })), (filterTravelType && { travel_type: filterTravelType })));
            const response = await fetch(`${API_ROUTES.DESTINATION_REVIEWS(destinationId)}?${params}`);
            if (!response.ok)
                throw new Error("Failed to fetch reviews");
            const data = await response.json();
            setReviews(data.reviews);
        }
        catch (error) {
            console.error("Error fetching reviews:", error);
            toast({
                title: "Error",
                description: "Failed to load reviews. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Fetch reviews when filters change
    useEffect(() => {
        fetchReviews();
    }, [destinationId, sortBy, filterSeason, filterTravelType]);
    const renderStars = (rating) => {
        return (<div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}/>))}
      </div>);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };
    return (<Card>
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="lowercase">traveler reviews</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                    <Info className="h-4 w-4"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reviews are submitted by verified users who have completed a trip to this destination.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2"/>
                  Filter
                  <ChevronDown className="h-4 w-4 ml-2"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterSeason(null)}>
                  All Seasons
                </DropdownMenuItem>
                {Object.entries(seasonEmoji).map(([season, emoji]) => (<DropdownMenuItem key={season} onClick={() => setFilterSeason(season)}>
                    {emoji} {season.charAt(0).toUpperCase() + season.slice(1)}
                  </DropdownMenuItem>))}
                <Separator className="my-2"/>
                <DropdownMenuItem onClick={() => setFilterTravelType(null)}>
                  All Travel Types
                </DropdownMenuItem>
                {Object.entries(travelTypeEmoji).map(([type, emoji]) => (<DropdownMenuItem key={type} onClick={() => setFilterTravelType(type)}>
                    {emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuItem>))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-2"/>
                  Sort
                  <ChevronDown className="h-4 w-4 ml-2"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rating")}>
                  Highest Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(filterSeason || filterTravelType) && (<div className="flex gap-2">
            {filterSeason && (<Badge variant="secondary" className="gap-1">
                {seasonEmoji[filterSeason]}
                {filterSeason.charAt(0).toUpperCase() + filterSeason.slice(1)}
                <button className="ml-1 hover:text-destructive" onClick={() => setFilterSeason(null)}>
                  ×
                </button>
              </Badge>)}
            {filterTravelType && (<Badge variant="secondary" className="gap-1">
                {travelTypeEmoji[filterTravelType]}
                {filterTravelType.charAt(0).toUpperCase() +
                    filterTravelType.slice(1)}
                <button className="ml-1 hover:text-destructive" onClick={() => setFilterTravelType(null)}>
                  ×
                </button>
              </Badge>)}
          </div>)}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (<div className="space-y-4">
              {[1, 2, 3].map((i) => (<div key={i} className="animate-pulse space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted"/>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded"/>
                      <div className="h-3 w-32 bg-muted rounded"/>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted rounded"/>
                  <div className="h-4 w-3/4 bg-muted rounded"/>
                </div>))}
            </div>) : reviews.length === 0 ? (<div className="text-center py-4 text-muted-foreground">
              No reviews found for {destinationName}
            </div>) : (<div className="space-y-6">
              {reviews.map((review) => (<div key={review.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar_url}/>
                        <AvatarFallback>
                          {review.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(review.visit_start_date)} -{" "}
                          {formatDate(review.visit_end_date)}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.overall_rating)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      {seasonEmoji[review.travel_season]}
                      {review.travel_season.charAt(0).toUpperCase() +
                    review.travel_season.slice(1)}
                    </Badge>
                    {review.travel_type.map((type) => (<Badge key={type} variant="outline" className="gap-1">
                        {travelTypeEmoji[type]}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>))}
                    <Badge variant={review.would_visit_again ? "default" : "destructive"} className="gap-1">
                      {review.would_visit_again ? (<ThumbsUp className="h-3 w-3"/>) : (<ThumbsDown className="h-3 w-3"/>)}
                      {review.would_visit_again
                    ? "Would visit again"
                    : "Would not visit again"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">{review.review_text}</p>
                    {review.trip_highlights && (<div>
                        <div className="font-medium text-sm">Highlights</div>
                        <p className="text-sm text-muted-foreground">
                          {review.trip_highlights}
                        </p>
                      </div>)}
                    {review.trip_tips && (<div>
                        <div className="font-medium text-sm">Tips</div>
                        <p className="text-sm text-muted-foreground">
                          {review.trip_tips}
                        </p>
                      </div>)}
                  </div>

                  <Separator />
                </div>))}
            </div>)}
        </ScrollArea>
      </CardContent>
    </Card>);
}
