// GoBaby Travel Push Notification Service
// Uses expo-notifications with FCM (Android) and APNs (iOS)
// Stores tokens in Firestore for targeted notifications

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Configuration ──────────────────────────────────────────────────────────

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Token Registration ─────────────────────────────────────────────────────

/**
 * Register for push notifications and store token in Firestore.
 * Uses native device tokens (FCM/APNs) — no EAS projectId needed.
 * Falls back gracefully in Expo Go or web.
 * Returns the push token string or null if registration fails.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('[Notifications] Must use physical device for push notifications');
    return null;
  }

  // Skip on web — not supported
  if (Platform.OS === 'web') {
    console.log('[Notifications] Push not supported on web');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    // Android-specific notification channel (must be set before getting token)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('travel-updates', {
        name: 'Travel Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2FB8A6',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('deals', {
        name: 'Deals & Offers',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // Strategy: Use native device token (FCM/APNs) — works without EAS projectId
    // This gives you FCM tokens you can use directly from Firebase Console
    let token: string | null = null;
    let tokenType: 'device' | 'expo' = 'device';

    try {
      // Try native device token first (FCM on Android, APNs on iOS)
      // No projectId required — works everywhere
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data as string;
      tokenType = 'device';
      console.log('[Notifications] Got native device token');
    } catch (deviceError) {
      console.log('[Notifications] Native token unavailable, trying Expo token...');
      
      // Fallback: try Expo push token (needs projectId from EAS)
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          (Constants as any).easConfig?.projectId ??
          undefined;

        if (projectId) {
          const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
          token = expoToken.data;
          tokenType = 'expo';
          console.log('[Notifications] Got Expo push token');
        }
      } catch (expoError) {
        console.log('[Notifications] Expo token also unavailable');
      }
    }

    if (!token) {
      console.log('[Notifications] Could not obtain push token');
      return null;
    }

    // Store token in Firestore with type info
    await storeTokenInFirestore(token, tokenType);

    console.log('[Notifications] Registered successfully, type:', tokenType);
    return token;
  } catch (error) {
    // Soft log — never show red screen for notifications
    console.log('[Notifications] Registration skipped:', (error as Error)?.message || error);
    return null;
  }
}

// ─── Firestore Token Storage ────────────────────────────────────────────────

/**
 * Store or update push token in Firestore with device info.
 * Uses token as document ID for easy deduplication.
 * token_type: 'device' (FCM/APNs native) or 'expo' (Expo push service)
 */
async function storeTokenInFirestore(token: string, tokenType: 'device' | 'expo' = 'device'): Promise<void> {
  try {
    const tokenDocId = token.replace(/[\/\.]/g, '_').substring(0, 100); // Sanitize & limit length for Firestore doc ID
    const tokenRef = doc(db, 'push_tokens', tokenDocId);

    await setDoc(
      tokenRef,
      {
        token,
        token_type: tokenType, // 'device' = use FCM/APNs to send, 'expo' = use Expo Push API
        device_type: Platform.OS, // 'android' | 'ios'
        device_name: Device.modelName || 'Unknown',
        os_version: Device.osVersion || 'Unknown',
        created_at: serverTimestamp(),
        last_active_at: serverTimestamp(),
        behavior: {
          destinations_viewed: [],
          flow_progress: {},
          tools_used: [],
          callback_submitted: false,
          last_screen: null,
        },
      },
      { merge: true } // Merge to avoid overwriting behavior data
    );
  } catch (error) {
    console.log('[Notifications] Error storing token:', (error as Error)?.message || error);
  }
}

/**
 * Update last_active_at timestamp for the stored token
 */
export async function updateTokenActivity(token: string): Promise<void> {
  try {
    const tokenDocId = token.replace(/[\/\.]/g, '_');
    const tokenRef = doc(db, 'push_tokens', tokenDocId);
    await updateDoc(tokenRef, {
      last_active_at: serverTimestamp(),
    });
  } catch (error) {
    // Silent fail
  }
}

// ─── Behavior Tracking (linked to push token) ──────────────────────────────

/**
 * Update user behavior data on the push token record.
 * This enables targeted notifications based on user interests.
 */
export async function updateTokenBehavior(
  token: string,
  behaviorUpdate: {
    destination_viewed?: string;
    flow_step_completed?: { destination: string; step: string; step_number: number };
    tool_used?: string;
    callback_submitted?: boolean;
    last_screen?: string;
  }
): Promise<void> {
  try {
    const tokenDocId = token.replace(/[\/\.]/g, '_');
    const tokenRef = doc(db, 'push_tokens', tokenDocId);

    const updates: Record<string, any> = {
      last_active_at: serverTimestamp(),
    };

    if (behaviorUpdate.destination_viewed) {
      updates['behavior.destinations_viewed'] = arrayUnion(behaviorUpdate.destination_viewed);
    }

    if (behaviorUpdate.flow_step_completed) {
      const { destination, step, step_number } = behaviorUpdate.flow_step_completed;
      updates[`behavior.flow_progress.${destination}`] = {
        last_step: step,
        last_step_number: step_number,
        updated_at: new Date().toISOString(),
      };
    }

    if (behaviorUpdate.tool_used) {
      updates['behavior.tools_used'] = arrayUnion(behaviorUpdate.tool_used);
    }

    if (behaviorUpdate.callback_submitted !== undefined) {
      updates['behavior.callback_submitted'] = behaviorUpdate.callback_submitted;
    }

    if (behaviorUpdate.last_screen) {
      updates['behavior.last_screen'] = behaviorUpdate.last_screen;
    }

    await updateDoc(tokenRef, updates);
  } catch (error) {
    // Silent fail — don't break the app for behavior tracking
  }
}

// ─── Permission Check ───────────────────────────────────────────────────────

/**
 * Check if push notification permissions are already granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Notification Listeners ─────────────────────────────────────────────────

/**
 * Set up notification listeners. Call this once in the root layout.
 * Returns cleanup function for useEffect.
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener for when a notification is received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[Notifications] Received:', notification.request.content.title);
      onNotificationReceived?.(notification);
    }
  );

  // Listener for when user taps a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      console.log('[Notifications] Tapped, data:', data);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

// ─── Interaction Counter (for smart prompt timing) ──────────────────────────

const PROMPT_THRESHOLD = 3; // Show prompt after 3 meaningful interactions
let interactionCount = 0;
let promptShown = false;
let onPromptReady: (() => void) | null = null;

/**
 * Register a callback for when the prompt should be shown
 */
export function setPromptReadyCallback(callback: () => void) {
  onPromptReady = callback;
}

/**
 * Record a meaningful user interaction.
 * After threshold interactions, triggers the notification prompt.
 */
export function recordInteraction(): boolean {
  if (promptShown) return false;
  
  interactionCount++;
  
  if (interactionCount >= PROMPT_THRESHOLD) {
    promptShown = true;
    onPromptReady?.();
    return true; // Signal that prompt should show
  }
  
  return false;
}

/**
 * Check if the prompt has already been shown this session
 */
export function hasPromptBeenShown(): boolean {
  return promptShown;
}
