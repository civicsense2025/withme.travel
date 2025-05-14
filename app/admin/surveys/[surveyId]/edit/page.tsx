'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, ArrowLeft, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SurveyField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Survey {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: {
    fields: SurveyField[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  response_count?: number;
}

export default function EditSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const surveyId = params?.surveyId as string || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [surveyName, setSurveyName] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<SurveyField[]>([]);
  
  const [currentFieldLabel, setCurrentFieldLabel] = useState('');
  const [currentFieldType, setCurrentFieldType] = useState('text');
  const [currentFieldRequired, setCurrentFieldRequired] = useState(false);
  const [currentFieldOptions, setCurrentFieldOptions] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/admin/surveys/${surveyId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch survey');
        }
        
        const data = await response.json();
        const survey = data.survey as Survey;
        
        // Populate form fields with survey data
        setSurveyName(survey.name);
        setSurveyDescription(survey.description || '');
        setIsActive(survey.is_active);
        setFields(survey.config.fields || []);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId]);

  const addField = () => {
    if (!currentFieldLabel) {
      toast({
        title: 'Field Required',
        description: 'Question label is required',
        variant: 'destructive',
      });
      return;
    }

    const newField: SurveyField = {
      id: `field-${Date.now()}`,
      label: currentFieldLabel,
      type: currentFieldType,
      required: currentFieldRequired,
    };

    if (['select', 'radio', 'checkbox'].includes(currentFieldType) && currentFieldOptions) {
      newField.options = currentFieldOptions.split(',').map(opt => opt.trim());
    }

    setFields([...fields, newField]);
    
    // Reset form
    setCurrentFieldLabel('');
    setCurrentFieldType('text');
    setCurrentFieldRequired(false);
    setCurrentFieldOptions('');
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSubmit = async () => {
    if (!surveyName) {
      toast({
        title: 'Missing Information',
        description: 'Survey name is required',
        variant: 'destructive',
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: 'Missing Fields',
        description: 'Please add at least one question to your survey',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: surveyName,
          description: surveyDescription,
          config: {
            fields: fields.map(field => ({
              id: field.id,
              label: field.label,
              type: field.type,
              required: field.required,
              options: field.options || [],
            })),
          },
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update survey');
      }

      toast({
        title: 'Success',
        description: 'Survey updated successfully',
      });

      router.push(`/admin/surveys/${surveyId}`);
    } catch (error) {
      console.error('Error updating survey:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => router.push('/admin/surveys')}>Back to Surveys</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Survey"
          description="Update survey details and questions"
        />
        <Button 
          variant="outline" 
          onClick={() => router.push(`/admin/surveys/${surveyId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>Update basic information for your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Survey Name</Label>
              <Input
                id="name"
                value={surveyName}
                onChange={e => setSurveyName(e.target.value)}
                placeholder="Enter survey name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={surveyDescription}
                onChange={e => setSurveyDescription(e.target.value)}
                placeholder="Enter survey description"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
            <CardDescription>Create a new question for your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Question Text</Label>
              <Input
                id="fieldLabel"
                value={currentFieldLabel}
                onChange={e => setCurrentFieldLabel(e.target.value)}
                placeholder="Enter question text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Question Type</Label>
              <Select
                value={currentFieldType}
                onValueChange={setCurrentFieldType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (Short Answer)</SelectItem>
                  <SelectItem value="textarea">Text Area (Long Answer)</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="radio">Multiple Choice (Single)</SelectItem>
                  <SelectItem value="checkbox">Multiple Choice (Multiple)</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {['select', 'radio', 'checkbox'].includes(currentFieldType) && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Options (comma separated)</Label>
                <Input
                  id="fieldOptions"
                  value={currentFieldOptions}
                  onChange={e => setCurrentFieldOptions(e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="fieldRequired"
                checked={currentFieldRequired}
                onCheckedChange={(checked) => 
                  setCurrentFieldRequired(checked as boolean)}
              />
              <Label htmlFor="fieldRequired">Required question</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addField} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Questions</CardTitle>
          <CardDescription>
            {fields.length === 0
              ? 'No questions added yet. Add some questions above.'
              : `${fields.length} question${fields.length === 1 ? '' : 's'} in this survey`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start justify-between border p-4 rounded-md"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {index + 1}. {field.label} 
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Type: {field.type}
                    {field.options && (
                      <span className="block">
                        Options: {field.options.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/surveys/${surveyId}`)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Saving Changes...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}