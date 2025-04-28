"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { DatePicker } from "@/components/ui/date-picker" // Temporarily commented out
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DB_TABLES, DB_FIELDS, PAGE_ROUTES } from "@/utils/constants"; // Import constants
import { Tag } from "lucide-react" // Import Tag icon
import { ImageSearchSelector } from '@/components/images/image-search-selector'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

// 1. Define Zod Schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  tags: z.array(z.string()),
  cover_image_url: z.string().optional()
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date cannot be earlier than start date",
  path: ["end_date"]
});

type FormValues = z.infer<typeof formSchema>

interface TripTemplate {
  id: string
  name: string
  description: string
  defaultValues: FormValues
}

const getTodayFormatted = () => new Date().toISOString().split('T')[0];
const getDateFormatted = (daysFromNow: number) => 
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const TRIP_TEMPLATES: TripTemplate[] = [
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    description: 'A quick weekend trip with basic itinerary structure',
    defaultValues: {
      title: 'Weekend Getaway',
      description: 'A relaxing weekend escape',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(2),
      tags: ['weekend', 'relaxation'],
      cover_image_url: ''
    }
  },
  {
    id: 'week-long-adventure',
    name: 'Week-long Adventure', 
    description: 'A full week of exploration and activities',
    defaultValues: {
      title: 'Week-long Adventure',
      description: 'An exciting week of exploration and discovery',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(7),
      tags: ['adventure', 'exploration'],
      cover_image_url: ''
    }
  },
  {
    id: 'road-trip',
    name: 'Road Trip',
    description: 'A classic road trip template',
    defaultValues: {
      title: 'Road Trip Adventure', 
      description: 'An epic journey on the open road',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(5),
      tags: ['road-trip', 'driving'],
      cover_image_url: ''
    }
  }
]

export function CreateTripForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false)

  // Initialize form first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(1),
      tags: [],
      cover_image_url: ''
    }
  })

  // Add local storage for form persistence
  const FORM_STORAGE_KEY = 'trip-form-draft'
  
  // Load saved form data on mount
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY)
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm)
      form.reset(parsedForm)
    }
  }, [form])

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Function to apply template
  const applyTemplate = (templateId: string) => {
    const template = TRIP_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    form.setValue("title", template.defaultValues?.title || "");
    form.setValue("description", template.defaultValues?.description || "");
    form.setValue("start_date", template.defaultValues?.start_date || "");
    form.setValue("end_date", template.defaultValues?.end_date || "");
    form.setValue("tags", template.defaultValues?.tags || []);
  }

  // Watch cover image URL for preview
  const currentCoverImageUrl = form.watch('cover_image_url');

  // 3. Define onSubmit handler
  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
       // Make fetch call to the backend API route
       const response = await fetch('/api/trips/create', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            ...values, // Send all form values
            cover_image_url: values.cover_image_url || null // Ensure it's sent
          }), 
       });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
         throw new Error(errorData.error || `Failed to create trip: ${response.statusText}`);
       }

       const result = await response.json();
       const newTripId = result.trip?.id;

       if (!newTripId) {
          console.error("API did not return a trip ID:", result);
          throw new Error("Trip created, but failed to get confirmation ID.");
       }

       toast({ title: "Success", description: "Trip created successfully!" });
       router.push(redirectTo || PAGE_ROUTES.TRIP_DETAILS(newTripId)); // Use actual ID

    } catch (error: unknown) {
       console.error("Form submission error:", error);
       const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
       toast({
         title: "Error creating trip",
         description: errorMessage,
         variant: "destructive",
       })
     } finally {
       setLoading(false)
     }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Trip</CardTitle>
            <CardDescription>
              Get started with a new trip or use a template below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Vacation in Italy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your trip plans..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        {/* <DatePicker ... /> */}
                        <Input 
                          type="date" 
                          // Exclude value/onChange from field spread
                          {...{...field, value: undefined, onChange: undefined}} 
                          // Manually set value, formatting from ISO string to yyyy-mm-dd
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                          // Manually set onChange, converting yyyy-mm-dd back to ISO string
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        {/* <DatePicker ... /> */}
                        <Input 
                          type="date"
                           // Exclude value/onChange from field spread
                          {...{...field, value: undefined, onChange: undefined}}
                          // Manually set value, formatting from ISO string to yyyy-mm-dd
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                           // Manually set onChange, converting yyyy-mm-dd back to ISO string
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
                          }}
                          min={form.watch('start_date') ? form.watch('start_date').split('T')[0] : undefined} // Ensure min is yyyy-mm-dd
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Cover Image Field - Re-adding UI */}
               <FormItem>
                  <FormLabel>Cover Image (Optional)</FormLabel>
                  <div className="flex items-center gap-4">
                    {/* Preview Area */} 
                    <div className="w-32 h-20 rounded border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {currentCoverImageUrl ? (
                        <Image 
                          src={currentCoverImageUrl}
                          alt="Selected cover image"
                          width={128}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    {/* Button to open selector */} 
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsImageSelectorOpen(true)}
                    >
                      Select Image
                    </Button>
                  </div>
                  {/* Hidden input registered with RHF for validation */}
                   <FormControl>
                     <input type="hidden" {...form.register('cover_image_url')} />
                   </FormControl>
                   {/* Error message display */}
                  <FormMessage />
                </FormItem>

               {/* Add Tags Field */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Tags (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., beach, hiking, family fun" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Trip"}
          </Button>
        </CardFooter>
      </form>
       {/* Image Selector Component - Re-adding */}
      <ImageSearchSelector 
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onImageSelect={(selectedUrl) => {
          form.setValue('cover_image_url', selectedUrl, { shouldValidate: true });
        }}
        // Use trip title as initial search, fallback to 'travel'
        initialSearchTerm={form.getValues('title') || 'travel'} 
      />
    </Form>
  )
} 