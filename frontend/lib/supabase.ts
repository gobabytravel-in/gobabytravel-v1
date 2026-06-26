import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Provide ws transport for Node SSR (Metro static export uses Node 20 which lacks native WebSocket).
// In the browser/native runtime, the native WebSocket is used automatically.
let realtimeTransport: any = undefined;
if (typeof window === 'undefined') {
  try { realtimeTransport = require('ws'); } catch { /* */ }
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: Platform.OS === 'web' ? undefined : (AsyncStorage as any),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  realtime: realtimeTransport ? { transport: realtimeTransport } : undefined,
});
