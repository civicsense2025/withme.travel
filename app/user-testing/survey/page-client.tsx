'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { TABLES } from '@/utils/constants/tables';

// Survey question types
type SurveyQuestion = {
  id: string;
  type: 'text' | 'single_choice' | 'multiple_choice';
  label: string;
  required: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
  placeholder?: string;
};

// Survey definition
type SurveyDefinition = {
  survey_id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
};

// Survey response
type SurveyResponse = {
  [key: string]: string | string[];
};

export default function UserTestingSurveyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Get survey ID from query param or use default
  const surveyId = searchParams?.get('surveyId') || 'user-testing-onboarding';
  // Get email and name from query params if available
  const emailParam = searchParams?.get('email') || '';
  const nameParam = searchParams?.get('name') || '';

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    // Set email and name from URL params if available
    if (emailParam) setEmail(emailParam);
    if (nameParam) setName(nameParam);

    // Fetch survey definition
    async function fetchSurvey() {
      try {
        const { data, error } = await supabase
          .from(TABLES.SURVEY_DEFINITIONS)
          .select('*')
          .eq('survey_id', surveyId)
          .single();

        if (error) throw error;
        if (data) {
          setSurvey({
            ...data,
            questions: Array.isArray(data.questions) ? data.questions : []
          });
        }
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('Failed to load survey. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [surveyId, emailParam, nameParam, supabase]);

  // Handle form input changes
  const handleChange = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle single choice selection
  const handleSingleChoice = (questionId: string, value: string) => {
    handleChange(questionId, value);
  };

  // Handle multiple choice selection
  const handleMultipleChoice = (questionId: string, value: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = Array.isArray(prev[questionId]) ? prev[questionId] as string[] : [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      
      return {
        ...prev,
        [questionId]: newValues
      };
    });
  };

  // Move to next question
  const handleNext = () => {
    const currentQuestion = survey?.questions[currentStep];
    if (!currentQuestion) return;

    // Validate current question
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      setError(`Please answer this question before continuing.`);
      return;
    }
    
    setError(null);
    if (currentStep < (survey?.questions.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Submit survey
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Basic validation - make sure email is provided
    if (!email) {
      setError('Email is required to submit your responses.');
      setSubmitting(false);
      return;
    }

    try {
      // Insert survey response
      const { error } = await supabase
        .from(TABLES.SURVEY_RESPONSES)
        .insert([
          {
            survey_id: surveyId,
            email,
            name,
            responses,
            completed_at: new Date().toISOString(),
            source: 'user_testing_signup'
          }
        ]);

      if (error) throw error;
      
      // Track event for email workflows
      await supabase
        .from(TABLES.USER_EVENTS)
        .insert([{
          event_name: 'user_testing_survey_completed',
          user_email: email,
          user_name: name,
          event_data: {
            survey_id: surveyId,
            email,
            name,
            timestamp: new Date().toISOString()
          },
          source: 'user_testing_survey'
        }]);

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render current question
  const renderQuestion = () => {
    if (!survey) return null;

    const question = survey.questions[currentStep];
    if (!question) return null;

    switch (question.type) {
      case 'text':
        return (
          <div className="w-full max-w-xl mx-auto">
            <Label htmlFor={question.id} className="text-lg font-medium mb-2 block">
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id={question.id}
              value={responses[question.id] as string || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              required={question.required}
              className="w-full h-32 rounded-xl bg-white/90 border border-gray-300 focus:ring-2 focus:ring-purple-400"
            />
          </div>
        );

      case 'single_choice':
        return (
          <div className="w-full max-w-xl mx-auto">
            <Label className="text-lg font-medium mb-4 block">
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <RadioGroup 
              value={responses[question.id] as string || ''}
              onValueChange={(value) => handleSingleChoice(question.id, value)}
              className="space-y-3"
            >
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label 
                    htmlFor={`${question.id}-${option.value}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="w-full max-w-xl mx-auto">
            <Label className="text-lg font-medium mb-4 block">
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <div className="space-y-3">
              {question.options?.map((option) => {
                const values = Array.isArray(responses[question.id]) 
                  ? responses[question.id] as string[] 
                  : [];
                const isChecked = values.includes(option.value);
                
                return (
                  <div key={option.value} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <Checkbox 
                      id={`${question.id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => 
                        handleMultipleChoice(question.id, option.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Display loading state
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-700">Loading survey...</p>
        </div>
      </main>
    );
  }

  // Display error if survey couldn't be loaded
  if (!loading && !survey) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-gray-700 mb-4">We couldn't load the survey. Please try again later.</p>
            <Button onClick={() => router.push('/user-testing')}>
              Return to Registration
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Display success message after submission
  if (success) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100">
        <Card className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border-0">
          <CardContent className="p-8 md:p-10 flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Thanks for sharing!</h1>
            <p className="text-center text-gray-700 mb-6">
              Your responses will help us build a better travel planning experience for everyone.
              We'll be in touch soon with more information about the user testing program.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-400 text-white font-bold text-lg py-3 mt-2 shadow-lg hover:scale-105 transition-transform"
            >
              Explore WithMe.Travel
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100 relative overflow-hidden font-sans py-8">
      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-gradient-to-tr from-yellow-200 via-pink-100 to-purple-200 rounded-full blur-3xl opacity-50 animate-float-slow" />
      </div>
      
      <Card className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border-0 p-0">
        <CardContent className="p-8 md:p-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-3 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent tracking-tight">
            {survey?.title}
          </h1>
          
          <p className="text-lg text-center text-gray-700 mb-8">{survey?.description}</p>
          
          {/* Progress indicator */}
          <div className="w-full mb-8">
            <div className="flex justify-between mb-2 text-sm text-gray-500">
              <span>Question {currentStep + 1} of {survey?.questions.length}</span>
              <span>{Math.round(((currentStep + 1) / (survey?.questions.length || 1)) * 100)}% complete</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400" 
                style={{ width: `${((currentStep + 1) / (survey?.questions.length || 1)) * 100}%` }} 
              />
            </div>
          </div>
          
          {/* Contact info collection (shown only on first step) */}
          {currentStep === 0 && !email && (
            <div className="w-full max-w-md mb-8 p-4 bg-purple-50 rounded-xl">
              <h2 className="font-semibold text-purple-900 mb-3">Your contact information</h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-1 block">
                    Email address <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg bg-white/90"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg bg-white/90"
                    autoComplete="name"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Current question */}
          {renderQuestion()}
          
          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm mt-4 text-center">
              {error}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between w-full mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || submitting}
              className="rounded-xl border-2 border-gray-300"
            >
              Previous
            </Button>
            
            {currentStep < (survey?.questions.length || 0) - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="rounded-xl bg-purple-200 text-purple-900 hover:bg-purple-300"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-400 text-white hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <style jsx global>{`
        .animate-float {
          animation: float 8s ease-in-out infinite alternate;
        }
        .animate-float-slow {
          animation: float 14s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.04); }
        }
      `}</style>
    </main>
  );
} 