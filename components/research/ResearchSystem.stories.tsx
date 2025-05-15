import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SurveyWelcome } from './SurveyWelcome';
import { SurveyProgressBar } from './SurveyProgressBar';
import { QuestionRenderer } from './QuestionRenderer';
import { SurveyCompletion } from './SurveyCompletion';
import { action } from '@storybook/addon-actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * The Research System is a complete survey and user testing platform
 * built into withme.travel. This story demonstrates how the various
 * components fit together to create a cohesive user experience.
 */
const meta: Meta = {
  title: 'Research/Overview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Interactive demonstration of the survey flow
 */
export const SurveyFlow: Story = {
  render: () => <SurveyFlowDemo />,
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates a complete survey flow, from welcome to completion, using all the core research components.',
      },
    },
  },
};

/**
 * Survey flow demo component with state management
 */
function SurveyFlowDemo() {
  const [step, setStep] = React.useState<'welcome' | 'questions' | 'completion'>('welcome');
  const [currentQuestionSet, setCurrentQuestionSet] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, any>>({});
  
  // Mock question sets organized by milestone
  const questionSets = [
    // First milestone: Basic information
    [
      {
        id: 'name',
        text: 'What is your name?',
        type: 'text' as const,
        required: true,
        placeholder: 'Your name',
      },
      {
        id: 'email',
        text: 'What is your email address?',
        type: 'text' as const,
        required: true,
        placeholder: 'your.email@example.com',
        description: 'We\'ll only use this to follow up if needed',
      },
    ],
    // Second milestone: Trip planning habits
    [
      {
        id: 'travel_frequency',
        text: 'How often do you travel?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'rarely', label: 'Less than once a year' },
          { value: 'yearly', label: 'Once a year' },
          { value: 'semi_yearly', label: '2-3 times a year' },
          { value: 'quarterly', label: 'Every few months' },
          { value: 'monthly', label: 'Monthly or more' },
        ],
      },
      {
        id: 'travel_planning',
        text: 'How do you usually plan your trips?',
        type: 'radio' as const,
        required: true,
        options: [
          { value: 'self', label: 'I plan everything myself' },
          { value: 'friends', label: 'I plan with friends/family' },
          { value: 'agent', label: 'I use a travel agent' },
          { value: 'package', label: 'I book package tours' },
          { value: 'spontaneous', label: 'I travel spontaneously with minimal planning' },
        ],
      },
    ],
    // Third milestone: Product feedback
    [
      {
        id: 'satisfaction',
        text: 'How satisfied are you with withme.travel so far?',
        type: 'rating' as const,
        required: true,
        min: 1,
        max: 5,
        description: '1 = Very dissatisfied, 5 = Very satisfied',
      },
      {
        id: 'feedback',
        text: 'Any additional feedback for us?',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Your thoughts here...',
      },
      {
        id: 'consent',
        text: 'Can we contact you for follow-up questions?',
        type: 'checkbox' as const,
        required: false,
      },
    ],
  ];
  
  const totalSteps = questionSets.length;
  const currentQuestions = questionSets[currentQuestionSet];
  const progress = ((currentQuestionSet + 1) / totalSteps) * 100;

  // Handlers
  const handleStart = () => {
    setStep('questions');
    action('Survey Started')();
  };

  const handleNext = () => {
    if (currentQuestionSet < totalSteps - 1) {
      setCurrentQuestionSet(prev => prev + 1);
      action('Next Question Set')({ currentSet: currentQuestionSet, responses });
    } else {
      setStep('completion');
      action('Survey Completed')(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionSet > 0) {
      setCurrentQuestionSet(prev => prev - 1);
      action('Previous Question Set')({ currentSet: currentQuestionSet });
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    action('Response Changed')({ questionId, value });
  };

  const handleReset = () => {
    setStep('welcome');
    setCurrentQuestionSet(0);
    setResponses({});
    action('Survey Reset')();
  };

  // Render
  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">withme.travel Research System</h1>
      
      {step === 'welcome' && (
        <SurveyWelcome
          title="Help us improve our trip planning experience"
          description="We'd love your feedback on how we can make withme.travel better for your travel planning needs."
          onStart={handleStart}
        />
      )}
      
      {step === 'questions' && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <SurveyProgressBar
                value={progress}
                steps={totalSteps}
                currentStep={currentQuestionSet + 1}
                showStepText
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionSet}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 my-6"
              >
                {currentQuestions.map(question => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    value={responses[question.id] || ''}
                    onChange={value => handleResponseChange(question.id, value)}
                    showValidation
                  />
                ))}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionSet === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentQuestionSet < totalSteps - 1 ? 'Next' : 'Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {step === 'completion' && (
        <div>
          <SurveyCompletion
            title="Thank you for your feedback!"
            description="Your responses help us make withme.travel better for everyone."
            nextStepLabel="Start Over"
            nextStepUrl="#"
          />
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={handleReset}>
              Reset Demo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Architecture overview showing how the components relate to each other
 */
export const ArchitectureOverview: Story = {
  render: () => (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Research System Architecture</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Component Hierarchy</h2>
        <div className="border p-6 rounded-lg bg-muted/30">
          <pre className="text-sm overflow-auto">
{`ResearchProvider (Context)
├── useResearchTracking (Hook)
├── ResearchModal
│   └── SurveyContainer
│       ├── SurveyWelcome
│       ├── SurveyProgressBar
│       ├── QuestionRenderer
│       │   ├── TextQuestion
│       │   ├── SelectQuestion
│       │   ├── RadioQuestion
│       │   ├── CheckboxQuestion
│       │   └── RatingQuestion
│       └── SurveyCompletion
└── Admin Components
    ├── SurveyBuilder
    ├── SurveyQuestionEditor
    ├── MilestoneTriggerEditor
    └── SurveyAnalytics
`}
          </pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Flow</h2>
        <div className="border p-6 rounded-lg">
          <ol className="list-decimal list-inside space-y-2">
            <li>User action triggers milestone event via <code>trackEvent()</code></li>
            <li>ResearchProvider checks if event should trigger a survey</li>
            <li>If triggered, ResearchModal appears with SurveyContainer</li>
            <li>User progresses through survey steps (welcome → questions → completion)</li>
            <li>Responses are submitted to API and stored in database</li>
            <li>Events/analytics are tracked throughout the flow</li>
          </ol>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Milestone-Based Flows</h3>
            <p className="text-sm text-muted-foreground">
              Questions can be grouped by "milestones" for multi-step flows triggered by
              different user actions.
            </p>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Context-Aware Triggering</h3>
            <p className="text-sm text-muted-foreground">
              Surveys can be triggered based on specific user actions, timing, or
              progress through the application.
            </p>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Users can see their progress through multi-step surveys with
              visual indicators.
            </p>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Analytics Integration</h3>
            <p className="text-sm text-muted-foreground">
              All user interactions with surveys are tracked for analysis and
              improving the research flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of the research system architecture and component relationships.',
      },
    },
  },
}; 