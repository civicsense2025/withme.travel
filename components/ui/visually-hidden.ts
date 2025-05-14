/**
 * This is a utility class for creating visually hidden elements that are still accessible to screen readers.
 * Based on best practices for visually hidden content.
 */
export const visuallyHidden =
  'absolute w-px h-px p-0 border-0 overflow-hidden whitespace-nowrap -top-full -left-full' +
  ' pointer-events-none opacity-0';
