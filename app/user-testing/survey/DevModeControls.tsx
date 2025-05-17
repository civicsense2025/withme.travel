'use client';

import { useState, useEffect } from 'react';
import { getDevModeEnabled, setDevModeEnabled } from './page-client';

export default function DevModeControls() {
  const [devMode, setDevMode] = useState<boolean>(getDevModeEnabled());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Keep state in sync with localStorage
    const handler = () => {
      setDevMode(getDevModeEnabled());
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleDevMode = () => {
    const newMode = !devMode;
    setDevModeEnabled(newMode);
    setDevMode(newMode);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  const sqlScript = `-- Insert test survey data into your database (run with psql)
-- This will create two test surveys with realistic fields

-- Insert a test survey into the forms table
INSERT INTO forms (id, name, description, type, is_active, cohort, milestones, milestone_trigger, created_at, config) 
VALUES (
  '488f71b9-78ee-4654-b32b-439378272e1c',
  'Basic Test Survey',
  'A simple survey for testing purposes',
  'survey',
  true,
  'user-research-default',
  '["introduction", "feedback", "conclusion"]',
  null,
  NOW(),
  '{"progress": 0, "fields": [
    {
      "id": "field-1",
      "type": "text",
      "label": "What do you think about withme.travel?",
      "required": true,
      "description": "Please provide your honest feedback",
      "milestone": "introduction"
    },
    {
      "id": "field-2",
      "type": "text",
      "label": "What features would you like to see?",
      "required": true,
      "description": "Tell us what would make your experience better",
      "milestone": "feedback"
    },
    {
      "id": "field-3",
      "type": "radio",
      "label": "How would you rate your experience?",
      "required": true,
      "description": "On a scale of 1-5",
      "config": {
        "options": [
          "1 - Poor",
          "2 - Fair",
          "3 - Good",
          "4 - Very Good",
          "5 - Excellent"
        ]
      },
      "milestone": "conclusion"
    }
  ]}'
);

-- Insert another test survey
INSERT INTO forms (id, name, description, type, is_active, cohort, milestones, milestone_trigger, created_at, config) 
VALUES (
  'f2b957b3-8dc0-4599-a98a-929e9c72ece9',
  'How''s Your WithMe Journey Going?',
  'Share your thoughts so we can make planning trips with friends even better',
  'survey',
  true,
  'user-research-default',
  '["introduction", "usability", "features", "conclusion"]',
  null,
  NOW(),
  '{"progress": 0, "fields": [
    {
      "id": "welcome",
      "type": "message",
      "label": "Welcome to our feedback survey!",
      "description": "Your feedback helps us improve withme.travel for everyone. This should take about 5 minutes to complete.",
      "milestone": "introduction"
    },
    {
      "id": "trip-count",
      "type": "radio",
      "label": "How many trips have you planned with withme.travel?",
      "required": true,
      "config": {
        "options": [
          "None yet", 
          "1-2 trips", 
          "3-5 trips", 
          "More than 5 trips"
        ]
      },
      "milestone": "introduction"
    },
    {
      "id": "ease-of-use",
      "type": "radio",
      "label": "How easy was it to use withme.travel?",
      "required": true,
      "config": {
        "options": [
          "Very easy", 
          "Somewhat easy", 
          "Neutral", 
          "Somewhat difficult", 
          "Very difficult"
        ]
      },
      "milestone": "usability"
    },
    {
      "id": "favorite-feature",
      "type": "select",
      "label": "What''s your favorite feature?",
      "required": true,
      "config": {
        "options": [
          "Collaborative itinerary planning",
          "Budget tracking",
          "Destination recommendations",
          "Real-time collaboration",
          "Other"
        ]
      },
      "milestone": "features"
    },
    {
      "id": "improvement",
      "type": "textarea",
      "label": "What could we improve?",
      "required": false,
      "description": "Share any suggestions for making withme.travel better",
      "milestone": "conclusion"
    },
    {
      "id": "refer-likelihood",
      "type": "radio",
      "label": "How likely are you to recommend withme.travel to a friend?",
      "required": true,
      "config": {
        "options": [
          "1 - Not at all likely",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10 - Extremely likely"
        ]
      },
      "milestone": "conclusion"
    }
  ]}'
);`;

  return (
    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 mb-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${devMode ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            Survey Dev Mode: {devMode ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleDevMode}
            className={`px-3 py-1 rounded text-white ${devMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {devMode ? 'Turn Off' : 'Turn On'}
          </button>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            {expanded ? 'Hide' : 'More Info'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-yellow-300 pt-3 text-xs">
          <p className="mb-2"><strong>Current Mode:</strong> {devMode ? 'Using mock data and bypassing token checks' : 'Using real database data with token validation'}</p>
          
          <details className="mt-3">
            <summary className="cursor-pointer font-medium">SQL to insert test surveys</summary>
            <div className="mt-2 bg-gray-800 text-white p-2 rounded overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{sqlScript}</pre>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Copy this SQL and run it in your Postgres database to create test survey data that will work with the IDs referenced in the code.
            </p>
          </details>
        </div>
      )}
    </div>
  );
} 