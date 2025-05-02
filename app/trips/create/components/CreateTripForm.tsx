'use client';
import { PAGE_ROUTES } from '@/utils/constants/routes';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Image, MapPin, Tag } from 'lucide-react';
import { ImageSearchSelector } from '@/components/images/image-search-selector';
import NextImage from 'next/image';
import { PlaceSearch } from '@/components/place-search';

// Define the form schema
const formSchema = z
  .object({
    // Step 1: Essential Information
    title: z.string().min(1, 'Trip name is required'),
    destination_id: z.string().uuid('Please select a valid destination').or(z.string().length(0)),
    destination_name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),

    // Step 2: Trip Details
    description: z.string().optional(),
    cover_image_url: z.string().optional(),
    tags: z.string().optional(),
    trip_type: z.string().optional(),

    // Step 3: Preferences
    privacy_setting: z.enum(['private', 'shared_with_link', 'public']).default('private'),
    travelers_count: z.coerce.number().int().positive().default(1),
    budget: z.string().optional(),
    trip_emoji: z.string().optional(),
    color_scheme: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate dates if both are provided
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['end_date'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

// Trip templates for quick start
const getTodayFormatted = () => new Date().toISOString().split('T')[0];
const getDateFormatted = (daysFromNow: number) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const TRIP_TEMPLATES = [
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    description: 'A quick weekend trip with basic itinerary structure',
    defaultValues: {
      title: 'Weekend Getaway',
      description: 'A relaxing weekend escape',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(2),
      tags: 'weekend, relaxation',
      trip_type: 'leisure',
      destination_id: '',
    },
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
      tags: 'adventure, exploration',
      trip_type: 'adventure',
      destination_id: '',
    },
  },
  {
    id: 'business-trip',
    name: 'Business Trip',
    description: 'Organized business travel template',
    defaultValues: {
      title: 'Business Trip',
      description: 'Business travel with meetings and events',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(3),
      tags: 'business, work',
      trip_type: 'business',
      privacy_setting: 'private' as const,
      destination_id: '',
    },
  },
];

