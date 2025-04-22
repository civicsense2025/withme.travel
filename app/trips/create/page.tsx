"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
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
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, CircleCheck, CircleDashed, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { LocationSearch } from "@/components/location-search"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { generateSlug } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { slideInLeft, slideInRight, fadeIn, bounceIn } from "@/utils/animation"
import { UrlDisplay } from "./components/url-display"

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

// Trip interface (ensure it reflects the schema + form fields)
interface Trip {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  destination_id?: string | null;
  destination_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  date_flexibility?: string;
  travelers_count?: number;
  vibe?: string;
  budget?: string;
  is_public: boolean;
  created_by?: string;
  // Add any other relevant schema fields
}

// Updated Steps Array
const steps = [
  { id: "details", title: "Trip Details" }, // Renamed Step 0
  { id: "dates", title: "Dates" },           // Now Step 1
  { id: "travelers", title: "Travel Buddies" }, // Now Step 2
  { id: "vibe", title: "Trip Vibe" },        // Now Step 3
  { id: "budget", title: "Budget Range" },    // Now Step 4
  { id: "privacy", title: "Privacy Settings" }, // Now Step 5
]

function CreateTripPageContent() {
  const [currentStep, setCurrentStep] = useState(0)
  const [tripName, setTripName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
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
  const [error, setError] = useState<string | null>(null)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
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
    // console.log("CLIENT: Destination fetch useEffect running.");
    // Corrected the parameter name to match the URL
    const destinationId = searchParams.get("destination_id"); 
    // console.log("CLIENT: Got destination_id from searchParams:", destinationId);

    async function fetchAndSetDestination(id: string) {
      // console.log("CLIENT: fetchAndSetDestination called with ID:", id);
      // Reset error state
      setDestinationError(null);
      setDestinationLoading(true);

      // Validate UUID format before making the request
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        // console.error("CLIENT: Invalid destination ID format:", id);
        setDestinationError("Invalid destination ID format");
        setDestinationLoading(false);
        return;
      }

      try {
        // console.log(`CLIENT: Fetching /api/destinations/id/${id}`);
        const response = await fetch(`/api/destinations/id/${id}`);
        // console.log("CLIENT: Fetch response received:", response);

        if (response.status === 404) {
          // console.warn(`CLIENT: Destination with ID ${id} not found (404).`);
          setDestinationError("Destination not found");
          setDestinationLoading(false);
          return;
        }

        if (!response.ok) {
          // console.error("CLIENT: Fetch response not OK:", response.status, response.statusText);
          throw new Error(`Failed to fetch destination details: ${response.status}`);
        }

        // Clone response to log body safely
        // const responseClone = response.clone(); 
        // const responseText = await responseClone.text();
        // console.log("CLIENT: Fetch response body text:", responseText);

        const data = await response.json();
        // console.log("CLIENT: Parsed JSON data:", data);

        if (data.destination) {
          // console.log("CLIENT: data.destination found:", data.destination);
          // Validate minimum required fields
          if (!data.destination.id || !data.destination.city || !data.destination.country) {
            console.error("CLIENT: Destination data incomplete", data.destination); // Keep this error log
            setDestinationError("Destination data incomplete");
            setDestinationLoading(false);
            return;
          }

          // If name is missing, use city + country
          if (!data.destination.name || data.destination.name.trim() === '') {
            // console.log("CLIENT: Destination name missing, generating from city/country.");
            data.destination.name = `${data.destination.city}, ${data.destination.country}`;
          }

          // console.log("CLIENT: Calling setDestination with:", data.destination);
          setDestination(data.destination);
          
          // Try focusing after a short delay to ensure element exists
          setTimeout(() => {
            // console.log("CLIENT: Attempting to focus #trip-name");
            document.getElementById('trip-name')?.focus();
          }, 0);

        } else {
          console.warn(`CLIENT: Destination data invalid (data.destination missing):`, data); // Keep this warning log
          setDestinationError("Invalid destination data");
        }
      } catch (error) {
        console.error("CLIENT: Error fetching pre-filled destination:", error); // Keep this error log
        setDestinationError("Failed to load destination");
      } finally {
        // console.log("CLIENT: Setting destinationLoading to false.");
        setDestinationLoading(false);
      }
    }

    // Only run fetch if we have an ID and destination is not already set
    if (destinationId && !destination) {
      // console.log("CLIENT: Conditions met (destinationId exists, destination is null), calling fetchAndSetDestination.");
      fetchAndSetDestination(destinationId);
    } else {
        // console.log("CLIENT: Conditions not met for fetching. destinationId:", destinationId, "destination state:", destination);
    }
  }, [searchParams, destination]);

  // Auto-generate slug from name, unless manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && tripName) {
      setSlug(generateSlug(tripName));
    }
  }, [tripName, isSlugManuallyEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = generateSlug(e.target.value); // Ensure slug format
    setSlug(newSlug);
    setIsSlugManuallyEdited(true); // Mark as manually edited
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTripName(e.target.value);
    // If slug hasn't been manually edited, update it based on the new name
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(e.target.value));
    }
  };

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
    setError(null) // Reset any previous errors
    
    try {
      // Ensure destination_name is included
      const tripData: Partial<Trip> = {
        name: tripName,
        slug: slug,
        description: description,
        destination_id: destination?.id,
        destination_name: destination?.name, // Make sure this is correct
        start_date: dateOption === "specific" ? startDate?.toISOString() : null,
        end_date: dateOption === "specific" ? endDate?.toISOString() : null,
        date_flexibility: dateOption === "specific" ? "fixed" : dateOption,
        travelers_count: Number.parseInt(travelers) || 0,
        vibe,
        budget,
        is_public: isPublic,
        created_by: user.id, // This is set by the function now
      }

      // Simple profanity/hate speech check (replace with more robust solution if needed)
      const forbiddenWords = ["hate", "kill", "profane"]; // Example list
      const checkString = `${tripName.toLowerCase()} ${slug.toLowerCase()} ${description.toLowerCase()}`;
      if (forbiddenWords.some(word => checkString.includes(word))) {
         setError("Trip name, slug, or description contains inappropriate content.");
         setLoading(false);
         return;
      }

      console.log("Attempting to insert trip data:", tripData)
      console.log("User ID:", user.id)

      // Use a single API endpoint to create the trip and add the creator as a member
      // This avoids the RLS policy recursion by handling both operations server-side
      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripData,
          userId: user.id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error creating trip:", responseData);
        setError(responseData.error || "Failed to create trip");
        return;
      }

      const { tripId } = responseData;
      console.log("Trip created successfully with ID:", tripId);

      // 3. Redirect to success page
      router.push(`/trips/create/success?id=${tripId}`);
    } catch (error: any) {
      console.error("Error during trip creation process:", error);
      setError(error?.message || "An unexpected error occurred. Please try again.");
      
      if (error && typeof error === 'object') {
        console.error("Detailed error:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case "details": // Updated validation
        return tripName.trim().length > 0 && slug.trim().length > 0 && destination !== null
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

  const getSlideDirection = (step: number, currentStep: number) => {
    return step > currentStep ? "right" : "left";
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInLeft}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trip-name">Trip Name</Label>
                <Input
                  id="trip-name"
                  placeholder="Awesome Summer Trip"
                  value={tripName}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trip-slug">URL Friendly Name</Label>
                <div className="flex items-center space-x-1">
                  <UrlDisplay />
                  <Input
                    id="trip-slug"
                    placeholder="awesome-summer-trip"
                    value={slug}
                    onChange={handleSlugChange}
                    onFocus={() => setIsSlugManuallyEdited(true)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trip-description">Description (Optional)</Label>
                <Textarea
                  id="trip-description"
                  placeholder="What are you planning for this trip?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Destination</Label>
                <LocationSearch
                  onLocationSelect={(destination: Destination) => setDestination(destination)}
                  placeholder="Where are you going?"
                />
                {destinationLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading destination...</span>
                  </div>
                )}
                {destinationError && (
                  <div className="mt-2 text-sm text-destructive">
                    <span>{destinationError}</span>
                  </div>
                )}
                {destination && (
                  <div className="mt-2 p-2 border rounded-md bg-muted">
                    <p className="text-sm font-medium">{destination.city}, {destination.country}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      
      case 1:
        return (
          <motion.div
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInRight}
          >
            <div className="space-y-6">
              <RadioGroup value={dateOption} onValueChange={setDateOption} className="space-y-3">
                <div>
                  <RadioGroupItem value="specific" id="specific" className="peer sr-only" />
                  <Label
                    htmlFor="specific"
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Specific Dates</p>
                      <p className="text-sm text-muted-foreground">
                        I know exactly when I'm traveling
                      </p>
                    </div>
                  </Label>
                </div>

                {dateOption === "specific" && (
                  <motion.div 
                    className="grid gap-2" 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                      <div className="w-full sm:w-1/2 space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="w-full sm:w-1/2 space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              disabled={(date) => startDate ? date < startDate : false}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <RadioGroupItem value="month" id="month" className="peer sr-only" />
                  <Label
                    htmlFor="month"
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Approximate Month</p>
                      <p className="text-sm text-muted-foreground">
                        I'm flexible with exact dates but know the month
                      </p>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="season" id="season" className="peer sr-only" />
                  <Label
                    htmlFor="season"
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Approximate Season</p>
                      <p className="text-sm text-muted-foreground">
                        I know the general season I want to travel
                      </p>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="undecided" id="undecided" className="peer sr-only" />
                  <Label
                    htmlFor="undecided"
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Undecided</p>
                      <p className="text-sm text-muted-foreground">
                        I don't know when I want to travel yet
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        )
      
      case 2:
        return (
          <motion.div
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInRight}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="travelers">How many people are traveling?</Label>
                <Input
                  id="travelers"
                  placeholder="Number of travelers"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  type="number"
                  min="1"
                />
              </div>
            </div>
          </motion.div>
        )
      
      case 3:
        return (
          <motion.div
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInRight}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What's the vibe of this trip?</Label>
                <RadioGroup value={vibe} onValueChange={setVibe}>
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
          </motion.div>
        )
      
      case 4:
        return (
          <motion.div
            key="step4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInRight}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What's your budget range?</Label>
                <RadioGroup value={budget} onValueChange={setBudget}>
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
          </motion.div>
        )
      
      case 5:
        return (
          <motion.div
            key="step5"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInRight}
          >
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
          </motion.div>
        )
      
      default:
        return null
    }
  }

  // Display error alert if there's an error
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

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

  return (
    <div className="container max-w-5xl pt-12 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Plan a new trip</h1>
        <p className="text-muted-foreground mt-2">
          Let's get started by setting up your trip details.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-3/4">
          <CardHeader>
            <CardTitle className="lowercase text-travel-purple">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleNext} className="flex items-center gap-1" disabled={!isStepValid()}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.02, 1], 
                  transition: { repeat: Infinity, repeatType: "reverse", duration: 2 }
                }}
              >
                <Button onClick={handleSubmit} className="bg-travel-purple hover:bg-purple-400" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Trip
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>

        <motion.div 
          className="w-full lg:w-1/4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <CardTitle className="lowercase font-semibold">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`flex items-center gap-3 ${
                    index <= currentStep ? "cursor-pointer" : "opacity-60"
                  }`}
                  onClick={() => handleStepJump(index)}
                  whileHover={index <= currentStep ? { x: 5 } : {}}
                >
                  {index < currentStep ? (
                    <motion.div variants={bounceIn} initial="hidden" animate="visible">
                      <CircleCheck className="h-5 w-5 text-green-500" />
                    </motion.div>
                  ) : index === currentStep ? (
                    <div className="h-5 w-5 rounded-full bg-travel-purple flex items-center justify-center text-white text-xs">
                      {index + 1}
                    </div>
                  ) : (
                    <CircleDashed className="h-5 w-5 text-muted-foreground" />
                  )}
                  <p className="text-sm">{step.title}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {renderError()}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Default export wraps the main content with Suspense
export default function CreateTripPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}> 
      <CreateTripPageContent />
    </Suspense>
  );
}
