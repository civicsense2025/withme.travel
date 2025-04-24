import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { API_ROUTES } from "@/utils/constants";
const ratingLabels = {
    overall_rating: "Overall Experience",
    safety_rating: "Safety",
    cuisine_rating: "Food & Cuisine",
    cultural_rating: "Cultural Attractions",
    nightlife_rating: "Nightlife",
    outdoor_rating: "Outdoor Activities",
    transportation_rating: "Public Transportation",
    value_rating: "Value for Money",
};
const ratingCriteria = [
    {
        id: "overall_rating",
        label: "Overall Experience",
        description: "How would you rate your overall trip experience?",
    },
    {
        id: "safety_rating",
        label: "Safety",
        description: "How safe did you feel during your visit?",
    },
    {
        id: "cuisine_rating",
        label: "Food & Cuisine",
        description: "Quality and variety of local food options",
    },
    {
        id: "cultural_rating",
        label: "Cultural Attractions",
        description: "Museums, historical sites, and local experiences",
    },
    {
        id: "nightlife_rating",
        label: "Nightlife",
        description: "Evening entertainment and activities",
    },
    {
        id: "outdoor_rating",
        label: "Outdoor Activities",
        description: "Parks, nature, and outdoor recreation",
    },
    {
        id: "transportation_rating",
        label: "Public Transportation",
        description: "Ease of getting around using public transit",
    },
    {
        id: "value_rating",
        label: "Value for Money",
        description: "Overall value considering costs",
    },
];
const travelTypes = [
    { value: "solo", label: "Solo Travel" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
    { value: "business", label: "Business" },
];
export function TripReviewForm({ tripId, destinationId, destinationName, startDate, endDate, onReviewSubmitted, }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [ratings, setRatings] = useState({});
    const [reviewText, setReviewText] = useState("");
    const [travelType, setTravelType] = useState([]);
    const [wouldVisitAgain, setWouldVisitAgain] = useState(null);
    const [tripHighlights, setTripHighlights] = useState("");
    const [tripTips, setTripTips] = useState("");
    const getSeason = (date) => {
        const month = date.getMonth();
        if (month >= 2 && month <= 4)
            return "spring";
        if (month >= 5 && month <= 7)
            return "summer";
        if (month >= 8 && month <= 10)
            return "fall";
        return "winter";
    };
    const handleSubmit = async () => {
        try {
            const response = await fetch(API_ROUTES.TRIP_REVIEWS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.assign(Object.assign({ trip_id: tripId, destination_id: destinationId }, ratings), { review_text: reviewText, travel_season: getSeason(new Date(startDate)), travel_type: travelType, trip_highlights: tripHighlights, trip_tips: tripTips, would_visit_again: wouldVisitAgain, visit_start_date: startDate, visit_end_date: endDate })),
            });
            if (!response.ok)
                throw new Error("Failed to submit review");
            toast({
                title: "Review Submitted",
                description: "Thank you for sharing your experience!",
            });
            setIsOpen(false);
            onReviewSubmitted === null || onReviewSubmitted === void 0 ? void 0 : onReviewSubmitted();
        }
        catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Error",
                description: "Failed to submit review. Please try again.",
                variant: "destructive",
            });
        }
    };
    const isStepComplete = () => {
        switch (currentStep) {
            case 1:
                return Object.keys(ratings).length === ratingCriteria.length;
            case 2:
                return reviewText.length >= 50 && travelType.length > 0;
            case 3:
                return wouldVisitAgain !== null && tripHighlights.length > 0;
            default:
                return false;
        }
    };
    return (<>
      <Button onClick={() => setIsOpen(true)} className="w-full md:w-auto">
        Review Your Trip
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Your Trip to {destinationName}</DialogTitle>
            <DialogDescription>
              Share your experience to help other travelers plan their trips.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {currentStep === 1 && (<div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
                {ratingCriteria.map((criteria) => (<div key={criteria.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">{criteria.label}</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (<Button key={rating} variant={ratings[criteria.id] === rating ? "default" : "outline"} size="sm" className="w-10 h-10" onClick={() => setRatings((prev) => (Object.assign(Object.assign({}, prev), { [criteria.id]: rating })))}>
                            {rating}
                          </Button>))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{criteria.description}</p>
                  </div>))}
              </div>)}

            {currentStep === 2 && (<div className="space-y-6">
                <div className="space-y-2">
                  <Label>Who did you travel with?</Label>
                  <div className="flex flex-wrap gap-2">
                    {travelTypes.map((type) => (<Badge key={type.value} variant={travelType.includes(type.value) ? "default" : "outline"} className="cursor-pointer" onClick={() => setTravelType((prev) => prev.includes(type.value)
                    ? prev.filter((t) => t !== type.value)
                    : [...prev, type.value])}>
                        {type.label}
                      </Badge>))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Write about your experience</Label>
                  <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share details about your trip that would help other travelers..." className="min-h-[150px]"/>
                  <p className="text-sm text-muted-foreground">
                    {reviewText.length}/500 characters (minimum 50)
                  </p>
                </div>
              </div>)}

            {currentStep === 3 && (<div className="space-y-6">
                <div className="space-y-2">
                  <Label>Would you visit {destinationName} again?</Label>
                  <RadioGroup value={wouldVisitAgain === null || wouldVisitAgain === void 0 ? void 0 : wouldVisitAgain.toString()} onValueChange={(value) => setWouldVisitAgain(value === "true")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="yes"/>
                      <Label htmlFor="yes">Yes, I would visit again</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no"/>
                      <Label htmlFor="no">No, I would not visit again</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Trip Highlights</Label>
                  <Textarea value={tripHighlights} onChange={(e) => setTripHighlights(e.target.value)} placeholder="What were the best parts of your trip?" className="min-h-[100px]"/>
                </div>

                <div className="space-y-2">
                  <Label>Tips for Other Travelers</Label>
                  <Textarea value={tripTips} onChange={(e) => setTripTips(e.target.value)} placeholder="Share any tips or advice for future visitors..." className="min-h-[100px]"/>
                </div>
              </div>)}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Step {currentStep} of 3</Badge>
              {!isStepComplete() && (<p className="text-sm text-muted-foreground">
                  Please complete all fields to continue
                </p>)}
            </div>
            <div className="flex gap-2">
              {currentStep > 1 && (<Button variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
                  Back
                </Button>)}
              {currentStep < 3 ? (<Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={!isStepComplete()}>
                  Next
                </Button>) : (<Button onClick={handleSubmit} disabled={!isStepComplete()}>
                  Submit Review
                </Button>)}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
