import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { GOOGLE_AUTH_ENABLED } from '../constants/features';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { trackScreenView } from '../utils/analytics';
import { useRouter } from 'expo-router';

const TRAVEL_STYLES = ['Solo', 'Couple', 'Family', 'Group', 'Adventure', 'Luxury'];
const BUDGET_PREFS = [
  { key: 'budget', label: 'Budget', icon: 'wallet-outline', color: Theme.teal },
  { key: 'mid', label: 'Mid-range', icon: 'card-outline', color: Theme.primary },
  { key: 'luxury', label: 'Luxury', icon: 'diamond-outline', color: Theme.gold },
];
const INTERESTS = ['Beaches', 'Mountains', 'Cities', 'Culture', 'Food', 'Adventure', 'Wildlife', 'History', 'Nightlife', 'Wellness'];

export default function ProfileScreen() {
  const { user, profile, loading, signInWithGoogle, sendEmailOtp, verifyEmailOtp, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable profile state
  const [travelStyle, setTravelStyle] = useState('');
  const [budgetPref, setBudgetPref] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    trackScreenView('profile');
  }, []);

  // Sync local state from profile
  useEffect(() => {
    if (profile) {
      setTravelStyle(profile.travel_style || '');
      setBudgetPref(profile.budget_preference || '');
      setSelectedInterests(Array.isArray(profile.travel_interests) ? profile.travel_interests : []);
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim() || null,
        travel_style: travelStyle || null,
        budget_preference: budgetPref || null,
        travel_interests: selectedInterests,
      });
      if (!error) {
        setSaveSuccess(true);
        await refreshProfile();
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    const { error } = await sendEmailOtp(email);
    setAuthLoading(false);
    if (error) setAuthError(error);
    else setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    const { error } = await verifyEmailOtp(email, otp);
    setAuthLoading(false);
    if (error) setAuthError(error);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>PROFILE</Text>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.signInCard}>
            <Ionicons name="person-circle-outline" size={56} color={Theme.textSubtle} />
            <Text style={styles.signInTitle}>Welcome to GoBabyTravel</Text>
            <Text style={styles.signInSubtitle}>Sign in to save your trips, track countries visited, and personalize your travel experience.</Text>

            {GOOGLE_AUTH_ENABLED && (
              <>
                <Pressable
                  style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
                  onPress={async () => {
                    setAuthLoading(true);
                    await signInWithGoogle();
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? <ActivityIndicator size="small" color={Theme.bg} /> : (
                    <>
                      <Ionicons name="logo-google" size={20} color={Theme.bg} />
                      <Text style={styles.googleBtnText}>Continue with Google</Text>
                    </>
                  )}
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} /><Text style={styles.dividerText}>or</Text><View style={styles.divider} />
                </View>
              </>
            )}

            {!otpSent ? (
              <>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.textSubtle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable
                  style={({ pressed }) => [styles.emailBtn, pressed && { opacity: 0.85 }, (!email.trim() || authLoading) && { opacity: 0.5 }]}
                  onPress={handleSendOtp}
                  disabled={authLoading || !email.trim()}
                >
                  {authLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.emailBtnText}>Send Sign-in Code</Text>}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.otpHint}>We sent a 6-digit code to {email}</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={Theme.textSubtle}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Pressable
                  style={({ pressed }) => [styles.emailBtn, pressed && { opacity: 0.85 }, (!otp.trim() || authLoading) && { opacity: 0.5 }]}
                  onPress={handleVerifyOtp}
                  disabled={authLoading || !otp.trim()}
                >
                  {authLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.emailBtnText}>Verify Code</Text>}
                </Pressable>
                <Pressable onPress={() => { setOtpSent(false); setOtp(''); }}>
                  <Text style={styles.backLink}>← Use different email</Text>
                </Pressable>
              </>
            )}
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>PROFILE</Text>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={Theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={Theme.textSubtle}
            />
            <Text style={styles.profileEmail}>{user.email}</Text>
            {profile?.passport_id && (
              <View style={styles.passportPill}>
                <Ionicons name="shield-checkmark-outline" size={11} color={Theme.gold} />
                <Text style={styles.passportPillText}>{profile.passport_id}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Travel Style */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRAVEL STYLE</Text>
          <View style={styles.pillRow}>
            {TRAVEL_STYLES.map(style => {
              const active = travelStyle === style.toLowerCase();
              return (
                <Pressable key={style} onPress={() => setTravelStyle(active ? '' : style.toLowerCase())}
                  style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && { opacity: 0.7 }]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{style}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUDGET PREFERENCE</Text>
          <View style={styles.budgetRow}>
            {BUDGET_PREFS.map(bp => {
              const active = budgetPref === bp.key;
              return (
                <Pressable key={bp.key} onPress={() => setBudgetPref(active ? '' : bp.key)}
                  style={({ pressed }) => [styles.budgetCard, active && { borderColor: bp.color + '88', backgroundColor: bp.color + '12' }, pressed && { opacity: 0.7 }]}>
                  <Ionicons name={bp.icon as any} size={20} color={active ? bp.color : Theme.textSubtle} />
                  <Text style={[styles.budgetLabel, active && { color: bp.color }]}>{bp.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Travel Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRAVEL INTERESTS</Text>
          <View style={styles.pillRow}>
            {INTERESTS.map(interest => {
              const active = selectedInterests.includes(interest);
              return (
                <Pressable key={interest} onPress={() => toggleInterest(interest)}
                  style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && { opacity: 0.7 }]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, saveSuccess && { backgroundColor: Theme.teal }, pressed && { opacity: 0.85 }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : (
            <>
              <Ionicons name={saveSuccess ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{saveSuccess ? 'Saved!' : 'Save Profile'}</Text>
            </>
          )}
        </Pressable>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.8 }]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={18} color={Theme.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>GoBaby Travel v2.0 · Every Journey Starts Here</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: { paddingHorizontal: Space.base, paddingTop: Space.lg, paddingBottom: Space.md },
  headerEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: Font.xl, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: Space.base, paddingBottom: Space.xxxl, gap: Space.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  signInCard: {
    backgroundColor: Theme.surface, borderRadius: Radius.xl, padding: Space.xl,
    borderWidth: 1, borderColor: Theme.border, alignItems: 'center', gap: Space.md,
  },
  signInTitle: { fontSize: Font.lg, fontWeight: '800', color: Theme.text, textAlign: 'center' },
  signInSubtitle: { fontSize: Font.sm, color: Theme.textMuted, textAlign: 'center', lineHeight: 20 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm,
    backgroundColor: '#fff', paddingHorizontal: Space.xl, paddingVertical: Space.md,
    borderRadius: Radius.pill, width: '100%', justifyContent: 'center',
  },
  googleBtnText: { color: '#000', fontWeight: '700', fontSize: Font.base },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, width: '100%' },
  divider: { flex: 1, height: 1, backgroundColor: Theme.border },
  dividerText: { color: Theme.textSubtle, fontSize: Font.xs },
  input: {
    width: '100%', backgroundColor: Theme.elevated, borderWidth: 1, borderColor: Theme.border,
    borderRadius: Radius.md, paddingHorizontal: Space.base, paddingVertical: Space.md,
    color: Theme.text, fontSize: Font.sm,
  },
  emailBtn: {
    backgroundColor: Theme.primary, paddingHorizontal: Space.xl, paddingVertical: Space.md,
    borderRadius: Radius.pill, width: '100%', alignItems: 'center',
  },
  emailBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.base },
  otpHint: { fontSize: Font.xs, color: Theme.textMuted, textAlign: 'center' },
  backLink: { fontSize: Font.xs, color: Theme.primary, textDecorationLine: 'underline' },
  errorText: { fontSize: Font.xs, color: Theme.danger, textAlign: 'center' },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Space.md,
    backgroundColor: Theme.surface, borderRadius: Radius.lg, padding: Space.lg,
    borderWidth: 1, borderColor: Theme.border,
  },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Theme.primary + '18',
    borderWidth: 2, borderColor: Theme.primary + '44', alignItems: 'center', justifyContent: 'center',
  },
  nameInput: {
    fontSize: Font.md, fontWeight: '800', color: Theme.text,
    borderBottomWidth: 1, borderBottomColor: Theme.border,
    paddingBottom: 2, marginBottom: 4,
  },
  profileEmail: { fontSize: Font.xs, color: Theme.textMuted },
  passportPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Space.sm,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.pill, backgroundColor: Theme.gold + '12', borderWidth: 1, borderColor: Theme.gold + '32',
  },
  passportPillText: { fontSize: 10, fontWeight: '700', color: Theme.gold },

  section: {
    backgroundColor: Theme.surface, borderRadius: Radius.lg, padding: Space.lg,
    borderWidth: 1, borderColor: Theme.border, gap: Space.md,
  },
  sectionLabel: { fontSize: Font.xxs, fontWeight: '700', color: Theme.textSubtle, letterSpacing: 1.5 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  pill: {
    paddingHorizontal: Space.md, paddingVertical: 6, borderRadius: Radius.pill,
    backgroundColor: Theme.whiteAlpha04, borderWidth: 1, borderColor: Theme.border,
  },
  pillActive: { backgroundColor: Theme.primary + '18', borderColor: Theme.primary + '44' },
  pillText: { fontSize: Font.xs, fontWeight: '600', color: Theme.textMuted },
  pillTextActive: { color: Theme.primary },
  budgetRow: { flexDirection: 'row', gap: Space.sm },
  budgetCard: {
    flex: 1, alignItems: 'center', gap: Space.sm, paddingVertical: Space.md,
    borderRadius: Radius.md, backgroundColor: Theme.whiteAlpha04, borderWidth: 1, borderColor: Theme.border,
  },
  budgetLabel: { fontSize: Font.xs, fontWeight: '700', color: Theme.textMuted },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Space.sm,
    paddingVertical: Space.md, borderRadius: Radius.pill, backgroundColor: Theme.primary,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.base },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Space.sm,
    paddingVertical: Space.md, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Theme.danger + '44', backgroundColor: Theme.danger + '10',
  },
  signOutText: { fontSize: Font.base, fontWeight: '700', color: Theme.danger },
  versionText: { fontSize: Font.xxs, color: Theme.textSubtle, textAlign: 'center', fontStyle: 'italic' },
});
