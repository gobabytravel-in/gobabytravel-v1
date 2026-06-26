import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  travel_style: string | null;
  passport_id: string | null;
  created_at: string;
  last_login: string | null;
  login_count: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  sendEmailOtp: (email: string) => Promise<{ error: string | null }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from supabase profiles table
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      // Silent
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfile(user.id);
  }, [user?.id, loadProfile]);

  useEffect(() => {
    // Restore session on startup
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadProfile(s.user.id);
        // Bump last_login + login_count on every fresh sign-in
        if (event === 'SIGNED_IN') {
          try {
            await supabase.rpc('bump_login_meta', { uid: s.user.id }).then(() => {});
          } catch { /* RPC optional */ }
        }
      } else {
        setProfile(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [loadProfile]);

  // Google OAuth via Supabase + browser flow
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'gobaby-travel',
        path: 'auth-callback',
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });
      if (error) return { error: error.message };
      if (Platform.OS !== 'web' && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          // Parse session tokens from URL
          const url = result.url;
          const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
            if (setErr) return { error: setErr.message };
          }
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          return { error: 'Sign-in cancelled' };
        }
      }
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Google sign-in failed' };
    }
  };

  const sendEmailOtp = async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Failed to send code' };
    }
  };

  const verifyEmailOtp = async (email: string, token: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email',
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Invalid code' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signInWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
