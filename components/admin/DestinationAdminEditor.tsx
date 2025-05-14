'use client';

import React, { useState, useEffect } from 'react';
import InlineAdminEditor from './InlineAdminEditor';
import { updateEntity } from '@/utils/admin/entity-editor';
import type { InlineEditField } from './types';

interface DestinationAdminEditorProps {
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

export default function DestinationAdminEditor({ destination }: DestinationAdminEditorProps) {
  const [fields, setFields] = useState<InlineEditField[]>([]);

  useEffect(() => {
    // Create edit fields from destination data
    const editFields: InlineEditField[] = [
      {
        type: 'text',
        name: 'name',
        label: 'Name',
        value: destination.name || '',
        required: true,
      },
      {
        type: 'textarea',
        name: 'description',
        label: 'Description',
        value: destination.description || '',
        required: true,
      },
      {
        type: 'text',
        name: 'best_season',
        label: 'Best Season',
        value: destination.best_season || '',
      },
      {
        type: 'number',
        name: 'avg_cost_per_day',
        label: 'Avg. Cost Per Day',
        value: destination.avg_cost_per_day || 0,
        min: 0,
      },
      {
        type: 'number',
        name: 'cuisine_rating',
        label: 'Cuisine Rating',
        value: destination.cuisine_rating || 0,
        min: 0,
        max: 5,
      },
      {
        type: 'number',
        name: 'cultural_attractions',
        label: 'Cultural Attractions Rating',
        value: destination.cultural_attractions || 0,
        min: 0,
        max: 5,
      },
      {
        type: 'number',
        name: 'safety_rating',
        label: 'Safety Rating',
        value: destination.safety_rating || 0,
        min: 0,
        max: 5,
      },
    ];

    setFields(editFields);
  }, [destination]);

  const handleSave = async (entityId: string, data: Record<string, any>) => {
    try {
      const success = await updateEntity('destination', entityId, data);
      return success;
    } catch (error) {
      console.error('Error saving destination changes:', error);
      return false;
    }
  };

  return (
    <InlineAdminEditor
      entityType="destination"
      entityId={destination.id}
      fields={fields}
      onSave={handleSave}
    />
  );
}
