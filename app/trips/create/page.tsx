"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { LocationSearch } from "@/components/location-search"
import { Switch } from "@/components/ui/switch"

const steps = [
  { id: "name", title: "Trip Name" },
  { id: "destination", title: "Destination" },
  { id: "dates", title: "Dates" },
  { id: "travelers", title: "Travel Buddies" },
  { id: "vibe", title: "Trip Vibe" },
  { id: "budget", title: "Budget Range" },
  { id: "privacy", title: "Privacy Settings" },
]

export default function CreateTripPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [tripName, setTripName] = useState("")
  const [destination, setDestination] = useState<any>(null)
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

      const { data, error } = await supabase.from("trips").insert(tripData).select()

      if (error) throw error

      router.push(`/trips/create/success?id=${data[0].id}`)
    } catch (error) {
      console.error("Error creating trip:", error)
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case "name":
        return tripName.trim().length > 0
      case "destination":
        return destination !== null
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
      case "name":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trip-name">What are we calling this adventure?</Label>
              <Input
                id="trip-name"
                placeholder="Summer in Barcelona"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
          </div>
        )
      case "destination":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Where are you headed?</Label>
              <LocationSearch onSelect={setDestination} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Card
                className="cursor-pointer hover:bg-accent"
                onClick={() => setDestination({ id: 1, name: "Barcelona, Spain" })}
              >
                <CardContent className="p-4 text-center">Barcelona</CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-accent"
                onClick={() => setDestination({ id: 2, name: "Tokyo, Japan" })}
              >
                <CardContent className="p-4 text-center">Tokyo</CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-accent"
                onClick={() => setDestination({ id: 3, name: "Paris, France" })}
              >
                <CardContent className="p-4 text-center">Paris</CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-accent"
                onClick={() => setDestination({ id: 4, name: "New York, USA" })}
              >
                <CardContent className="p-4 text-center">New York</CardContent>
              </Card>
            </div>
          </div>
        )
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
        return (
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
        )
      case "budget":
        return (
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
        )
      case "privacy":
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

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Trip</CardTitle>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{steps[currentStep].title}</span>
          </div>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!isStepValid() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!isStepValid()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
