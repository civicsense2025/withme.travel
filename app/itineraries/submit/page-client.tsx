'use client';

import { API_ROUTES } from '@/utils/constants/routes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical as DragHandleDots2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationSearch } from '@/components/location-search';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  position: number;
  category: string;
}

interface Section {
  id: string;
  day_number: number;
  title: string;
  position: number;
  activities: Activity[];
}

export function CreateItineraryClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);

  const [itinerary, setItinerary] = useState({
    title: '',
    slug: '',
    description: '',
    destination_id: '',
    destination_name: '',
    destination_city: '',
    destination_country: '',
    duration_days: 3,
    category: 'city',
    is_published: false,
  });

  const [sections, setSections] = useState<Section[]>([]);

  // Initialize sections based on duration days
  useEffect(() => {
    // Only generate if sections are empty AND duration is set
    if (!sections.length && itinerary.duration_days > 0) {
      generateSections(itinerary.duration_days);
    }
    // The effect should run if duration changes OR if sections become empty
  }, [itinerary.duration_days, sections.length]); // Add missing dependencies

  const generateSections = (days: number) => {
    const newSections = Array.from({ length: days }, (_, i) => ({
      id: `day-${i + 1}-${Date.now()}`,
      day_number: i + 1,
      title: `Day ${i + 1}`,
      position: i,
      activities: [],
    }));

    setSections(newSections);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setItinerary({
      ...itinerary,
      title,
      slug: generateSlug(title),
    });
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleDestinationSelect = (destination: any) => {
    setItinerary({
      ...itinerary,
      destination_id: destination.id,
      destination_name: `${destination.city}, ${destination.country}`,
      destination_city: destination.city,
      destination_country: destination.country,
    });
  };

  const handleDurationChange = (value: string) => {
    const days = parseInt(value);
    setItinerary({
      ...itinerary,
      duration_days: days,
    });

    // If increasing days, add new sections
    if (days > sections.length) {
      const newSections = [...sections];
      for (let i = sections.length; i < days; i++) {
        newSections.push({
          id: `day-${i + 1}-${Date.now()}`,
          day_number: i + 1,
          title: `Day ${i + 1}`,
          position: i,
          activities: [],
        });
      }
      setSections(newSections);
    }
    // If decreasing days, remove sections
    else if (days < sections.length) {
      setSections(sections.slice(0, days));
    }
  };

  const handleSectionTitleChange = (sectionIndex: number, title: string) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].title = title;
    setSections(updatedSections);
  };

  const handleAddActivity = (sectionIndex: number) => {
    const updatedSections = [...sections];
    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: '',
      description: '',
      location: '',
      start_time: '',
      position: updatedSections[sectionIndex].activities.length,
      category: 'activity',
    };

    updatedSections[sectionIndex].activities.push(newActivity);
    setSections(updatedSections);
  };

  const handleActivityChange = (
    sectionIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string
  ) => {
    const updatedSections = [...sections];
    const activityToUpdate = updatedSections[sectionIndex].activities[activityIndex];

    // Handle type conversion for 'position' field
    if (field === 'position') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        activityToUpdate[field] = numValue;
      } else {
        // Optionally handle error: log, show toast, or ignore invalid input
        console.warn(`Invalid number provided for position: ${value}`);
        // Potentially return early or skip update for this field
      }
    } else {
      // Assign string value directly for other fields
      // Type assertion needed because TS can't infer field corresponds to a string property
      (activityToUpdate as any)[field] = value;
    }

    setSections(updatedSections);
  };

  const handleDeleteActivity = (sectionIndex: number, activityIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].activities.splice(activityIndex, 1);

    // Update positions
    updatedSections[sectionIndex].activities.forEach((activity, idx) => {
      activity.position = idx;
    });

    setSections(updatedSections);
  };

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    // If moving within the same section
    if (sourceDroppableId === destinationDroppableId) {
      const sectionIndex = parseInt(sourceDroppableId.split('-')[1]);
      const updatedSections = [...sections];
      const [removed] = updatedSections[sectionIndex].activities.splice(source.index, 1);
      updatedSections[sectionIndex].activities.splice(destination.index, 0, removed);

      // Update positions
      updatedSections[sectionIndex].activities.forEach((activity, idx) => {
        activity.position = idx;
      });

      setSections(updatedSections);
    }
    // If moving between sections
    else {
      const sourceSectionIndex = parseInt(sourceDroppableId.split('-')[1]);
      const destinationSectionIndex = parseInt(destinationDroppableId.split('-')[1]);

      const updatedSections = [...sections];
      const [removed] = updatedSections[sourceSectionIndex].activities.splice(source.index, 1);
      updatedSections[destinationSectionIndex].activities.splice(destination.index, 0, removed);

      // Update positions for both sections
      updatedSections[sourceSectionIndex].activities.forEach((activity, idx) => {
        activity.position = idx;
      });

      updatedSections[destinationSectionIndex].activities.forEach((activity, idx) => {
        activity.position = idx;
      });

      setSections(updatedSections);
    }
  };

  const validateItinerary = () => {
    if (!itinerary.title.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please provide a title for your itinerary',
        variant: 'destructive',
      });
      setCurrentTab('details');
      return false;
    }

    if (!itinerary.destination_id) {
      toast({
        title: 'Missing destination',
        description: 'Please select a destination for your itinerary',
        variant: 'destructive',
      });
      setCurrentTab('details');
      return false;
    }

    // Check if at least one section has activities
    const hasActivities = sections.some((section) => section.activities.length > 0);
    if (!hasActivities) {
      toast({
        title: 'No activities',
        description: 'Please add at least one activity to your itinerary',
        variant: 'destructive',
      });
      setCurrentTab('schedule');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateItinerary()) return;

    setIsLoading(true);

    try {
      const payload = {
        title: itinerary.title,
        slug: itinerary.slug,
        description: itinerary.description,
        destination_id: itinerary.destination_id,
        duration_days: itinerary.duration_days,
        category: itinerary.category,
        is_published: itinerary.is_published,
        sections: sections.map((section) => ({
          day_number: section.day_number,
          title: section.title,
          position: section.position,
          items: section.activities.map((activity) => ({
            title: activity.title,
            description: activity.description,
            location: activity.location,
            start_time: activity.start_time,
            position: activity.position,
            category: activity.category,
          })),
        })),
      };

      const response = await fetch(API_ROUTES.ITINERARIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create itinerary');
      }

      const data = await response.json();

      toast({
        title: 'Success!',
        description: 'Your itinerary has been created successfully',
      });

      router.push(`/itineraries/${data.data.slug}`);
    } catch (error) {
      console.error('Error creating itinerary:', error);
      // Check if error is an instance of Error before accessing message
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="mb-6">Please log in to create an itinerary</p>
        <Button onClick={() => router.push('/login?redirect=/itineraries/submit')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create Itinerary</h1>
        <p className="text-muted-foreground">
          Share your travel expertise by creating a detailed itinerary that others can use
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Basic Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Itinerary Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Barcelona: Architecture, Culture & Coastal Vibes - 5 Days"
                  value={itinerary.title}
                  onChange={handleTitleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="URL-friendly version of your title"
                  value={itinerary.slug}
                  onChange={(e) => setItinerary({ ...itinerary, slug: e.target.value })}
                />
                <span className="text-xs text-muted-foreground">
                  This will be used in the URL: withme.travel/itineraries/
                  {itinerary.slug || 'your-slug'}
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief overview of this itinerary"
                  rows={4}
                  value={itinerary.description}
                  onChange={(e) => setItinerary({ ...itinerary, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Destination *</Label>
                <LocationSearch
                  onLocationSelect={handleDestinationSelect}
                  initialValue={itinerary.destination_name}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Select
                    value={itinerary.duration_days.toString()}
                    onValueChange={handleDurationChange}
                  >
                    <SelectTrigger>
                      <SelectValue>Select duration</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(30)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i === 0 ? 'day' : 'days'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={itinerary.category}
                    onValueChange={(value) => setItinerary({ ...itinerary, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>Select category</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="food">Food & Drink</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="relaxation">Relaxation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentTab('schedule')}>Continue to Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="mb-6">
                <CardHeader className="pb-2">
                  <Input
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                    className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Droppable droppableId={`section-${sectionIndex}`}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {section.activities.map((activity, activityIndex) => (
                          <Draggable
                            key={activity.id}
                            draggableId={activity.id}
                            index={activityIndex}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-md p-4 bg-background"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div {...provided.dragHandleProps} className="cursor-move">
                                    <DragHandleDots2 className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteActivity(sectionIndex, activityIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <Input
                                    placeholder="Activity title"
                                    value={activity.title}
                                    onChange={(e) =>
                                      handleActivityChange(
                                        sectionIndex,
                                        activityIndex,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                  />

                                  <div className="grid grid-cols-2 gap-3">
                                    <Input
                                      type="time"
                                      placeholder="Start time"
                                      value={activity.start_time}
                                      onChange={(e) =>
                                        handleActivityChange(
                                          sectionIndex,
                                          activityIndex,
                                          'start_time',
                                          e.target.value
                                        )
                                      }
                                    />

                                    <Select
                                      value={activity.category}
                                      onValueChange={(value) =>
                                        handleActivityChange(
                                          sectionIndex,
                                          activityIndex,
                                          'category',
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue>Category</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="activity">Activity</SelectItem>
                                        <SelectItem value="attraction">Attraction</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="transportation">
                                          Transportation
                                        </SelectItem>
                                        <SelectItem value="accommodation">Accommodation</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Input
                                    placeholder="Location"
                                    value={activity.location}
                                    onChange={(e) =>
                                      handleActivityChange(
                                        sectionIndex,
                                        activityIndex,
                                        'location',
                                        e.target.value
                                      )
                                    }
                                  />

                                  <Textarea
                                    placeholder="Description"
                                    rows={2}
                                    value={activity.description}
                                    onChange={(e) =>
                                      handleActivityChange(
                                        sectionIndex,
                                        activityIndex,
                                        'description',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddActivity(sectionIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </DragDropContext>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentTab('details')}>
              Back to Details
            </Button>
            <Button onClick={() => setCurrentTab('publish')}>Continue to Publish</Button>
          </div>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={itinerary.is_published}
                  onCheckedChange={(checked) =>
                    setItinerary({ ...itinerary, is_published: checked })
                  }
                />
                <Label htmlFor="publish">Make this itinerary public</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When published, your itinerary will be visible to other users and can be used as a
                template for their trips.
              </p>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentTab('schedule')}>
                  Back to Schedule
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Itinerary'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
