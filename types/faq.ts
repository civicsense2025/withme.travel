/**
 * Type definitions for the FAQ component system
 */

/**
 * Represents a single FAQ entry with question, answer and optional metadata
 */
export interface FaqEntry {
  /** The question text */
  question: string;
  /** The answer text (can be markdown or HTML) */
  answer: string;
  /** Optional unique ID for structured data */
  id?: string;
  /** Optional tags for filtering or search */
  tags?: string[];
}

/**
 * Supported layout variants for FAQ components
 */
export type FaqLayout = 'default' | 'sidebar' | 'inline' | 'grid' | 'compact';

/**
 * Parameters for filtering FAQ entries
 */
export interface FaqFilterParams {
  /** Search term to match in question or answer */
  search?: string;
  /** Tags to filter by */
  tags?: string[];
  /** Maximum number of entries to show */
  limit?: number;
}
