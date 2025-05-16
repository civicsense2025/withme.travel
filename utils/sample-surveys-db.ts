/**
 * Sample Surveys in Supabase Postgres Format
 *
 * This file exports sample surveys and their fields in the exact format required for
 * the `forms` and `form_fields` tables, as described in docs/features/user-testing-forms.md.
 *
 * Usage: For seeding, admin tools, or migration scripts.
 */

// External dependencies
import { v4 as uuidv4 } from 'uuid';

// Internal sample surveys
import { SAMPLE_SURVEYS } from '@/components/research/sample-surveys';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a row in the `forms` table
 */
export interface FormDb {
  id: string;
  type: string;
  name: string;
  description?: string | null;
  config: object;
  milestone_trigger?: string | null;
  milestones?: string[] | null;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

/**
 * Represents a row in the `form_fields` table
 */
export interface FormFieldDb {
  id: string;
  form_id: string;
  label: string;
  type: string;
  options?: object | null;
  required: boolean;
  order: number;
  milestone?: string | null;
  config?: object | null;
}

// ============================================================================
// TRANSFORMATION LOGIC
// ============================================================================

/**
 * Converts SAMPLE_SURVEYS to arrays matching the DB schema
 */
export const SAMPLE_FORMS_DB: FormDb[] = SAMPLE_SURVEYS.map(survey => ({
  id: survey.id,
  type: survey.type,
  name: survey.name,
  description: survey.description || null,
  config: survey.config || {},
  milestone_trigger: survey.milestone_trigger || null,
  milestones: null, // Add if your survey supports milestones
  created_at: survey.created_at,
  updated_at: survey.updated_at,
  is_active: survey.is_active,
}));

export const SAMPLE_FORM_FIELDS_DB: FormFieldDb[] = SAMPLE_SURVEYS.flatMap(survey =>
  (survey.fields || []).map((field, idx) => ({
    id: field.id || uuidv4(),
    form_id: survey.id,
    label: field.label ?? '',
    type: field.type,
    options: field.config?.options ? field.config.options : null,
    required: field.required === true,
    order: field.order ?? idx + 1,
    milestone: (field as any).milestone || null,
    config: field.config ? { ...field.config } : null,
  }))
);

/**
 * Usage Example:
 *
 * import { SAMPLE_FORMS_DB, SAMPLE_FORM_FIELDS_DB } from '@/utils/sample-surveys-db';
 *
 * // Insert into Supabase
 * await supabase.from('forms').insert(SAMPLE_FORMS_DB);
 * await supabase.from('form_fields').insert(SAMPLE_FORM_FIELDS_DB);
 */ 