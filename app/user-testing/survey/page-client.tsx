'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, ExternalLink, ArrowRight } from 'lucide-react';
import { FORM_TABLES, USER_TABLES } from '@/utils/constants/tables';
import { TABLES, TABLE_NAMES } from '@/utils/constants/database';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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

// Define types for survey response
type SurveyResponseData = {
  [key: string]: string | string[];
};

// Define types for survey data
interface SurveyResponsePayload {
  survey_id: string;
  user_id?: string | null;
  session_id?: string | null;
  responses: Record<string, any>;
  email?: string | null;
  device_info?: Record<string, any> | null;
  created_at?: string;
}

interface UserEvent {
  event_type: string;
  user_id?: string | null;
  session_id?: string | null;
  event_data?: Record<string, any> | null;
  page?: string | null;
  created_at?: string;
}

export default function UserTestingSurveyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [responses, setResponses] = useState<SurveyResponseData>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const handoffStudyId = searchParams?.get('handoffStudyId');
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [handoffLink, setHandoffLink] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [surveySlug, setSurveySlug] = useState('');
  const [surveyDefinition, setSurveyDefinition] = useState<SurveyDefinition | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyResponseData>({});
  const { toast } = useToast();

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

  const [formData, setFormData] = useState({
    easeOfUse: '',
    mostValuable: '',
    leastValuable: '',
    missingFeatures: '',
    recommendations: '',
    email: '',
    feedback: '',
    wouldUseAgain: false,
  });

  // Track events
  const trackEvent = useCallback(async (eventType: string, eventData: Record<string, any> = {}) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the current session ID value at execution time
      const currentSessionId = sessionId || localStorage.getItem('session_id');
      
      const eventPayload: UserEvent = {
        event_type: eventType,
        session_id: currentSessionId,
        event_data: eventData,
        page: '/user-testing/survey',
        created_at: new Date().toISOString(),
      };

      // Get user ID if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        eventPayload.user_id = user.id;
      }

      // Insert event
      await supabase.from('user_events').insert([eventPayload]);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  useEffect(() => {
    // Set email and name from URL params if available
    if (emailParam) setEmail(emailParam);
    if (nameParam) setName(nameParam);

    // Fetch survey definition
    async function fetchSurvey() {
      try {
        const { data, error } = await supabase
          .from(TABLE_NAMES.SURVEY_DEFINITIONS)
          .select('*')
          .eq('survey_id', surveyId)
          .single();

        if (error) throw error;
        if (data) {
          setSurvey({
            ...data,
            questions: Array.isArray(data.questions) ? data.questions : [],
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

  // Load session ID or create one
  useEffect(() => {
    // Generate session ID if not already exists
    const sid = localStorage.getItem('session_id') || uuidv4();
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', sid);
    }
    setSessionId(sid);

    // Track page view
    trackEvent('page_view');
  }, [trackEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle form input changes
  const handleSurveyChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle single choice selection
  const handleSingleChoice = (questionId: string, value: string) => {
    handleSurveyChange(questionId, value);
  };

  // Handle multiple choice selection
  const handleMultipleChoice = (questionId: string, value: string, checked: boolean) => {
    setResponses((prev) => {
      const currentValues = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);

      return {
        ...prev,
        [questionId]: newValues,
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Validate required fields
      const requiredQuestions = survey?.questions?.filter((q) => q.required);

      for (const question of requiredQuestions || []) {
        if (!responses[question.id]) {
          setSubmissionError(`Please answer the question: ${question.label}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare response data
      const responseData: SurveyResponsePayload = {
        survey_id: surveyId,
        session_id: sessionId,
        responses: responses,
        email: emailParam || null,
        device_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
        created_at: new Date().toISOString(),
      };

      // Get user ID if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        responseData.user_id = user.id;
      }

      // Submit response
      const { error } = await supabase.from(TABLE_NAMES.SURVEY_RESPONSES).insert([responseData]);

      if (error) {
        console.error('Error submitting survey:', error);
        setSubmissionError('Error submitting your response. Please try again.');
        // Attempt to log the error
        trackEvent('survey_submission_error', { error: error.message });
      } else {
        setIsSubmitted(true);
        trackEvent('survey_submitted', { survey_id: surveyId });
      }
    } catch (error) {
      console.error('Error in submission process:', error);
      setSubmissionError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // After successful survey submission, trigger research handoff if needed
  useEffect(() => {
    if (success && handoffStudyId && !handoffLink && !handoffLoading && !handoffError) {
      setHandoffLoading(true);
      setHandoffError(null);
      fetch('/api/research/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId: handoffStudyId,
          email,
          name,
          surveyId,
          responses,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to generate research link');
          }
          return res.json();
        })
        .then((data) => {
          setHandoffLink(data.link || null);
        })
        .catch((err) => {
          setHandoffError(err.message || 'Failed to generate research link');
        })
        .finally(() => {
          setHandoffLoading(false);
        });
    }
  }, [
    success,
    handoffStudyId,
    handoffLink,
    handoffLoading,
    handoffError,
    email,
    name,
    surveyId,
    responses,
  ]);

  // Render current question
  const renderQuestion = () => {
    if (!survey) return null;

    const question = survey.questions[currentStep];
    if (!question) return null;

    switch (question.type) {
      case 'text':
        return (
          <div className="w-full max-w-xl mx-auto">
            <Label
              htmlFor={question.id}
              className="text-lg font-medium mb-3 block text-gray-800 dark:text-gray-200"
            >
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id={question.id}
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleSurveyChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              required={question.required}
              className="w-full h-36 rounded-xl bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary dark:text-white resize-none"
            />
          </div>
        );

      case 'single_choice':
        return (
          <div className="w-full max-w-xl mx-auto">
            <Label className="text-lg font-medium mb-5 block text-gray-800 dark:text-gray-200">
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <RadioGroup
              value={(responses[question.id] as string) || ''}
              onValueChange={(value) => handleSingleChoice(question.id, value)}
              className="space-y-3"
            >
              {question.options?.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${question.id}-${option.value}`}
                    className="text-purple-600 dark:text-purple-400 border-gray-400 dark:border-gray-600"
                  />
                  <Label
                    htmlFor={`${question.id}-${option.value}`}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 select-none"
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
            <Label className="text-lg font-medium mb-5 block text-gray-800 dark:text-gray-200">
              {question.label} {question.required && <span className="text-red-400">*</span>}
            </Label>
            <div className="space-y-3">
              {question.options?.map((option) => {
                const values = (responses[question.id] as string[]) || [];
                const checked = values.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <Checkbox
                      id={`${question.id}-${option.value}`}
                      checked={checked}
                      onCheckedChange={(checked) =>
                        handleMultipleChoice(question.id, option.value, checked as boolean)
                      }
                      className="text-purple-600 dark:text-purple-400 border-gray-400 dark:border-gray-600"
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="cursor-pointer text-gray-700 dark:text-gray-300 select-none"
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
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted dark:from-black dark:to-gray-950">
        {/* Simple navbar */}
        <header className="w-full py-4 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 dark:text-white flex items-center"
            >
              withme.travel
            </Link>
            <Link href="/user-testing">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                Back to Signup
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-xl shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading survey...</p>
          </div>
        </div>
      </main>
    );
  }

  // Display error if survey couldn't be loaded
  if (!loading && !survey) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted dark:from-black dark:to-gray-950">
        {/* Simple navbar */}
        <header className="w-full py-4 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 dark:text-white flex items-center"
            >
              withme.travel
            </Link>
            <Link href="/user-testing">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                Back to Signup
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl mx-auto rounded-3xl shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-100 dark:border-gray-800">
            <CardContent className="p-8 md:p-10 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Survey Not Found
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
                We couldn't find the survey you're looking for. Please try again or contact support.
              </p>
              <Button
                onClick={() => router.push('/user-testing')}
                className="rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-yellow-300 text-white font-bold px-6 py-3"
              >
                Return to Signup
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Display success message after submission
  if (success) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted dark:from-black dark:to-gray-950">
        {/* Simple navbar */}
        <header className="w-full py-4 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 dark:text-white flex items-center"
            >
              withme.travel
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                Return to Home
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-100 dark:border-gray-800">
            <CardContent className="p-8 md:p-12 flex flex-col items-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-8">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Thank You!</h1>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-8 text-lg">
                Your feedback is incredibly valuable as we build the future of group travel
                planning. We'll be in touch soon with updates!
              </p>

              {/* Research handoff logic */}
              {handoffStudyId && (
                <div className="w-full mb-8">
                  <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                      Continue to Research Study
                    </h2>
                    {handoffLoading && (
                      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Preparing your research link...</span>
                      </div>
                    )}
                    {handoffError && (
                      <div className="text-red-600 dark:text-red-400 mb-2">{handoffError}</div>
                    )}
                    {handoffLink && (
                      <a href={handoffLink} target="_blank" rel="noopener noreferrer">
                        <Button
                          className="w-full flex items-center justify-center gap-2 mt-2"
                          size="lg"
                        >
                          <ArrowRight className="h-5 w-5" />
                          Start Research Study
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="w-full space-y-8 mb-8">
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Support Our Journey
                  </h2>

                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Share with Friends
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-600 dark:text-green-400"
                          >
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 8.2c-.8-.5-1.8-.8-2.6-.9-.9-.1-1.9 0-2.6.3"></path>
                            <path d="M19 8a7 7 0 0 0-7-7"></path>
                            <path d="M15 2c1 0 2.1.4 2.8 1.2"></path>
                            <path d="M2 12v-2a2 2 0 0 1 2-2h6"></path>
                            <path d="M18 11.2c.1.5.2 1 .2 1.8a8 8 0 0 1-2.9 6.2"></path>
                            <path d="M22 12v2a2 2 0 0 1-2 2h-6"></path>
                            <path d="M15 22a7 7 0 0 1-7-7"></path>
                            <path d="M9 17c-1 0-2.1-.4-2.8-1.2"></path>
                          </svg>
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500"
                          >
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                          </svg>
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-pink-500"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect width="4" height="12" x="2" y="9"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          LinkedIn
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Support Our Development
                      </h3>
                      <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 w-full">
                        Make a Donation
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Donations help us build better travel experiences for everyone
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Render the survey
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted dark:from-black dark:to-gray-950">
      {/* Simple navbar */}
      <header className="w-full py-4 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="font-bold text-xl text-gray-900 dark:text-white flex items-center"
          >
            withme.travel
          </Link>
          <Link href="/user-testing">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              Back to Signup
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 p-4 pt-10 md:pt-16">
        <div className="max-w-3xl mx-auto">
          <Card className="rounded-3xl shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6 md:p-8">
              {/* Survey header */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                  {survey?.title || 'Survey'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {survey?.description || 'Please complete this survey'}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="mb-8">
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-in-out"
                    style={{
                      width: `${((currentStep + 1) / (survey?.questions.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                  Question {currentStep + 1} of {survey?.questions.length || 0}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Current question */}
                <div className="mb-8">{renderQuestion()}</div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-gray-900/80 border border-red-100 dark:border-red-900/50 rounded-lg text-red-500 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 px-5"
                  >
                    Back
                  </Button>

                  {currentStep < (survey?.questions.length || 0) - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-white px-5"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-white px-5"
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
