"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SubmitItineraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    duration: "",
    groupSize: "",
    category: "",
    tags: [""],
    days: [
      {
        title: "Day 1",
        activities: [
          {
            time: "",
            title: "",
            description: "",
            location: ""
          }
        ]
      }
    ]
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    setFormData(prev => ({ ...prev, tags: newTags }))
  }
  
  const addTag = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ""] }))
  }
  
  const removeTag = (index: number) => {
    const newTags = [...formData.tags]
    newTags.splice(index, 1)
    setFormData(prev => ({ ...prev, tags: newTags }))
  }
  
  const handleDayTitleChange = (index: number, value: string) => {
    const newDays = [...formData.days]
    newDays[index].title = value
    setFormData(prev => ({ ...prev, days: newDays }))
  }
  
  const addDay = () => {
    const newDay = {
      title: `Day ${formData.days.length + 1}`,
      activities: [
        {
          time: "",
          title: "",
          description: "",
          location: ""
        }
      ]
    }
    setFormData(prev => ({ ...prev, days: [...prev.days, newDay] }))
  }
  
  const removeDay = (index: number) => {
    const newDays = [...formData.days]
    newDays.splice(index, 1)
    setFormData(prev => ({ ...prev, days: newDays }))
  }
  
  const handleActivityChange = (dayIndex: number, activityIndex: number, field: keyof typeof formData.days[number]['activities'][number], value: string) => {
    const newDays = [...formData.days]
    newDays[dayIndex].activities[activityIndex][field] = value
    setFormData(prev => ({ ...prev, days: newDays }))
  }
  
  const addActivity = (dayIndex: number) => {
    const newDays = [...formData.days]
    newDays[dayIndex].activities.push({
      time: "",
      title: "",
      description: "",
      location: ""
    })
    setFormData(prev => ({ ...prev, days: newDays }))
  }
  
  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...formData.days]
    newDays[dayIndex].activities.splice(activityIndex, 1)
    setFormData(prev => ({ ...prev, days: newDays }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In a real app, you would submit to your API here
      // await fetch('/api/itineraries', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Itinerary submitted!",
        description: "Thank you for sharing your travel experience with the community.",
      })
      
      router.push("/itineraries")
    } catch (error) {
      console.error("Error submitting itinerary:", error)
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your itinerary. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-10">
      <PageHeader 
        heading="submit your itinerary" 
        description="share your travel experience with the community" 
      />
      
      <form onSubmit={handleSubmit} className="mt-8 max-w-4xl mx-auto">
        <Tabs defaultValue="basic" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Itinerary Title</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="e.g., Weekend in Paris" 
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        placeholder="e.g., Paris, France" 
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Briefly describe your itinerary" 
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select 
                        value={formData.duration} 
                        onValueChange={(value) => handleSelectChange("duration", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 day">1 day</SelectItem>
                          <SelectItem value="2 days">2 days</SelectItem>
                          <SelectItem value="3 days">3 days</SelectItem>
                          <SelectItem value="4 days">4 days</SelectItem>
                          <SelectItem value="5 days">5 days</SelectItem>
                          <SelectItem value="6 days">6 days</SelectItem>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="8+ days">8+ days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="groupSize">Ideal Group Size</Label>
                      <Select 
                        value={formData.groupSize} 
                        onValueChange={(value) => handleSelectChange("groupSize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select group size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2 people">2 people</SelectItem>
                          <SelectItem value="2-4 people">2-4 people</SelectItem>
                          <SelectItem value="4-6 people">4-6 people</SelectItem>
                          <SelectItem value="6-8 people">6-8 people</SelectItem>
                          <SelectItem value="8+ people">8+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city">City Break</SelectItem>
                          <SelectItem value="beach">Beach</SelectItem>
                          <SelectItem value="road-trip">Road Trip</SelectItem>
                          <SelectItem value="nature">Nature & Outdoors</SelectItem>
                          <SelectItem value="culture">Cultural</SelectItem>
                          <SelectItem value="food">Food & Drink</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags (up to 5)</Label>
                    <div className="space-y-3">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <Input 
                            placeholder="e.g., romantic, food, culture" 
                            value={tag}
                            onChange={(e) => handleTagChange(index, e.target.value)}
                          />
                          {formData.tags.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeTag(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {formData.tags.length < 5 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addTag}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Tag
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="itinerary">
            <div className="space-y-8">
              {formData.days.map((day, dayIndex) => (
                <Card key={dayIndex}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Day {dayIndex + 1}</span>
                        <Input 
                          placeholder="Day title" 
                          className="max-w-xs"
                          value={day.title}
                          onChange={(e) => handleDayTitleChange(dayIndex, e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Button type="submit" disabled={isSubmitting} className="w-full mt-8">
          {isSubmitting ? "Submitting..." : "Submit Itinerary"}
        </Button>
      </form>
    </div>
  )
}
