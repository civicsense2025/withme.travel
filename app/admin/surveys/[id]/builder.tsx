/**
 * Survey Builder Page (Admin)
 *
 * All-in-one UI for building and managing milestone-based surveys.
 * Renders the SurveyBuilder component for the given survey ID.
 *
 * @module app/admin/surveys/[id]/builder
 */

import React from 'react';
import { useRouter } from 'next/router';
import { SurveyBuilder } from '@/components/research/SurveyBuilder';

export default function SurveyBuilderPage() {
  // Get survey ID from route params
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return <div>Invalid survey ID</div>;
  }

  return <SurveyBuilder surveyId={id} />;
} 