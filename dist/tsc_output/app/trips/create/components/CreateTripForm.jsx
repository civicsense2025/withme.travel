"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { DatePicker } from "@/components/ui/date-picker" // Temporarily commented out
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DB_FIELDS, PAGE_ROUTES } from "@/utils/constants"; // Import constants
import { Tag } from "lucide-react"; // Import Tag icon
// 1. Define Zod Schema
const formSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100),
    description: z.string().min(5, { message: 'Description must be at least 5 characters.' }).max(500),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
    tags: z.string().optional(), // Add optional tags string field
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date cannot be earlier than start date",
    path: ["end_date"], // Indicate which field the error applies to
});
export function CreateTripForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo");
    // 2. Initialize useForm
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            start_date: "",
            end_date: "",
            tags: "", // Add default value for tags
        },
    });
    // 3. Define onSubmit handler
    const onSubmit = async (values) => {
        var _a;
        setLoading(true);
        try {
            // Make fetch call to the backend API route
            const response = await fetch('/api/trips/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values), // Send all form values
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || `Failed to create trip: ${response.statusText}`);
            }
            const result = await response.json();
            const newTripId = (_a = result.trip) === null || _a === void 0 ? void 0 : _a.id;
            if (!newTripId) {
                console.error("API did not return a trip ID:", result);
                throw new Error("Trip created, but failed to get confirmation ID.");
            }
            toast({ title: "Success", description: "Trip created successfully!" });
            router.push(redirectTo || PAGE_ROUTES.TRIP_DETAILS(newTripId)); // Use actual ID
        }
        catch (error) {
            console.error("Form submission error:", error);
            toast({
                title: "Error creating trip",
                description: (error === null || error === void 0 ? void 0 : error.message) || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (<Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Trip</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> 
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer Vacation in Italy" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your trip plans..." {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date" render={({ field }) => (<FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      {/* <DatePicker ... /> */}
                      <Input type="date" 
        // Exclude value/onChange from field spread
        {...Object.assign(Object.assign({}, field), { value: undefined, onChange: undefined })} 
        // Manually set value, formatting from ISO string to yyyy-mm-dd
        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
        // Manually set onChange, converting yyyy-mm-dd back to ISO string
        onChange={(e) => {
                field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
            }}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
              <FormField control={form.control} name="end_date" render={({ field }) => (<FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      {/* <DatePicker ... /> */}
                      <Input type="date" 
        // Exclude value/onChange from field spread
        {...Object.assign(Object.assign({}, field), { value: undefined, onChange: undefined })} 
        // Manually set value, formatting from ISO string to yyyy-mm-dd
        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
        // Manually set onChange, converting yyyy-mm-dd back to ISO string
        onChange={(e) => {
                field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
            }} min={form.watch('start_date') ? form.watch('start_date').split('T')[0] : undefined} // Ensure min is yyyy-mm-dd
        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>
             {/* Add Tags Field */}
            <FormField control={form.control} name="tags" render={({ field }) => (<FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Tag className="h-4 w-4"/> Tags (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., beach, hiking, family fun" {...field}/>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                  <FormMessage />
                </FormItem>)}/>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>);
}
