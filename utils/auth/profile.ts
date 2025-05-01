import { UserProfile } from './state';

// Constants for profile management
const PROFILE_CACHE_KEY = 'user_profile_cache';
const PROFILE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const PROFILE_UPDATE_QUEUE_KEY = 'profile_update_queue';

// Interface for cached profile data
interface CachedProfile extends UserProfile {
  cachedAt: number;
}

// Interface for profile update operation
interface ProfileUpdate {
  id: string;
  timestamp: number;
  changes: Partial<UserProfile>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Save profile to cache
export function cacheProfile(profile: UserProfile): void {
  try {
    const cachedData: CachedProfile = {
      ...profile,
      cachedAt: Date.now(),
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Failed to cache profile:', error);
  }
}

// Load profile from cache
export function loadCachedProfile(): UserProfile | null {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedProfile;

    // Check if cache is still valid
    if (Date.now() - data.cachedAt > PROFILE_CACHE_DURATION) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }

    // Remove cache metadata before returning
    const { cachedAt, ...profile } = data;
    return profile;
  } catch (error) {
    console.error('Failed to load cached profile:', error);
    return null;
  }
}

// Queue a profile update
export function queueProfileUpdate(userId: string, changes: Partial<UserProfile>): void {
  try {
    const queue = loadUpdateQueue();
    const update: ProfileUpdate = {
      id: `${userId}_${Date.now()}`,
      timestamp: Date.now(),
      changes,
      status: 'pending',
    };

    queue.push(update);
    localStorage.setItem(PROFILE_UPDATE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to queue profile update:', error);
  }
}

// Load the update queue
function loadUpdateQueue(): ProfileUpdate[] {
  try {
    const stored = localStorage.getItem(PROFILE_UPDATE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load update queue:', error);
    return [];
  }
}

// Process the update queue
export async function processUpdateQueue(
  updateFn: (changes: Partial<UserProfile>) => Promise<UserProfile>
): Promise<void> {
  const queue = loadUpdateQueue();
  if (queue.length === 0) return;

  const updatedQueue: ProfileUpdate[] = [];

  for (const update of queue) {
    if (update.status !== 'pending') {
      updatedQueue.push(update);
      continue;
    }

    try {
      update.status = 'processing';
      const updatedProfile = await updateFn(update.changes);
      update.status = 'completed';

      // Update cache with new profile data
      cacheProfile(updatedProfile);
    } catch (error) {
      update.status = 'failed';
      update.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to process profile update:', error);
    }

    updatedQueue.push(update);
  }

  // Save updated queue
  localStorage.setItem(PROFILE_UPDATE_QUEUE_KEY, JSON.stringify(updatedQueue));
}

// Validate profile data
export function validateProfile(profile: UserProfile): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!profile.id) {
    errors.push('Profile ID is required');
  }

  if (!profile.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(profile.email)) {
    errors.push('Invalid email format');
  }

  // Validate username format if present
  if (profile.username && !isValidUsername(profile.username)) {
    errors.push(
      'Username must be 3-30 characters and contain only letters, numbers, and underscores'
    );
  }

  // Validate name length if present
  if (profile.full_name && (profile.full_name.length < 2 || profile.full_name.length > 100)) {
    errors.push('Full name must be between 2 and 100 characters');
  }

  return errors;
}

// Helper to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to validate username format
function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

// Apply optimistic update to profile
export function applyOptimisticUpdate(
  currentProfile: UserProfile | null,
  changes: Partial<UserProfile>
): UserProfile {
  if (!currentProfile) {
    throw new Error('Cannot apply optimistic update: No current profile');
  }

  // Create updated profile
  const updatedProfile = {
    ...currentProfile,
    ...changes,
    updated_at: new Date().toISOString(),
  };

  // Validate the updated profile
  const errors = validateProfile(updatedProfile);
  if (errors.length > 0) {
    throw new Error(`Invalid profile update: ${errors.join(', ')}`);
  }

  // Cache the optimistic update
  cacheProfile(updatedProfile);

  return updatedProfile;
}
