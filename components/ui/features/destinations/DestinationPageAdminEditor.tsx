'use client';

import React from 'react';
import DestinationAdminEditor from './DestinationAdminEditor';
import { useAuth } from '@/components/auth-provider';

interface DestinationPageAdminEditorProps {
  destination: {
    id: string;
    name: string;
    description: string;
    city: string;
    country: string;
    continent: string;
    best_season?: string;
    avg_cost_per_day?: number;
    cuisine_rating?: number;
    cultural_attractions?: number;
    safety_rating?: number;
    [key: string]: any;
  };
}

export default function DestinationPageAdminEditor({
  destination,
}: DestinationPageAdminEditorProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin === true;

  // Only render for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mt-8 mb-4">
      <DestinationAdminEditor destination={destination} />
    </div>
  );
}
