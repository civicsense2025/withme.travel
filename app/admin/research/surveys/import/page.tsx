'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, FileJson, FileText, FileUp } from 'lucide-react';

// Schema for manual survey entry
const manualImportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  questions: z.string().min(10, "Questions content must not be empty"),
});

// Schema for JSON import
const jsonImportSchema = z.object({
  jsonContent: z.string().min(2, "JSON content must not be empty"),
});

// Schema for file upload
const fileImportSchema = z.object({
  file: z.any(),
});

export default function SurveyImportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  // Manual import form
  const manualForm = useForm<z.infer<typeof manualImportSchema>>({
    resolver: zodResolver(manualImportSchema),
    defaultValues: {
      name: '',
      description: '',
      questions: '',
    },
  });
  
  // JSON import form
  const jsonForm = useForm<z.infer<typeof jsonImportSchema>>({
    resolver: zodResolver(jsonImportSchema),
    defaultValues: {
      jsonContent: '',
    },
  });
  
  // File upload form
  const fileForm = useForm<z.infer<typeof fileImportSchema>>({
    resolver: zodResolver(fileImportSchema),
    defaultValues: {
      file: undefined,
    },
  });
  
  // Handle manual import
  const onManualSubmit = async (values: z.infer<typeof manualImportSchema>) => {
    setIsSubmitting(true);
    try {
      // Parse questions from text format
      const questions = parseQuestionsFromText(values.questions);
      
      // Create survey with parsed questions
      const surveyData = {
        name: values.name,
        description: values.description || '',
        config: {
          fields: questions.map((q, index) => ({
            label: q.text,
            type: q.type || 'text',
            required: q.required || false,
            order: index,
            options: q.options || [],
          })),
        },
      };
      
      const response = await fetch('/api/research/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create survey');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Survey imported successfully',
      });
      
      router.push(`/admin/research/surveys/${data.survey.id}`);
    } catch (error) {
      console.error('Error importing survey:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import survey',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle JSON import
  const onJsonSubmit = async (values: z.infer<typeof jsonImportSchema>) => {
    setIsSubmitting(true);
    try {
      // Parse JSON content
      let surveyData;
      try {
        surveyData = JSON.parse(values.jsonContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }
      
      // Validate survey data structure
      if (!surveyData.name || !surveyData.config || !surveyData.config.fields) {
        throw new Error('Invalid survey format: missing required fields');
      }
      
      // Send to API
      const response = await fetch('/api/research/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create survey');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Survey imported successfully',
      });
      
      router.push(`/admin/research/surveys/${data.survey.id}`);
    } catch (error) {
      console.error('Error importing survey:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import survey',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle file upload
  const onFileSubmit = async (values: z.infer<typeof fileImportSchema>) => {
    setIsSubmitting(true);
    try {
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        throw new Error('No file selected');
      }
      
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/research/surveys/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import survey');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Survey imported successfully',
      });
      
      router.push(`/admin/research/surveys/${data.survey.id}`);
    } catch (error) {
      console.error('Error importing survey:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import survey',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to parse questions from text
  const parseQuestionsFromText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    let currentQuestion: any = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a new question
      if (/^\d+[\.\)]/.test(trimmedLine) || 
          (!currentQuestion && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('*'))) {
        // Save previous question if exists
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        // Extract question type from line
        let type = 'text';
        if (trimmedLine.includes('[multiple]')) type = 'checkbox';
        else if (trimmedLine.includes('[single]')) type = 'radio';
        else if (trimmedLine.includes('[select]')) type = 'select';
        else if (trimmedLine.includes('[textarea]')) type = 'textarea';
        
        // Extract required flag
        const required = trimmedLine.includes('[required]');
        
        // Clean up the question text
        let text = trimmedLine
          .replace(/^\d+[\.\)]/, '')
          .replace(/\[(multiple|single|select|textarea|required)\]/g, '')
          .trim();
        
        currentQuestion = {
          text,
          type,
          required,
          options: [],
        };
      } 
      // Check if this is an option for the current question
      else if (currentQuestion && (trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
        const option = trimmedLine.substring(1).trim();
        currentQuestion.options.push(option);
      }
    }
    
    // Add the last question
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    return questions;
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFileName(e.target.files[0].name);
    } else {
      setSelectedFileName(null);
    }
  };
  
  const getManualTemplateText = () => {
    return `1. What is your name? [text] [required]

2. How would you rate our service? [single] [required]
- Excellent
- Good
- Average
- Poor
- Terrible

3. Which features do you use regularly? [multiple]
- Dashboard
- Reports
- Calendar
- Chat
- Notifications

4. Please tell us how we can improve: [textarea]`;
  };
  
  const getJsonTemplateText = () => {
    return JSON.stringify({
      name: "Customer Satisfaction Survey",
      description: "Help us improve our service by providing your feedback",
      config: {
        fields: [
          {
            label: "What is your name?",
            type: "text",
            required: true,
            order: 0
          },
          {
            label: "How would you rate our service?",
            type: "radio",
            required: true,
            order: 1,
            options: ["Excellent", "Good", "Average", "Poor", "Terrible"]
          },
          {
            label: "Which features do you use regularly?",
            type: "checkbox",
            required: false,
            order: 2,
            options: ["Dashboard", "Reports", "Calendar", "Chat", "Notifications"]
          },
          {
            label: "Please tell us how we can improve:",
            type: "textarea",
            required: false,
            order: 3
          }
        ]
      }
    }, null, 2);
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/research/surveys')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Surveys
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Import Survey</h1>
          <p className="text-muted-foreground">
            Import a survey from various formats
          </p>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="manual" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center">
            <FileJson className="h-4 w-4 mr-2" />
            JSON Import
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center">
            <FileUp className="h-4 w-4 mr-2" />
            File Upload
          </TabsTrigger>
        </TabsList>
        
        {/* Manual Entry Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Survey Entry</CardTitle>
              <CardDescription>
                Enter your survey details and questions manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...manualForm}>
                <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
                  <FormField
                    control={manualForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Survey Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter survey name" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your survey
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={manualForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter survey description" 
                            {...field}
                            rows={2}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide context for your survey respondents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={manualForm.control}
                    name="questions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Questions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter questions" 
                            {...field}
                            rows={10}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter questions in the format shown in the template.
                          Add [text], [textarea], [single], [multiple], or [select] to specify question type.
                          Add [required] for required questions.
                          Use dashes/hyphens (-) for options.
                        </FormDescription>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => manualForm.setValue('questions', getManualTemplateText())}
                        >
                          Load Template
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Importing...' : 'Import Survey'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* JSON Import Tab */}
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>JSON Import</CardTitle>
              <CardDescription>
                Import a survey from JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...jsonForm}>
                <form onSubmit={jsonForm.handleSubmit(onJsonSubmit)} className="space-y-6">
                  <FormField
                    control={jsonForm.control}
                    name="jsonContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JSON Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your JSON here" 
                            {...field}
                            rows={16}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          Paste your survey JSON content following the required schema
                        </FormDescription>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => jsonForm.setValue('jsonContent', getJsonTemplateText())}
                        >
                          Load Template
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Importing...' : 'Import Survey'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* File Upload Tab */}
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Import from CSV, Excel, or JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-6">
                  <FormField
                    control={fileForm.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload File</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-primary/50">
                            <Input
                              type="file"
                              accept=".json,.csv,.xlsx,.xls"
                              className="hidden"
                              id="file-upload"
                              onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-base">
                                {selectedFileName ? (
                                  <span className="text-primary font-medium">{selectedFileName}</span>
                                ) : (
                                  <span>
                                    <span className="text-primary font-medium">Click to upload</span> or drag and drop
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Supported formats: JSON, CSV, Excel
                              </p>
                            </label>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a file containing your survey data
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting || !selectedFileName}>
                    {isSubmitting ? 'Importing...' : 'Import Survey'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 