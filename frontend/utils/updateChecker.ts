// GoBaby Travel — App Update Checker (Phase 1)
// Checks backend API only. No Firestore fallback needed.

import Constants from 'expo-constants';

export interface UpdateInfo {
  updateAvailable: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateUrl: string;
  message: string;
}

function getCurrentVersion(): string {
  return Constants.expoConfig?.version || '2.0.0';
}

function compareSemver(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
  }
  return 0;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const currentVersion = getCurrentVersion();
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
  if (!backendUrl) return null;

  try {
    const res = await fetch(`${backendUrl}/api/app-config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const { latest_version, min_version, force_update, update_url, message } = data;
    const needsUpdate = compareSemver(currentVersion, latest_version || '1.0.0') < 0;
    const mustUpdate = compareSemver(currentVersion, min_version || '0.0.0') < 0;
    if (!needsUpdate) return null;
    return {
      updateAvailable: true,
      forceUpdate: force_update || mustUpdate,
      latestVersion: latest_version,
      currentVersion,
      updateUrl: update_url || '',
      message: message || 'A new version of GoBaby Travel is available.',
    };
  } catch {
    return null;
  }
}
