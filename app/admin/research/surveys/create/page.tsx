'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { QuestionType } from '@/types/research';
import { MILESTONE_EVENT_TYPES } from '@/utils/constants/status';

// Form schema for survey creation
const formSchema = z.object({
  name: z.string().min(1, 'Survey name is required'),
  description: z.string().optional(),
  type: z.enum(['survey', 'feedback', 'bug']),
  is_active: z.boolean().default(true),
  
  // Fields will be managed separately in state
  config: z.object({
    fields: z.array(
      z.object({
        label: z.string().min(1, 'Question label is required'),
        type: z.string(),
        options: z.any().optional(),
        required: z.boolean().optional(),
        order: z.number().optional(),
        milestone: z.string().optional().nullable(),
      })
    ).optional(),
  }),
});

// Question type options
const questionTypeOptions = [
  { label: 'Text Input', value: 'text' },
  { label: 'Select Dropdown', value: 'select' },
  { label: 'Radio Buttons', value: 'radio' },
  { label: 'Checkboxes', value: 'checkbox' },
  { label: 'Rating Scale', value: 'rating' },
];

// Milestone options (these are key events in the user journey)
const milestoneOptions = [
  { label: 'Initial Visit', value: MILESTONE_EVENT_TYPES.INITIAL_VISIT },
  { label: 'After Signup', value: MILESTONE_EVENT_TYPES.SIGNUP_COMPLETED },
  { label: 'After Trip Creation', value: MILESTONE_EVENT_TYPES.TRIP_CREATED },
  { label: 'After Adding Destination', value: MILESTONE_EVENT_TYPES.DESTINATION_ADDED },
  { label: 'After Adding Itinerary Items', value: MILESTONE_EVENT_TYPES.ITINERARY_ITEM_ADDED },
  { label: 'After Group Creation', value: MILESTONE_EVENT_TYPES.GROUP_CREATED },
  { label: 'After Member Invited', value: MILESTONE_EVENT_TYPES.MEMBER_INVITED },
  { label: 'After Comment Added', value: MILESTONE_EVENT_TYPES.COMMENT_ADDED },
  { label: 'Budget Item Added', value: MILESTONE_EVENT_TYPES.BUDGET_ITEM_ADDED },
  { label: 'Feature Discovered', value: MILESTONE_EVENT_TYPES.FEATURE_DISCOVERED },
  { label: 'Final Step', value: MILESTONE_EVENT_TYPES.FINAL },
];

export default function CreateSurveyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'survey',
      is_active: true,
      config: {
        fields: [],
      },
    },
  });

  // Add a new question field
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(), // Temporary client-side ID
        label: '',
        type: 'text',
        required: true,
        order: questions.length,
        milestone: null,
        options: [],
      },
    ]);
  };

  // Update a question field
  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  // Remove a question field
  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Update order values
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Prepare the full survey data
    const surveyData = {
      ...values,
      config: {
        fields: questions.map(q => ({
          label: q.label,
          type: q.type,
          required: q.required,
          order: q.order,
          milestone: q.milestone,
          options: q.options,
        })),
      },
    };
    
    // Add syncFields as a separate property
    const requestBody = {
      ...surveyData,
      syncFields: true, // This is a flag for the API, not stored in DB
    };
    
    try {
      const response = await fetch('/api/research/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create survey');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Survey created successfully!',
      });
      
      // Redirect to the survey detail or list page
      router.push(`/admin/research/surveys/${data.form.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create survey',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Survey</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Basic Information Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the basic details for your survey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Product Feedback Survey" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your survey a descriptive name
                    </FormDescription>
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
                      <Textarea
                        placeholder="What is this survey for?"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the survey's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="survey">General Survey</SelectItem>
                          <SelectItem value="feedback">Feedback Form</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of survey
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Survey</FormLabel>
                        <FormDescription>
                          Make this survey available for users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Survey Questions</CardTitle>
                <CardDescription>
                  Add the questions for your survey
                </CardDescription>
              </div>
              <Button type="button" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No questions added yet</p>
                  <Button type="button" onClick={addQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first question
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Question {index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Question text */}
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Question Text</label>
                          <Input
                            value={question.label}
                            onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                            placeholder="Enter your question"
                          />
                        </div>

                        {/* Question type */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Question Type</label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateQuestion(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {questionTypeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Milestone</label>
                            <Select
                              value={question.milestone || ''}
                              onValueChange={(value) => updateQuestion(index, 'milestone', value || null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any milestone" />
                              </SelectTrigger>
                              <SelectContent>
                                {milestoneOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Required toggle */}
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`required-${question.id}`}
                            checked={question.required}
                            onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                          />
                          <label htmlFor={`required-${question.id}`} className="text-sm font-medium">
                            Required question
                          </label>
                        </div>

                        {/* Options for select, radio, checkbox types */}
                        {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Options</label>
                            <Textarea
                              placeholder="Enter options, one per line"
                              value={(question.options || []).join('\n')}
                              onChange={(e) => {
                                const options = e.target.value
                                  .split('\n')
                                  .map(option => option.trim())
                                  .filter(Boolean);
                                updateQuestion(index, 'options', options);
                              }}
                              className="min-h-24"
                              rows={6}
                            />
                            <div className="text-sm text-muted-foreground">
                              Enter each option on a new line. Press Enter to add multiple options.
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || questions.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Survey'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 