'use client';

import React, { useState, useEffect } from 'react';
import InlineAdminEditor from './InlineAdminEditor';
import { updateEntity } from '@/utils/admin/entity-editor';
import { InlineEditField } from './types';

interface CountryAdminEditorProps {
  country: string;
  stats?: {
    destinations_count?: number;
    avg_safety_rating?: number;
    avg_cost_per_day?: number;
    [key: string]: any;
  };
}

export default function CountryAdminEditor({ country, stats = {} }: CountryAdminEditorProps) {
  const [fields, setFields] = useState<InlineEditField[]>([]);

  useEffect(() => {
    // These fields will be applied to all destinations in this country
    const editFields: InlineEditField[] = [
      {
        type: 'text',
        name: 'local_language',
        label: 'Local Language',
        value: stats.local_language || '',
      },
      {
        type: 'select',
        name: 'visa_required',
        label: 'Visa Required',
        value: stats.visa_required?.toString() || 'false',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
      {
        type: 'number',
        name: 'lgbtq_friendliness',
        label: 'LGBTQ+ Friendliness Rating',
        value: stats.lgbtq_friendliness || 0,
        min: 0,
        max: 5,
      },
      {
        type: 'number',
        name: 'accessibility',
        label: 'Accessibility Rating',
        value: stats.accessibility || 0,
        min: 0,
        max: 5,
      },
    ];

    setFields(editFields);
  }, [stats]);

  const handleSave = async (entityId: string, data: Record<string, any>) => {
    try {
      // Convert boolean strings to actual booleans
      if (data.visa_required) {
        data.visa_required = data.visa_required === 'true';
      }

      const success = await updateEntity('country', entityId, data);
      return success;
    } catch (error) {
      console.error('Error saving country changes:', error);
      return false;
    }
  };

  return (
    <InlineAdminEditor
      entityType="country"
      entityId={country}
      fields={fields}
      onSave={handleSave}
    />
  );
}