const TRIP_TYPES = [
  { value: 'leisure', label: '🏖️ Leisure' },
  { value: 'adventure', label: '🧗‍♀️ Adventure' },
  { value: 'business', label: '💼 Business' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
  { value: 'romantic', label: '💖 Romantic' },
  { value: 'solo', label: '🧘 Solo' },
];

const PRIVACY_OPTIONS = [
  {
    value: 'private',
    label: '🔒 Private',
    description: 'Just between us - only invited members can see this trip',
  },
  {
    value: 'shared_with_link',
    label: '🔗 Shared with Link',
    description: 'Anyone with the magic link can peek at a simplified version',
  },
  {
    value: 'public',
    label: '🌎 Public',
    description: 'Share your adventures with the world - anyone can find and view it',
  },
];

// Component to display the summary
const TripSummary = ({
  values,
  currentStep,
}: {
  values: Partial<FormValues>;
  currentStep: number;
}) => {
  const summaryItems = useMemo(
    () => [
      { label: '✏️ Name', value: values.title, step: 1 },
      {
        label: '📍 Destination',
        value: values.destination_name || (values.destination_id ? 'Selected' : ''),
        step: 1,
      },
      {
        label: '🗓️ Dates',
        value:
          values.start_date || values.end_date
            ? `${values.start_date || '?'} - ${values.end_date || '?'}`
            : '',
        step: 1,
      },
      {
        label: '🧳 Type',
        value: TRIP_TYPES.find((t) => t.value === values.trip_type)?.label || '',
        step: 2,
      },
      {
        label: '📝 Desc',
        value: values.description ? `${values.description.substring(0, 30)}...` : '',
        step: 2,
      },
      { label: '🖼️ Image', value: values.cover_image_url ? 'Set' : '', step: 2 },
      { label: '🏷️ Tags', value: values.tags, step: 2 },
      {
        label: '🔐 Privacy',
        value: PRIVACY_OPTIONS.find((p) => p.value === values.privacy_setting)?.label || '',
        step: 3,
      },
      { label: '👥 Travelers', value: values.travelers_count?.toString(), step: 3 },
      {
        label: '💰 Budget',
        value: values.budget ? values.budget.charAt(0).toUpperCase() + values.budget.slice(1) : '',
        step: 3,
      },
      { label: '✨ Emoji', value: values.trip_emoji, step: 3 },
    ],
    [values]
  );

  const visibleSummaryItems = summaryItems.filter((item) => item.value && item.step < currentStep);

  if (visibleSummaryItems.length === 0 && currentStep === 1) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-lg h-full flex items-center justify-center bg-muted/30">
        Fill out Step 1 to see details here...
      </div>
    );
  }

  if (visibleSummaryItems.length === 0) {
    return null; // Don't show empty summary on later steps if nothing entered before
  }

  return (
    <div className="space-y-2 p-4 border rounded-lg h-full bg-muted/30">
      <h3 className="font-semibold mb-2 text-base">Your Trip So Far:</h3>
      {visibleSummaryItems.map((item) => (
        <div key={item.label} className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">{item.label}:</span>
          <span className="text-right truncate ml-2">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CreateTripForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      destination_id: '',
      destination_name: '',
      description: '',
      start_date: getTodayFormatted(),
      end_date: getDateFormatted(1),
      tags: '',
      cover_image_url: '',
      privacy_setting: 'private',
      travelers_count: 1,
      budget: '',
      trip_emoji: '',
      trip_type: '',
      color_scheme: '',
    },
  });

  // Form persistence in localStorage
  const FORM_STORAGE_KEY = 'trip-form-draft';

  // Load saved form data on mount
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        const baseSchema = formSchema._def.schema; // Access the base ZodObject
        const validatedData = baseSchema.partial().safeParse(parsedForm);

        if (validatedData.success) {
          form.reset(validatedData.data);
        } else {
          console.warn(
            'Invalid data found in localStorage, resetting form.',
            validatedData.error.issues
          );
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, [form]);

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Apply template function
  const applyTemplate = (templateId: string) => {
    const template = TRIP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Get current form values
    const currentValues = form.getValues();

    // Create new values with proper typing
    const newValues = {
      ...currentValues,
      ...template.defaultValues,
      title: template.defaultValues.title || '',
      destination_id: template.defaultValues.destination_id || '',
      description: template.defaultValues.description || '',
      start_date: template.defaultValues.start_date || getTodayFormatted(),
      end_date: template.defaultValues.end_date || getDateFormatted(1),
      tags: template.defaultValues.tags || '',
    };

    // Reset the form with typed values
    form.reset(newValues);
  };

  // Watch form values for summary
  const watchedValues = form.watch();
  const currentCoverImageUrl = watchedValues.cover_image_url;

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Process tags into array
      const tagsArray = values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
        : [];

      // Submit to API
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          tags: tagsArray,
          cover_image_url: values.cover_image_url || null,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Failed to create trip: ${response.statusText}`);
      }

      const result = await response.json();
      const newTripId = result.trip?.id;

      if (!newTripId) {
        throw new Error('Trip created, but failed to get confirmation ID.');
      }

      // Clear form data from localStorage upon successful submission
      localStorage.removeItem(FORM_STORAGE_KEY);

      toast({ title: 'Success', description: 'Trip created successfully!' });
      router.push(redirectTo || PAGE_ROUTES.TRIP_DETAILS(newTripId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error creating trip',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick Create submission handler
  const handleQuickSubmit = async () => {
    // Validate only essential fields
    const result = await form.trigger(['title', 'destination_id']);
    if (!result) {
      toast({
        title: 'Missing Info',
        description: 'Please provide a Trip Name and Destination.',
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    const values = form.getValues();
    try {
      const quickCreateData = {
        title: values.title,
        destination_id: values.destination_id,
        destination_name: values.destination_name,
        // Add any other essential defaults you want for quick create
        privacy_setting: values.privacy_setting || 'private',
        travelers_count: values.travelers_count || 1,
      };

      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickCreateData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Failed to create trip: ${response.statusText}`);
      }

      const createdResult = await response.json();
      const newTripId = createdResult.trip?.id;

      if (!newTripId) {
        throw new Error('Trip created quickly, but failed to get confirmation ID.');
      }

      localStorage.removeItem(FORM_STORAGE_KEY);
      toast({ title: 'Success!', description: 'Basic trip created quickly!' });
      router.push(redirectTo || PAGE_ROUTES.TRIP_DETAILS(newTripId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error during Quick Create',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle next step validation
  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    // Determine which fields to validate based on current step
    switch (step) {
      case 1:
        fieldsToValidate = ['title', 'destination_id', 'start_date', 'end_date'];
        break;
      case 2:
        fieldsToValidate = ['description', 'cover_image_url', 'tags', 'trip_type'];
        break;
      default:
        break;
    }

    // Validate only the fields for the current step
    const result = await form.trigger(fieldsToValidate as any);

    if (result) {
      setStep(step + 1);
    }
  };

  // Step back without validation
  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] py-8">
      <div className="max-w-3xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center relative max-w-xl mx-auto">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className="flex flex-col items-center z-10"
                onClick={() => stepNumber < step && setStep(stepNumber)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300 
                    ${
                      step >= stepNumber
                        ? 'bg-primary text-primary-foreground shadow-md scale-110'
                        : 'bg-muted text-muted-foreground'
                    } 
                    ${stepNumber < step ? 'cursor-pointer hover:scale-105' : ''}
                  `}
                >
                  {step > stepNumber ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-medium">
                      {stepNumber === 1 ? '✨' : stepNumber === 2 ? '🎨' : '🔍'}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${step === stepNumber ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {stepNumber === 1 ? 'Basics' : stepNumber === 2 ? 'Details' : 'Final'}
                </span>
              </div>
            ))}

            <div
              className="h-0.5 bg-muted absolute left-0 right-0 top-5 -z-0"
              style={{ width: 'calc(100% - 80px)', margin: '0 40px' }}
            ></div>
            <div
              className="h-1 bg-primary absolute left-0 top-5 -z-0 transition-all duration-500"
              style={{
                width: step === 1 ? '0%' : step === 2 ? 'calc(50% - 40px)' : 'calc(100% - 80px)',
                left: '40px',
              }}
            ></div>
          </div>
        </div>

        <FormProvider {...form}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:col-span-2">
              <Card className="shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-0.5"></div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {step === 1 ? (
                      <>✨ Let's Get Started</>
                    ) : step === 2 ? (
                      <>🎨 Add Some Color</>
                    ) : (
                      <>🔍 Final Details</>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {step === 1
                      ? 'Essential details for your trip'
                      : step === 2
                        ? 'Add personality to your trip'
                        : 'Set preferences for your trip'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-4">
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="template" className="text-sm flex items-center gap-1">
                          <span>🚀 Quick Start</span>
                        </Label>
                        <Select onValueChange={applyTemplate}>
                          <SelectTrigger id="template" className="h-9">
                            <SelectValue>
                              <span className="text-muted-foreground text-sm">
                                Choose a template
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {TRIP_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>✏️ Trip Name</span>
                              <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Your trip name" className="h-9" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="destination_id"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>📍 Destination</span>
                              <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <PlaceSearch
                                onPlaceSelect={(selectedPlace) => {
                                  if (selectedPlace) {
                                    field.onChange(selectedPlace.placeId);
                                    form.setValue('destination_name', selectedPlace.name);
                                  } else {
                                    field.onChange('');
                                    form.setValue('destination_name', '');
                                  }
                                }}
                                placeholder="Search for a destination"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-sm flex items-center gap-1">
                                <span>🗓️ Start</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="date" className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-sm flex items-center gap-1">
                                <span>🏁 End</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-9"
                                  {...field}
                                  min={form.watch('start_date')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="trip_type"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>🧳 Trip Type</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue>
                                    <span className="text-muted-foreground text-sm">
                                      Select type
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRIP_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>📝 Description</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What's this trip about?"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cover_image_url"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>🖼️ Cover Image</span>
                            </FormLabel>
                            <div className="flex flex-col gap-2">
                              {currentCoverImageUrl ? (
                                <div className="relative w-full h-36 rounded-md overflow-hidden border border-muted shadow-sm group">
                                  <NextImage
                                    src={currentCoverImageUrl}
                                    alt="Trip cover image"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setIsImageSelectorOpen(true)}
                                    >
                                      Change
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="w-full h-36 border border-dashed border-primary/50 rounded-md flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => setIsImageSelectorOpen(true)}
                                >
                                  <div className="flex flex-col items-center text-muted-foreground">
                                    <Image className="h-8 w-8 mb-1" />
                                    <span className="text-sm">Add an image</span>
                                  </div>
                                </div>
                              )}

                              {!currentCoverImageUrl && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsImageSelectorOpen(true)}
                                  className="mx-auto"
                                >
                                  Browse Images
                                </Button>
                              )}
                            </div>

                            <input type="hidden" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>🏷️ Tags</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="beach, hiking, foodie..."
                                className="h-9"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Comma-separated tags
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="privacy_setting"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>🔐 Privacy</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                              >
                                {PRIVACY_OPTIONS.map((option) => (
                                  <FormItem
                                    key={option.value}
                                    className="flex items-start space-x-2 space-y-0 rounded-md border p-2 hover:bg-muted/50 transition-colors"
                                  >
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <div>
                                      <FormLabel className="text-sm font-normal">
                                        {option.label}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {option.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="travelers_count"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>👥 Travelers</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                className="h-9"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>💰 Budget</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue>
                                    <span className="text-muted-foreground text-sm">
                                      Select budget
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="budget">🪙 Budget Friendly</SelectItem>
                                <SelectItem value="moderate">💵 Moderate</SelectItem>
                                <SelectItem value="luxury">💎 Luxury</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="trip_emoji"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-sm flex items-center gap-1">
                              <span>✨ Trip Emoji</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose an emoji"
                                {...field}
                                maxLength={4}
                                className="h-9 text-xl text-center"
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-center">
                              Try 🏖️ 🏔️ 🌆 🛫 🏰 🧳
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between bg-muted/10 p-3">
                  {step === 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleQuickSubmit}
                      disabled={loading}
                    >
                      ⚡ Quick Create
                    </Button>
                  ) : step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step < 3 ? (
                    <Button type="button" size="sm" onClick={handleNext} disabled={loading}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary/90"
                    >
                      {loading ? 'Creating...' : '✨ Create Trip'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>

            <div className="hidden md:block md:col-span-1">
              <TripSummary values={watchedValues} currentStep={step} />
            </div>
          </div>
        </FormProvider>

        <ImageSearchSelector
          isOpen={isImageSelectorOpen}
          onClose={() => setIsImageSelectorOpen(false)}
          onImageSelect={(selectedUrl) => {
            form.setValue('cover_image_url', selectedUrl, { shouldValidate: true });
            setIsImageSelectorOpen(false);
          }}
          initialSearchTerm={
            form.getValues('title') || form.getValues('destination_name') || 'travel'
          }
        />
      </div>
    </div>
  );
}
