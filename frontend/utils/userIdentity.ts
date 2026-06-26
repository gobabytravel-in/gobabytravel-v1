// GoBaby Travel — Anonymous User Identity System
// Generates a persistent UUID on first app launch, reuses across sessions.

import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@gobaby_user_id';
const USER_PROPS_KEY = '@gobaby_user_props';

// Simple UUID v4 generator (no external dependencies)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// In-memory cache so we don't hit AsyncStorage on every event
let cachedUserId: string | null = null;
let cachedUserProps: Record<string, string> = {};
let initialized = false;

/**
 * Initialize the user identity system.
 * Call once on app start (in _layout.tsx).
 * Returns the user ID.
 */
export async function initUserIdentity(): Promise<string> {
  if (initialized && cachedUserId) return cachedUserId;

  try {
    // Try to load existing user ID
    const stored = await AsyncStorage.getItem(USER_ID_KEY);
    if (stored) {
      cachedUserId = stored;
    } else {
      // First launch — generate and persist
      cachedUserId = generateUUID();
      await AsyncStorage.setItem(USER_ID_KEY, cachedUserId);
    }

    // Load persisted user properties
    const propsStr = await AsyncStorage.getItem(USER_PROPS_KEY);
    if (propsStr) {
      cachedUserProps = JSON.parse(propsStr);
    }

    initialized = true;
  } catch (e) {
    // Fallback: use an in-memory ID if AsyncStorage fails
    if (!cachedUserId) {
      cachedUserId = generateUUID();
    }
    initialized = true;
  }

  return cachedUserId;
}

/**
 * Get the current user ID synchronously (after init).
 * Returns null if not yet initialized.
 */
export function getUserId(): string | null {
  return cachedUserId;
}

/**
 * Get cached user properties.
 */
export function getUserProps(): Record<string, string> {
  return { ...cachedUserProps };
}

/**
 * Set a user property (persisted to AsyncStorage).
 * Also returns the updated props for Firebase setUserProperties.
 */
export async function setUserProperty(key: string, value: string): Promise<void> {
  cachedUserProps[key] = value;
  try {
    await AsyncStorage.setItem(USER_PROPS_KEY, JSON.stringify(cachedUserProps));
  } catch (e) {
    // Silent fail
  }
}

/**
 * Get a specific user property.
 */
export function getUserProperty(key: string): string | undefined {
  return cachedUserProps[key];
}
