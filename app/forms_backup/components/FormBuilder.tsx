'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Settings,
  Eye,
  PlusCircle,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Types
import {
  FormVisibility,
  FormStatus,
  QuestionType,
  createFormSchema,
  createQuestionSchema,
  Form as FormType,
  Question,
  CreateFormData,
  CreateQuestionData,
} from '../FormTypes';

// Form templates for quick start
const FORM_TEMPLATES = [
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Collect feedback about your product or service',
    defaultValues: {
      title: 'Customer Feedback',
      description: 'We value your feedback! Please take a moment to share your thoughts.',
      emoji: '📝',
      visibility: FormVisibility.PRIVATE,
      allowAnonymousResponses: true,
    },
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Collect registrations for an event',
    defaultValues: {
      title: 'Event Registration',
      description: 'Please fill out this form to register for our upcoming event.',
      emoji: '🎟️',
      visibility: FormVisibility.SHARED_WITH_LINK,
      allowAnonymousResponses: false,
    },
  },
  {
    id: 'travel-survey',
    name: 'Travel Preferences Survey',
    description: 'Gather travel preferences for group trips',
    defaultValues: {
      title: 'Travel Preferences Survey',
      description: 'Help us plan the perfect trip by sharing your travel preferences.',
      emoji: '✈️',
      visibility: FormVisibility.PRIVATE,
      allowAnonymousResponses: false,
    },
  },
];

// Common font families
const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
];

// Theme colors
const THEME_COLORS = [
  { value: '#3B82F6', label: 'Blue (Default)' },
  { value: '#10B981', label: 'Green' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EF4444', label: 'Red' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#6B7280', label: 'Gray' },
];

interface FormBuilderProps {
  initialForm?: FormType;
  initialQuestions?: Question[];
  onSave?: (form: FormType, questions: Question[]) => void;
}

