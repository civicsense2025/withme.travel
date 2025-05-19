/**
 * Type definitions for admin components
 */

export interface InlineEditField {
  type: 'text' | 'textarea' | 'number' | 'select';
  name: string;
  label: string;
  value: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
}
