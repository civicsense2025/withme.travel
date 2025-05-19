'use client';

import React, { useState, useEffect } from 'react';
import InlineAdminEditor from './InlineAdminEditor';
import { updateEntity } from '@/utils/admin/entity-editor';
import { InlineEditField } from './types';

interface ContinentAdminEditorProps {
  continent: string;
  stats?: {
    countries_count?: number;
    destinations_count?: number;
    avg_cost_per_day?: number;
    [key: string]: any;
  };
}

export default function ContinentAdminEditor({ continent, stats = {} }: ContinentAdminEditorProps) {
  const [fields, setFields] = useState<InlineEditField[]>([]);

  useEffect(() => {
    // These fields will be applied to all destinations in this continent
    const editFields: InlineEditField[] = [
      {
        type: 'textarea',
        name: 'description',
        label: 'Continent Description',
        value: stats.description || '',
      },
      {
        type: 'text',
        name: 'recommended_currencies',
        label: 'Recommended Currencies',
        value: stats.recommended_currencies || '',
      },
      {
        type: 'select',
        name: 'high_season',
        label: 'High Season',
        value: stats.high_season || '',
        options: [
          { label: 'Summer', value: 'summer' },
          { label: 'Winter', value: 'winter' },
          { label: 'Spring', value: 'spring' },
          { label: 'Fall', value: 'fall' },
          { label: 'Year Round', value: 'year_round' },
          { label: 'Varies', value: 'varies' },
        ],
      },
      {
        type: 'number',
        name: 'time_zone_offset',
        label: 'Average Time Zone Offset',
        value: stats.time_zone_offset || 0,
        min: -12,
        max: 14,
      },
    ];

    setFields(editFields);
  }, [stats]);

  const handleSave = async (entityId: string, data: Record<string, any>) => {
    try {
      const success = await updateEntity('continent', entityId, data);
      return success;
    } catch (error) {
      console.error('Error saving continent changes:', error);
      return false;
    }
  };

  return (
    <InlineAdminEditor
      entityType="continent"
      entityId={continent}
      fields={fields}
      onSave={handleSave}
    />
  );
}