export function FormBuilder({ initialForm, initialQuestions = [], onSave }: FormBuilderProps) {
  // Component state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Initialize main form
  const form = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: initialForm
      ? {
          title: initialForm.title,
          description: initialForm.description || undefined,
          emoji: initialForm.emoji || undefined,
          visibility: initialForm.visibility,
          allowAnonymousResponses: initialForm.allowAnonymousResponses,
          showProgressBar: initialForm.showProgressBar,
          showQuestionNumbers: initialForm.showQuestionNumbers,
          themeColor: initialForm.themeColor || undefined,
          fontFamily: initialForm.fontFamily || undefined,
        }
      : {
          title: '',
          description: '',
          emoji: '📋',
          visibility: FormVisibility.PRIVATE,
          allowAnonymousResponses: false,
          showProgressBar: true,
          showQuestionNumbers: true,
          themeColor: '#3B82F6',
          fontFamily: 'Inter',
        },
  });

  // Question form for editing individual questions
  const questionForm = useForm<CreateQuestionData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      formId: initialForm?.id || '',
      title: '',
      type: QuestionType.SHORT_TEXT,
      description: '',
      isRequired: false,
      placeholder: '',
      options: [],
    },
  });

  // Form persistence in localStorage
  const FORM_STORAGE_KEY = 'form-builder-draft';

  // Load saved form data on mount
  useEffect(() => {
    if (initialForm) return; // Don't load from storage if editing an existing form

    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);

        // Try to load form data
        if (parsed.formData) {
          form.reset(parsed.formData);
        }

        // Try to load questions
        if (Array.isArray(parsed.questions)) {
          setQuestions(parsed.questions);
        }
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, [form, initialForm]);

  // Save form data on change
  useEffect(() => {
    if (initialForm) return; // Don't save to storage if editing an existing form

    const subscription = form.watch((formData) => {
      const dataToSave = {
        formData,
        questions,
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    });

    return () => subscription.unsubscribe();
  }, [form, questions, initialForm]);

  // Apply template function
  const applyTemplate = (templateId: string) => {
    const template = FORM_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Reset the form with template values
    form.reset(template.defaultValues);
  };

  // Functions for managing questions
  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      formId: initialForm?.id || '',
      title: 'New Question',
      description: null,
      placeholder: null,
      isRequired: false,
      type: QuestionType.SHORT_TEXT,
      position: questions.length,
      options: null,
      validationRules: null,
      conditionalLogic: null,
      defaultValue: null,
      maxCharacterCount: null,
      showCharacterCount: false,
      ratingScale: null,
      ratingType: null,
      allowedFileTypes: null,
      maxFileSize: null,
      maxFiles: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setQuestions([...questions, newQuestion]);
    setActiveQuestionIndex(questions.length);

    // Reset the question form with the new question's values
    questionForm.reset({
      formId: newQuestion.formId,
      title: newQuestion.title,
      type: newQuestion.type,
      description: newQuestion.description || undefined,
      isRequired: newQuestion.isRequired,
      placeholder: newQuestion.placeholder || undefined,
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);

    // Update positions
    newQuestions.forEach((q, i) => {
      q.position = i;
    });

    setQuestions(newQuestions);

    // Reset active question
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null);
    } else if (activeQuestionIndex !== null && activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const selectQuestion = (index: number) => {
    setActiveQuestionIndex(index);
    const question = questions[index];

    // Set question form values
    questionForm.reset({
      formId: question.formId,
      title: question.title,
      type: question.type,
      description: question.description || undefined,
      isRequired: question.isRequired,
      placeholder: question.placeholder || undefined,
      options: question.options || undefined,
      validationRules: question.validationRules || undefined,
      defaultValue: question.defaultValue || undefined,
      maxCharacterCount: question.maxCharacterCount || undefined,
      showCharacterCount: question.showCharacterCount,
      ratingScale: question.ratingScale || undefined,
      ratingType: question.ratingType || undefined,
      allowedFileTypes: question.allowedFileTypes || undefined,
      maxFileSize: question.maxFileSize || undefined,
      maxFiles: question.maxFiles,
    });
  };

  const saveQuestion = () => {
    questionForm.handleSubmit((values) => {
      if (activeQuestionIndex === null) return;

      const updatedQuestion: Question = {
        ...questions[activeQuestionIndex],
        title: values.title,
        type: values.type,
        description: values.description || null,
        isRequired: values.isRequired || false,
        placeholder: values.placeholder || null,
        options: values.options
          ? values.options.map((opt) => ({
              id: uuidv4(), // Always generate a new ID for each option
              label: opt.label,
              value: opt.value,
              description: opt.description,
              imageUrl: opt.imageUrl,
            }))
          : null,
        validationRules: values.validationRules || null,
        defaultValue: values.defaultValue || null,
        maxCharacterCount: values.maxCharacterCount || null,
        showCharacterCount: values.showCharacterCount || false,
        ratingScale: values.ratingScale || null,
        ratingType: values.ratingType || null,
        allowedFileTypes: values.allowedFileTypes || null,
        maxFileSize: values.maxFileSize || null,
        maxFiles: values.maxFiles || 1,
        updatedAt: new Date(),
      };

      const newQuestions = [...questions];
      newQuestions[activeQuestionIndex] = updatedQuestion;
      setQuestions(newQuestions);

      toast({
        title: 'Question saved',
        description: 'The question has been updated successfully.',
      });
    })();
  };

  // Define what fields to validate for each step
  const getFieldsToValidateForStep = (stepNum: number): (keyof CreateFormData)[] => {
    switch (stepNum) {
      case 1:
        return ['title'];
      case 2:
        return ['visibility', 'allowAnonymousResponses'];
      default:
        return [];
    }
  };

  // Handle next step validation
  const handleNext = async () => {
    const fieldsToValidate = getFieldsToValidateForStep(step);
    const result = await form.trigger(fieldsToValidate);

    if (result) {
      // If moving to question editor and no questions, add one
      if (step === 1 && questions.length === 0) {
        addQuestion();
      }

      setStep(step + 1);
    }
  };

  // Publish the form
  const publishForm = async () => {
    await handleSubmit();

    // In a real implementation, you would call an API to update the form status
    toast({
      title: 'Form Published',
      description: 'Your form is now live and ready to collect responses.',
    });
  };

  // Handle back
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate the entire form
    const formValid = await form.trigger();

    // Check if we have at least one question
    const hasQuestions = questions.length > 0;

    if (!formValid) {
      toast({
        title: 'Form Validation Error',
        description: 'Please check the form settings and fix any errors.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasQuestions) {
      toast({
        title: 'No Questions Added',
        description: 'Please add at least one question to your form.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const formValues = form.getValues();

      // Temporarily store form ID for questions if creating a new form
      const formId = initialForm?.id || uuidv4();

      // Update form ID on all questions if needed
      if (!initialForm) {
        questions.forEach((q) => {
          q.formId = formId;
          q.updatedAt = new Date();
        });
      }

      const newForm: FormType = {
        id: formId,
        createdBy: initialForm?.createdBy || 'current-user',
        title: formValues.title,
        description: formValues.description || null,
        slug: initialForm?.slug || null,
        emoji: formValues.emoji || null,
        coverImageUrl: initialForm?.coverImageUrl || null,
        logoUrl: initialForm?.logoUrl || null,
        themeColor: formValues.themeColor || null,
        fontFamily: formValues.fontFamily || null,
        showProgressBar: formValues.showProgressBar || true,
        showQuestionNumbers: formValues.showQuestionNumbers || true,
        visibility: formValues.visibility || FormVisibility.PRIVATE,
        status: initialForm?.status || FormStatus.DRAFT,
        allowAnonymousResponses: formValues.allowAnonymousResponses || false,
        responseLimit: initialForm?.responseLimit || null,
        closesAt: initialForm?.closesAt || null,
        viewCount: initialForm?.viewCount || 0,
        startCount: initialForm?.startCount || 0,
        completionCount: initialForm?.completionCount || 0,
        averageTimeSeconds: initialForm?.averageTimeSeconds || 0,
        notifyOnResponse: initialForm?.notifyOnResponse || false,
        notificationEmail: initialForm?.notificationEmail || null,
        redirectUrl: initialForm?.redirectUrl || null,
        completionMessage: initialForm?.completionMessage || null,
        createdAt: initialForm?.createdAt || new Date(),
        updatedAt: new Date(),
        publishedAt: initialForm?.publishedAt || null,
        accessCode: initialForm?.accessCode || null,
        isPublished: initialForm?.isPublished || false,
        isActive: initialForm?.isActive || false,
        questionCount: questions.length,
      };

      // Save form data
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ formData: newForm, questions }));

      // Call onSave callback
      if (onSave) {
        onSave(newForm, questions);
      }

      toast({
        title: 'Form Saved',
        description: 'Your form has been saved successfully.',
      });
    } catch (e) {
      console.error('Failed to save form:', e);
      toast({
        title: 'Form Save Error',
        description: 'There was an error saving your form. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the component based on the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your form title" {...field} />
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
                          <Textarea
                            placeholder="Optional description or help text"
                            className="min-h-[80px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional context or instructions for this form
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Appearance</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emoji</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter an emoji" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="themeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {THEME_COLORS.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview how your form will look to respondents
                </p>

                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Preview Form
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={FormVisibility.PRIVATE}>Private</SelectItem>
                            <SelectItem value={FormVisibility.SHARED_WITH_LINK}>
                              Shared with Link
                            </SelectItem>
                            <SelectItem value={FormVisibility.PUBLIC}>Public</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Control who can access your form</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowAnonymousResponses"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Anonymous Responses</FormLabel>
                          <FormDescription>Allow responses without authentication</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showProgressBar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Progress Bar</FormLabel>
                          <FormDescription>
                            Display progress as users complete the form
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showQuestionNumbers"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Question Numbers</FormLabel>
                          <FormDescription>
                            Display question numbers (1, 2, 3, etc.)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Appearance</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FONT_FAMILIES.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Form Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview how your form will look to respondents
                </p>

                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Preview Form
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/40 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Form Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your form title" {...field} />
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
                    <Textarea
                      placeholder="Optional description or help text"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional context or instructions for this form
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Form Appearance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter an emoji" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themeColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {THEME_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Form Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Preview how your form will look to respondents
          </p>

          <Button variant="outline" size="sm" className="gap-1">
            <Eye className="h-4 w-4" />
            Preview Form
          </Button>
        </div>
      </div>

      {/* Right side: Question editor */}
      <div className="w-full md:w-2/3 border rounded-md p-4">
        {activeQuestionIndex === null ? (
          <div className="text-center py-12">
            <h4 className="text-lg font-medium mb-2">Question Editor</h4>
            <p className="text-muted-foreground mb-4">
              Select a question to edit or add a new one.
            </p>
            <Button onClick={addQuestion} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">Edit Question</h4>
              <Button onClick={saveQuestion} size="sm" variant="secondary">
                Save Changes
              </Button>
            </div>

            <Separator />

            <FormProvider {...questionForm}>
              <div className="space-y-4">
                <FormField
                  control={questionForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Question <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={QuestionType.SHORT_TEXT}>Short Text</SelectItem>
                          <SelectItem value={QuestionType.LONG_TEXT}>Long Text</SelectItem>
                          <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                          <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value={QuestionType.YES_NO}>Yes/No</SelectItem>
                          <SelectItem value={QuestionType.RATING}>Rating</SelectItem>
                          <SelectItem value={QuestionType.DATE}>Date</SelectItem>
                          <SelectItem value={QuestionType.EMAIL}>Email</SelectItem>
                          <SelectItem value={QuestionType.NUMBER}>Number</SelectItem>
                          <SelectItem value={QuestionType.STATEMENT}>Statement/Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description or help text"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional context or instructions for this question
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <FormDescription>Make this question mandatory</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={questionForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placeholder</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Type your answer here..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>Example text shown before the user answers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional fields based on question type */}
                {questionForm.watch('type') === QuestionType.SINGLE_CHOICE ||
                questionForm.watch('type') === QuestionType.MULTIPLE_CHOICE ? (
                  <div className="border rounded-md p-4 space-y-4">
                    <h5 className="text-sm font-medium">Options</h5>
                    <p className="text-sm text-muted-foreground">
                      Add options for this question (options editor would go here)
                    </p>
                  </div>
                ) : null}

                {questionForm.watch('type') === QuestionType.RATING ? (
                  <div className="border rounded-md p-4 space-y-4">
                    <h5 className="text-sm font-medium">Rating Scale</h5>
                    <p className="text-sm text-muted-foreground">
                      Configure rating scale (1-5, 1-10, etc.)
                    </p>
                  </div>
                ) : null}
              </div>
            </FormProvider>
          </div>
        )}
      </div>
    </div>
  );
}
