'use client';

import React from 'react';
import ContinentAdminEditor from './ContinentAdminEditor';
import { useAuth } from '@/components/auth-provider';

interface ContinentStats {
  countries_count?: number;
  destinations_count?: number;
  avg_cost_per_day?: number;
  description?: string;
  recommended_currencies?: string;
  high_season?: string;
  time_zone_offset?: number;
  [key: string]: any;
}

interface ContinentPageAdminEditorProps {
  continent: string;
  stats?: ContinentStats;
}

export default function ContinentPageAdminEditor({
  continent,
  stats = {},
}: ContinentPageAdminEditorProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin === true;

  // Only render for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mt-8 mb-4">
      <ContinentAdminEditor continent={continent} stats={stats} />
    </div>
  );
}
