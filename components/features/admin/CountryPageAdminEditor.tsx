'use client';

import React, { useState, useEffect } from 'react';
import CountryAdminEditor from './CountryAdminEditor';
import { useAuth } from '@/components/auth-provider';

interface CountryStats {
  destinations_count?: number;
  avg_safety_rating?: number;
  avg_cost_per_day?: number;
  local_language?: string;
  visa_required?: boolean;
  lgbtq_friendliness?: number;
  accessibility?: number;
  [key: string]: any;
}

interface CountryPageAdminEditorProps {
  country: string;
  stats?: CountryStats;
}

export default function CountryPageAdminEditor({
  country,
  stats = {},
}: CountryPageAdminEditorProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin === true;

  // Only render for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mt-8 mb-4">
      <CountryAdminEditor country={country} stats={stats} />
    </div>
  );
}
