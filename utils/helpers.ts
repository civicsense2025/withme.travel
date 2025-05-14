/**
 * Helper utility functions for the application
 */

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  return array[random(0, array.length - 1)];
}

/**
 * Returns a random boolean with the given probability
 */
export function randomBool(probability = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Shuffles an array in place
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a random ID
 */
export function randomId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
