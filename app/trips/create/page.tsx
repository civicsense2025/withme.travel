"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, CircleCheck, CircleDashed } from "lucide-react"
import { cn } from "@/lib/utils"
import { LocationSearch } from "@/components/location-search"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Define Destination type matching the one expected by LocationSearch results
interface Destination {
  id: string
  name: string // This seems redundant if city/country is used, maybe remove later
  city: string
  state_province: string | null
  country: string
  continent: string
  description: string | null
  image_url: string | null
}

// Updated Steps Array
const steps = [
  { id: "name-destination", title: "Name & Destination" }, // Combined Step 0
  // { id: "destination", title: "Destination" }, // Removed
  { id: "dates", title: "Dates" },           // Now Step 1
  { id: "travelers", title: "Travel Buddies" }, // Now Step 2
  { id: "vibe", title: "Trip Vibe" },        // Now Step 3
  { id: "budget", title: "Budget Range" },    // Now Step 4
  { id: "privacy", title: "Privacy Settings" }, // Now Step 5
]

function CreateTripPageContent() {
  const [currentStep, setCurrentStep] = useState(0)
  const [tripName, setTripName] = useState("")
  const [destination, setDestination] = useState<Destination | null>(null)
  const [destinationLoading, setDestinationLoading] = useState(false)
  const [destinationError, setDestinationError] = useState<string | null>(null)
  const [dateOption, setDateOption] = useState("specific")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [travelers, setTravelers] = useState("")
  const [vibe, setVibe] = useState("")
  const [budget, setBudget] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [router])

  useEffect(() => {
    console.log("CLIENT: Destination fetch useEffect running.");
    const destinationId = searchParams.get("destination_id");
    console.log("CLIENT: Got destination_id from searchParams:", destinationId);

    async function fetchAndSetDestination(id: string) {
      console.log("CLIENT: fetchAndSetDestination called with ID:", id);
      // Reset error state
      setDestinationError(null);
      setDestinationLoading(true);

      // Validate UUID format before making the request
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error("CLIENT: Invalid destination ID format:", id);
        setDestinationError("Invalid destination ID format");
        setDestinationLoading(false);
        return;
      }

      try {
        console.log(`CLIENT: Fetching /api/destinations/id/${id}`);
        const response = await fetch(`/api/destinations/id/${id}`);
        console.log("CLIENT: Fetch response received:", response);

        if (response.status === 404) {
          console.warn(`CLIENT: Destination with ID ${id} not found (404).`);
          setDestinationError("Destination not found");
          setDestinationLoading(false);
          return;
        }

        if (!response.ok) {
          console.error("CLIENT: Fetch response not OK:", response.status, response.statusText);
          throw new Error(`Failed to fetch destination details: ${response.status}`);
        }

        // Clone response to log body safely
        const responseClone = response.clone(); 
        const responseText = await responseClone.text();
        console.log("CLIENT: Fetch response body text:", responseText);

        const data = await response.json();
        console.log("CLIENT: Parsed JSON data:", data);

        if (data.destination) {
          console.log("CLIENT: data.destination found:", data.destination);
          // Validate minimum required fields
          if (!data.destination.id || !data.destination.city || !data.destination.country) {
            console.error("CLIENT: Destination data incomplete", data.destination);
            setDestinationError("Destination data incomplete");
            setDestinationLoading(false);
            return;
          }

          // If name is missing, use city + country
          if (!data.destination.name || data.destination.name.trim() === '') {
            console.log("CLIENT: Destination name missing, generating from city/country.");
            data.destination.name = `${data.destination.city}, ${data.destination.country}`;
          }

          console.log("CLIENT: Calling setDestination with:", data.destination);
          setDestination(data.destination);
          
          // Try focusing after a short delay to ensure element exists
          setTimeout(() => {
            console.log("CLIENT: Attempting to focus #trip-name");
            document.getElementById('trip-name')?.focus();
          }, 0);

        } else {
          console.warn(`CLIENT: Destination data invalid (data.destination missing):`, data);
          setDestinationError("Invalid destination data");
        }
      } catch (error) {
        console.error("CLIENT: Error fetching pre-filled destination:", error);
        setDestinationError("Failed to load destination");
      } finally {
        console.log("CLIENT: Setting destinationLoading to false.");
        setDestinationLoading(false);
      }
    }

    // Only run fetch if we have an ID and destination is not already set
    if (destinationId && !destination) {
      console.log("CLIENT: Conditions met (destinationId exists, destination is null), calling fetchAndSetDestination.");
      fetchAndSetDestination(destinationId);
    } else {
        console.log("CLIENT: Conditions not met for fetching. destinationId:", destinationId, "destination state:", destination);
    }
  }, [searchParams, destination]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const tripData = {
        name: tripName,
        destination_id: destination?.id,
        destination_name: destination?.name,
        start_date: dateOption === "specific" ? startDate?.toISOString() : null,
        end_date: dateOption === "specific" ? endDate?.toISOString() : null,
        date_flexibility: dateOption === "specific" ? "fixed" : dateOption,
        travelers_count: Number.parseInt(travelers) || 0,
        vibe,
        budget,
        is_public: isPublic,
        created_by: user.id,
      }

      console.log("Attempting to insert trip data:", tripData)
      console.log("User ID:", user.id)

      // 1. Insert the main trip data
      const { data: tripDataResult, error: tripError } = await supabase
        .from("trips")
        .insert(tripData)
        .select()
        .single() // Expecting single row back

      if (tripError) {
        console.error("Supabase insert error object (trips):", tripError)
        throw tripError
      }

      if (!tripDataResult) {
        throw new Error("Trip creation succeeded but no data returned.")
      }

      console.log("Trip created successfully:", tripDataResult)
      const newTripId = tripDataResult.id

      // 2. Add the creator as owner in trip_members
      const { error: memberError } = await supabase.from("trip_members").insert({
        trip_id: newTripId,
        user_id: user.id,
        role: "owner", // Automatically assign creator as owner
      })

      if (memberError) {
        console.error("Error adding creator to trip_members:", memberError)
        // Decide how to handle this - maybe delete the trip? Or just log and proceed?
        // For now, let's throw the error to make it visible.
        throw new Error(
          `Trip created (ID: ${newTripId}), but failed to add creator as owner. ${memberError.message}`,
        )
      }

      console.log("Creator added as owner to trip_members")

      // 3. Redirect to success page
      router.push(`/trips/create/success?id=${newTripId}`)
    } catch (error: any) {
      console.error("Error during trip creation process:", error)
      if (error && typeof error === 'object') {
        console.error("Detailed Supabase Error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case "name-destination": // Combined validation
        return tripName.trim().length > 0 && destination !== null
      case "dates":
        if (dateOption === "specific") {
          return startDate !== undefined && endDate !== undefined
        }
        return true
      case "travelers":
        return travelers.trim().length > 0
      case "vibe":
        return vibe.trim().length > 0
      case "budget":
        return budget.trim().length > 0
      case "privacy":
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "name-destination": // Combined render
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trip-name">What are we calling this adventure?</Label>
              <Input
                id="trip-name"
                placeholder="Summer in Barcelona"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Where are you headed?</Label>
              {/* Show destination error if there is one */}
              {destinationError && (
                <Card className="p-3 border-destructive bg-destructive/10">
                  <p className="text-sm text-destructive">{destinationError}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setDestinationError(null)}>
                    Choose a Different Destination
                  </Button>
                </Card>
              )}
              
              {/* Show loading state while fetching destination */}
              {destinationLoading && (
                <Card className="p-3 border-muted bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Loading destination...</p>
                  </div>
                </Card>
              )}
              
              {/* Show selected destination if available */}
              {destination && !destinationLoading && !destinationError && (
                <Card className="p-3 border-primary bg-muted/50">
                  <p className="font-semibold">Selected: {destination.city}, {destination.country}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setDestination(null)}>
                    Change
                  </Button>
                </Card>
              )}
              
              {/* Show location search if no destination selected and not loading */}
              {!destination && !destinationLoading && !destinationError && (
                <LocationSearch onLocationSelect={(selectedLocation) => setDestination(selectedLocation)} />
              )}
            </div>
          </div>
        )
      // case "destination": // Removed
      //   return null 
      case "dates":
        return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>When are you planning to go?</Label>
               <RadioGroup value={dateOption} onValueChange={setDateOption}>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="specific" id="specific" />
                   <Label htmlFor="specific">I know my dates</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="month" id="month" />
                   <Label htmlFor="month">Sometime this month</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="season" id="season" />
                   <Label htmlFor="season">This season</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="undecided" id="undecided" />
                   <Label htmlFor="undecided">Still figuring it out</Label>
                 </div>
               </RadioGroup>
             </div>
             {dateOption === "specific" && (
               <div className="grid gap-2">
                 <div className="grid gap-2">
                   <Label>Start Date</Label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         variant={"outline"}
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !startDate && "text-muted-foreground",
                         )}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0">
                       <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div className="grid gap-2">
                   <Label>End Date</Label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         variant={"outline"}
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !endDate && "text-muted-foreground",
                         )}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0">
                       <Calendar
                         mode="single"
                         selected={endDate}
                         onSelect={setEndDate}
                         initialFocus
                         disabled={(date) => (startDate ? date < startDate : false)}
                       />
                     </PopoverContent>
                   </Popover>
                 </div>
               </div>
             )}
           </div>
        )
      case "travelers":
         // ... travelers rendering logic ...
        return (
           <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="travelers">How many people are joining?</Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                placeholder="Number of travelers"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>
          </div>
        )
      case "vibe":
        // ... vibe rendering logic ...
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What's the vibe of this trip?</Label>
              <RadioGroup value={vibe} onValueChange={setVibe}>
                 {/* ... radio items ... */}
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relaxed" id="relaxed" />
                  <Label htmlFor="relaxed">Relaxed & Chill</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adventure" id="adventure" />
                  <Label htmlFor="adventure">Adventure & Exploration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cultural" id="cultural" />
                  <Label htmlFor="cultural">Cultural & Educational</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="party" id="party" />
                  <Label htmlFor="party">Party & Nightlife</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mix of Everything</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
      case "budget":
        // ... budget rendering logic ...
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What's your budget range?</Label>
              <RadioGroup value={budget} onValueChange={setBudget}>
                 {/* ... radio items ... */}
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="budget" id="budget" />
                  <Label htmlFor="budget">Budget-friendly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="luxury" id="luxury" />
                  <Label htmlFor="luxury">Luxury</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="budget-mixed" />
                  <Label htmlFor="budget-mixed">Mix of price points</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
      case "privacy":
        // ... privacy rendering logic ...
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trip Privacy Settings</Label>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="public-trip">Make trip public</Label>
                  <p className="text-sm text-muted-foreground">Public trips can be viewed by anyone with the link</p>
                </div>
                <Switch id="public-trip" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const formatSummaryDate = (date: Date | undefined): string => {
    return date ? format(date, "PPP") : "Not set"
  }

  // Function to handle jumping to a step
  const handleStepJump = (stepIndex: number) => {
    // Basic validation: Allow jumping back freely, but only forward if previous steps are valid?
    // For simplicity now, allow jumping freely. Add validation later if needed.
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }

  // Restore the two-column layout
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Stepper Card */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Create New Trip</CardTitle>
              <div className="text-sm text-muted-foreground">
                {/* Display title from updated steps array */} 
                <span>{steps[currentStep].title}</span>
              </div>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || loading}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!isStepValid() || loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Trip
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!isStepValid() || loading}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Trip Summary Sidebar - Updated */}
        <aside className="lg:w-1/3 space-y-4 lg:sticky lg:top-24 h-fit">
          <h2 className="text-xl font-semibold tracking-tight">Trip Summary</h2>
          <div className="space-y-2">
            {[ 
              // Combined first step summary
              { label: "Name & Destination", value: `${tripName || "-"} @ ${destination ? destination.city : "-"}`, stepIndex: 0 }, 
              // Updated subsequent steps (indices shift due to removal of one step)
              { label: "Dates", value: dateOption === "specific" ? `${formatSummaryDate(startDate)} - ${formatSummaryDate(endDate)}` : dateOption, stepIndex: 1 },
              { label: "Travelers", value: travelers || "-", stepIndex: 2 },
              { label: "Vibe", value: vibe || "-", stepIndex: 3 },
              { label: "Budget", value: budget || "-", stepIndex: 4 },
              { label: "Privacy", value: isPublic ? "Public" : "Private", stepIndex: 5 },
            ].map((item, index) => {
              const stepIndex = item.stepIndex // Use defined stepIndex for logic
              const isCompleted = stepIndex < currentStep;
              const isActive = stepIndex === currentStep;
              const StepIcon = isCompleted ? CircleCheck : isActive ? ChevronRight : CircleDashed;
              const iconColor = isCompleted ? "text-green-500" : isActive ? "text-primary" : "text-muted-foreground";

              return (
                <button
                  key={item.label}
                  onClick={() => handleStepJump(stepIndex)}
                  className={cn(
                    "w-full flex items-start text-left p-3 rounded-lg transition-colors duration-150",
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  // Allow jumping only to completed or active steps
                  disabled={!isCompleted && !isActive} 
                >
                  <div className="flex items-center mr-3 pt-1">
                    <StepIcon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    {/* Combined display for first step */}
                    {stepIndex === 0 ? (
                      <>
                        <p className={cn("text-sm font-semibold mt-0.5", !tripName ? 'text-muted-foreground/60 italic' : '')}>{tripName || 'Name not set'}</p>
                        <p className={cn("text-sm font-semibold mt-0.5", !destination ? 'text-muted-foreground/60 italic' : '')}>{destination ? `${destination.city}, ${destination.country}` : 'Destination not set'}</p>
                      </>
                    ) : (
                       <p className={cn("text-sm font-semibold mt-0.5", !item.value || item.value === '-' ? 'text-muted-foreground/60 italic' : '')}>
                        {item.value && item.value !== '-' ? item.value : 'Not set'}
                        {item.label === "Dates" && dateOption !== "specific" && dateOption !== '' && ` (${dateOption})`}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* FAQ Section (Keep as is) */}
      {/* ... */}
      <section className="mt-16 pt-12 border-t">
         <h2 className="text-2xl font-bold tracking-tight text-center mb-8 lowercase">Frequently Asked Questions</h2>
         <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
           {/* ... AccordionItems ... */}
           <AccordionItem value="item-1">
             <AccordionTrigger>How do I invite friends to this trip?</AccordionTrigger>
             <AccordionContent>
               Once you've created the trip, you'll be taken to the trip dashboard. From there, you can find an "Invite" button or share a unique link to invite your travel buddies to collaborate.
             </AccordionContent>
           </AccordionItem>
           <AccordionItem value="item-2">
             <AccordionTrigger>Can I change the trip details later?</AccordionTrigger>
             <AccordionContent>
               Absolutely! Almost all details like dates, destinations (though major changes might require more planning!), vibe, budget, and privacy settings can be updated later from the trip dashboard.
             </AccordionContent>
           </AccordionItem>
           <AccordionItem value="item-3">
             <AccordionTrigger>What does "Make trip public" mean?</AccordionTrigger>
             <AccordionContent>
               Making a trip public generates a shareable link that anyone can use to view a read-only version of your itinerary. It's great for sharing your plans with people not collaborating directly or for inspiration. Private trips are only visible to invited members.
             </AccordionContent>
           </AccordionItem>
           <AccordionItem value="item-4">
             <AccordionTrigger>What happens after I click "Create Trip"?</AccordionTrigger>
             <AccordionContent>
               Your trip will be saved, and you'll be redirected to the main dashboard for that specific trip. There, you can start adding itinerary items, manage expenses, invite members, and more.
             </AccordionContent>
           </AccordionItem>
         </Accordion>
       </section>
    </div>
  );
}

// Default export wraps the main content with Suspense
export default function CreateTripPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}> 
      <CreateTripPageContent />
    </Suspense>
  );
}
