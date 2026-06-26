// GoBaby Travel — Permissions Helper
// Requests device permissions in a specific order and stores results in Firestore.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserId } from './userIdentity';

const SETUP_COMPLETE_KEY = '@gobaby_setup_complete';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'skipped';

export interface PermissionResults {
  notifications: PermissionStatus;
  location: PermissionStatus;
  camera: PermissionStatus;
  photos: PermissionStatus;
  microphone: PermissionStatus;
  contacts: PermissionStatus;
}

const defaultResults: PermissionResults = {
  notifications: 'undetermined',
  location: 'undetermined',
  camera: 'undetermined',
  photos: 'undetermined',
  microphone: 'undetermined',
  contacts: 'undetermined',
};

/**
 * Check if Travel Setup has been completed.
 */
export async function isSetupComplete(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(SETUP_COMPLETE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark Travel Setup as complete.
 */
export async function markSetupComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(SETUP_COMPLETE_KEY, 'true');
  } catch {
    // Silent
  }
}

/**
 * Request all permissions in order. Returns results for each.
 * Each permission is requested sequentially with proper error handling.
 */
export async function requestAllPermissions(
  onProgress?: (step: string, index: number) => void
): Promise<PermissionResults> {
  const results: PermissionResults = { ...defaultResults };

  // 1. Notifications
  onProgress?.('notifications', 0);
  try {
    const Notifications = require('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    results.notifications = status === 'granted' ? 'granted' : 'denied';
  } catch {
    results.notifications = 'denied';
  }

  // 2. Location
  onProgress?.('location', 1);
  try {
    const Location = require('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    results.location = status === 'granted' ? 'granted' : 'denied';

    // If granted, store last known location
    if (status === 'granted') {
      try {
        const loc = await Location.getLastKnownPositionAsync({});
        if (loc) {
          await storeLastLocation(loc.coords.latitude, loc.coords.longitude);
        }
      } catch {
        // Silent — location may not be available
      }
    }
  } catch {
    results.location = 'denied';
  }

  // 3. Camera
  onProgress?.('camera', 2);
  try {
    const Camera = require('expo-camera');
    const { status } = await Camera.requestCameraPermissionsAsync();
    results.camera = status === 'granted' ? 'granted' : 'denied';
  } catch {
    results.camera = 'denied';
  }

  // 4. Photos (Media Library)
  onProgress?.('photos', 3);
  try {
    const MediaLibrary = require('expo-media-library');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    results.photos = status === 'granted' ? 'granted' : 'denied';
  } catch {
    results.photos = 'denied';
  }

  // 5. Microphone
  onProgress?.('microphone', 4);
  try {
    const { Audio } = require('expo-av');
    const { status } = await Audio.requestPermissionsAsync();
    results.microphone = status === 'granted' ? 'granted' : 'denied';
  } catch {
    results.microphone = 'denied';
  }

  // 6. Contacts
  onProgress?.('contacts', 5);
  try {
    const Contacts = require('expo-contacts');
    const { status } = await Contacts.requestPermissionsAsync();
    results.contacts = status === 'granted' ? 'granted' : 'denied';
  } catch {
    results.contacts = 'denied';
  }

  // Store results to Firestore
  await storePermissionResults(results);
  await markSetupComplete();

  return results;
}

/**
 * Store permission results to Firestore.
 */
async function storePermissionResults(results: PermissionResults): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    await setDoc(doc(db, 'user_permissions', userId), {
      user_id: userId,
      platform: Platform.OS,
      ...results,
      updated_at: serverTimestamp(),
    }, { merge: true });
  } catch {
    // Silent
  }
}

/**
 * Store last known location to Firestore.
 */
async function storeLastLocation(lat: number, lng: number): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    await setDoc(doc(db, 'user_permissions', userId), {
      last_known_location: { lat, lng },
      location_updated_at: serverTimestamp(),
    }, { merge: true });
  } catch {
    // Silent
  }
}

/**
 * Skip setup — mark as complete with 'skipped' statuses.
 */
export async function skipSetup(): Promise<void> {
  // Mark complete FIRST (critical for navigation guard)
  await markSetupComplete();

  // Fire-and-forget Firestore write (non-blocking)
  const userId = getUserId();
  if (!userId) return;
  try {
    setDoc(doc(db, 'user_permissions', userId), {
      user_id: userId,
      platform: Platform.OS,
      notifications: 'skipped',
      location: 'skipped',
      camera: 'skipped',
      photos: 'skipped',
      microphone: 'skipped',
      contacts: 'skipped',
      setup_skipped: true,
      updated_at: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  } catch {
    // Silent
  }
}
