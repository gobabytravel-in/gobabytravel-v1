import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Alert,
  TextInput, Image, Modal, FlatList, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { GOOGLE_AUTH_ENABLED } from '../constants/features';
import { trackScreenView } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DESTINATIONS, POPULAR_COUNTRIES, getDailyDestination, Destination } from '../lib/destinations';
import BrandManifesto from '../components/BrandManifesto';

type CountryRow = { id: number; country_code: string; country_name: string; visited_at: string };
type DreamRow = { id: number; destination_id: string; destination_name: string; destination_image: string | null; destination_country: string | null };

export default function TravelPassportScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [dreams, setDreams] = useState<DreamRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const daily = useMemo(() => getDailyDestination(), []);
  const dailySaved = useMemo(() => dreams.some((d) => d.destination_id === daily.id), [dreams, daily.id]);

  useEffect(() => { trackScreenView('travel_passport'); }, []);
  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [{ data: c }, { data: d }] = await Promise.all([
        supabase.from('countries_visited').select('*').eq('user_id', user.id).order('visited_at', { ascending: false }),
        supabase.from('saved_dreams').select('*').eq('user_id', user.id).order('saved_at', { ascending: false }),
      ]);
      setCountries((c as CountryRow[]) || []);
      setDreams((d as DreamRow[]) || []);
    } catch (e) { /* silent */ }
    setDataLoading(false);
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error && !error.toLowerCase().includes('cancel')) {
      Alert.alert('Sign in', error);
    }
  };
  const handleEmail = () => router.push('/email-otp' as any);
  const handleMobileComingSoon = () => Alert.alert('Coming soon', 'Mobile OTP sign-in will be available in a future update.');
  const handleSocialComingSoon = (p: string) => Alert.alert(p, `${p} sign-in is coming in a future update.`);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'You will need to sign in again to view your passport.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const addCountry = async (c: { code: string; name: string }) => {
    if (!user) return;
    if (countries.some((r) => r.country_code === c.code)) {
      setShowAddCountry(false);
      return;
    }
    const { error, data } = await supabase
      .from('countries_visited')
      .insert({ user_id: user.id, country_code: c.code, country_name: c.name })
      .select()
      .single();
    if (!error && data) setCountries((prev) => [data as CountryRow, ...prev]);
    setShowAddCountry(false);
    setCountrySearch('');
  };

  const removeCountry = async (id: number) => {
    if (!user) return;
    await supabase.from('countries_visited').delete().eq('id', id).eq('user_id', user.id);
    setCountries((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleDream = async (dest: Destination) => {
    if (!user) return;
    const existing = dreams.find((d) => d.destination_id === dest.id);
    if (existing) {
      await supabase.from('saved_dreams').delete().eq('id', existing.id).eq('user_id', user.id);
      setDreams((prev) => prev.filter((d) => d.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('saved_dreams')
        .insert({
          user_id: user.id,
          destination_id: dest.id,
          destination_name: dest.name,
          destination_image: dest.image,
          destination_country: dest.country,
        })
        .select()
        .single();
      if (!error && data) setDreams((prev) => [data as DreamRow, ...prev]);
    }
  };

  const exploreDestination = (dest: Destination) => Linking.openURL(dest.exploreUrl).catch(() => {});

  const passportScore = countries.length + dreams.length;
  const filteredCountries = POPULAR_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.trim().toLowerCase()),
  );

  // ─── LOADING ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={Theme.gold} />
      </SafeAreaView>
    );
  }

  // ─── LOGGED OUT STATE ────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
        <View style={styles.header}>
          <Pressable onPress={openDrawer} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color={Theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Travel Passport</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: Space.xxxl }} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.passportEmblem}>
              <View style={styles.emblemRing} />
              <Ionicons name="earth" size={42} color={Theme.gold} />
            </View>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>YOUR TRAVEL UNIVERSE</Text>
            </View>
            <Text style={styles.title}>Create Your{'\n'}<Text style={styles.titleAccent}>Travel Passport</Text></Text>
            <Text style={styles.subtitle}>Save dream destinations, track countries visited, and build your personal Passport Score.</Text>
          </View>

          <View style={styles.benefitsCard}>
            <Benefit icon="bookmark" color={Theme.primary} label="Save Dream Destinations" />
            <Benefit icon="flag" color={Theme.teal} label="Track Countries Visited" />
            <Benefit icon="medal" color={Theme.gold} label="Build Your Passport Score" />
            <Benefit icon="sparkles" color={Theme.coral} label="Discover Daily Travel Inspiration" />
          </View>

          <View style={styles.authSection}>
            <Text style={styles.authEyebrow}>SIGN IN</Text>
            {GOOGLE_AUTH_ENABLED && (
              <AuthButton icon="logo-google" label="Continue with Google" onPress={handleGoogle} primary loading={busy} />
            )}
            <AuthButton icon="mail" label="Continue with Email" onPress={handleEmail} primary={!GOOGLE_AUTH_ENABLED} />
            <AuthButton icon="phone-portrait" label="Mobile Login" onPress={handleMobileComingSoon} comingSoon />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.comingSoonRow}>
              <ComingSoonChip label="Kakao" icon="chatbubble-ellipses" onPress={() => handleSocialComingSoon('Kakao')} />
              <ComingSoonChip label="LINE" icon="logo-electron" onPress={() => handleSocialComingSoon('LINE')} />
              <ComingSoonChip label="WeChat" icon="chatbox-ellipses" onPress={() => handleSocialComingSoon('WeChat')} />
            </View>
          </View>

          <Text style={styles.fineprint}>
            By continuing you agree to our{' '}
            <Text style={styles.link} onPress={() => router.push('/terms' as any)}>Terms</Text>{' '}and{' '}
            <Text style={styles.link} onPress={() => router.push('/privacy' as any)}>Privacy Policy</Text>.
          </Text>
          <BrandManifesto />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── LOGGED IN STATE ─────────────────────────────────────────────
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Traveler';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
      <View style={styles.header}>
        <Pressable onPress={openDrawer} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="menu" size={22} color={Theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Travel Passport</Text>
        <Pressable onPress={handleSignOut} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="log-out-outline" size={20} color={Theme.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: Space.xxxl }} showsVerticalScrollIndicator={false}>
        {/* ── Passport Card ─────────────────────────────────────────────────────── */}
        <View style={styles.passportCard}>
          <View style={styles.passportCardGlow} pointerEvents="none" />
          <View style={styles.passportTopRow}>
            <Text style={styles.passportLabel}>GOBABY TRAVEL · PASSPORT</Text>
            <View style={styles.passportFlag}>
              <Ionicons name="airplane" size={12} color={Theme.gold} />
            </View>
          </View>

          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</Text>
            </View>
          )}

          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.passportDetails}>
            <PassportField label="Passport ID" value={profile?.passport_id || '—'} mono />
            <PassportField label="Member Since" value={memberSince} />
            <PassportField label="Country" value={profile?.country || '—'} />
            <PassportField label="Travel Style" value={profile?.travel_style || '—'} />
          </View>
        </View>

        {/* ── Stats ─────────────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <Stat label="Passport Score" value={passportScore.toString()} color={Theme.gold} />
          <Stat label="Countries" value={`${countries.length}/195`} color={Theme.teal} />
          <Stat label="Dreams" value={dreams.length.toString()} color={Theme.primary} />
        </View>

        {/* ── Daily Discovery ───────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionEyebrow}>TODAY'S DISCOVERY</Text>
            <Text style={styles.sectionTitle}>{daily.name}, {daily.country}</Text>
          </View>
          <View style={styles.discoveryCard}>
            <Image source={{ uri: daily.image }} style={styles.discoveryImage} />
            <View style={styles.discoveryOverlay}>
              <Text style={styles.discoveryTagline}>{daily.tagline}</Text>
              <View style={styles.discoveryActions}>
                <Pressable
                  onPress={() => toggleDream(daily)}
                  style={({ pressed }) => [styles.discoveryBtn, dailySaved && styles.discoveryBtnActive, pressed && { opacity: 0.85 }]}
                >
                  <Ionicons name={dailySaved ? 'bookmark' : 'bookmark-outline'} size={14} color={dailySaved ? Theme.bg : Theme.text} />
                  <Text style={[styles.discoveryBtnText, dailySaved && { color: Theme.bg }]}>{dailySaved ? 'Saved' : 'Save'}</Text>
                </Pressable>
                <Pressable onPress={() => exploreDestination(daily)} style={({ pressed }) => [styles.discoveryBtn, styles.discoveryBtnPrimary, pressed && { opacity: 0.85 }]}>
                  <Text style={[styles.discoveryBtnText, { color: Theme.bg }]}>Explore</Text>
                  <Ionicons name="arrow-forward" size={14} color={Theme.bg} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ── Countries Visited ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionEyebrow}>COUNTRIES VISITED</Text>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>{countries.length}/195</Text>
              <Pressable onPress={() => setShowAddCountry(true)} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}>
                <Ionicons name="add" size={16} color={Theme.bg} />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
          {countries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="flag-outline" size={28} color={Theme.textSubtle} />
              <Text style={styles.emptyText}>Start by adding a country you've already visited.</Text>
            </View>
          ) : (
            <View style={styles.countryGrid}>
              {countries.map((c) => (
                <Pressable
                  key={c.id}
                  onLongPress={() => Alert.alert('Remove?', `Remove ${c.country_name} from your passport?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeCountry(c.id) },
                  ])}
                  style={styles.countryChip}
                >
                  <Text style={styles.countryCode}>{c.country_code}</Text>
                  <Text style={styles.countryName}>{c.country_name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Saved Dreams ──────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionEyebrow}>SAVED DREAMS</Text>
            <Text style={styles.sectionTitle}>{dreams.length} destinations</Text>
          </View>
          {dreams.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="bookmark-outline" size={28} color={Theme.textSubtle} />
              <Text style={styles.emptyText}>No dreams saved yet. Tap any destination below to start your wishlist.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Space.base, gap: Space.md }}>
              {dreams.map((d) => {
                const dest = DESTINATIONS.find((dx) => dx.id === d.destination_id);
                return (
                  <Pressable key={d.id} onPress={() => dest && exploreDestination(dest)} style={styles.dreamCard}>
                    {d.destination_image ? <Image source={{ uri: d.destination_image }} style={styles.dreamImg} /> : <View style={[styles.dreamImg, { backgroundColor: Theme.elevated }]} />}
                    <View style={styles.dreamOverlay}>
                      <Text style={styles.dreamName}>{d.destination_name}</Text>
                      <Text style={styles.dreamCountry}>{d.destination_country}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── Explore More Destinations ────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionEyebrow}>BUILD YOUR WISHLIST</Text>
            <Text style={styles.sectionTitle}>Hand-picked destinations</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Space.base, gap: Space.md }}>
            {DESTINATIONS.map((d) => {
              const isSaved = dreams.some((dr) => dr.destination_id === d.id);
              return (
                <View key={d.id} style={styles.exploreCard}>
                  <Image source={{ uri: d.image }} style={styles.exploreImg} />
                  <View style={styles.exploreOverlay}>
                    <Text style={styles.exploreName}>{d.name}</Text>
                    <Text style={styles.exploreCountry}>{d.country}</Text>
                    <Pressable onPress={() => toggleDream(d)} style={({ pressed }) => [styles.exploreBtn, isSaved && styles.exploreBtnActive, pressed && { opacity: 0.85 }]}>
                      <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={13} color={isSaved ? Theme.bg : Theme.text} />
                      <Text style={[styles.exploreBtnText, isSaved && { color: Theme.bg }]}>{isSaved ? 'Saved' : 'Save'}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BrandManifesto />
      </ScrollView>

      {/* ── Add Country Modal ──────────────────────────────────────────────────── */}
      <Modal visible={showAddCountry} animationType="slide" transparent onRequestClose={() => setShowAddCountry(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add a country you've visited</Text>
            <View style={styles.modalSearch}>
              <Ionicons name="search" size={16} color={Theme.textMuted} />
              <TextInput
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search countries…"
                placeholderTextColor={Theme.textSubtle}
                style={styles.modalSearchInput}
                autoCapitalize="words"
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const already = countries.some((c) => c.country_code === item.code);
                return (
                  <Pressable
                    onPress={() => !already && addCountry(item)}
                    style={({ pressed }) => [styles.modalRow, pressed && { opacity: 0.7 }]}
                    disabled={already}
                  >
                    <Text style={styles.modalRowCode}>{item.code}</Text>
                    <Text style={[styles.modalRowName, already && { color: Theme.textSubtle }]}>{item.name}</Text>
                    {already && <Ionicons name="checkmark" size={18} color={Theme.gold} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text style={styles.modalEmpty}>No matches.</Text>}
              style={{ maxHeight: 360 }}
            />
            <Pressable onPress={() => setShowAddCountry(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Benefit({ icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <View style={styles.benefit}>
      <View style={[styles.benefitDot, { backgroundColor: `${color}1f`, borderColor: `${color}55` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.benefitLabel}>{label}</Text>
    </View>
  );
}
function AuthButton({ icon, label, onPress, primary, loading, comingSoon }: any) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [
      styles.authBtn, primary && styles.authBtnPrimary, comingSoon && styles.authBtnSoon,
      pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
    ]}>
      <Ionicons name={icon} size={18} color={primary ? Theme.bg : Theme.text} />
      <Text style={[styles.authBtnText, primary && styles.authBtnTextPrimary]}>{label}</Text>
      {loading ? <ActivityIndicator size="small" color={primary ? Theme.bg : Theme.text} /> :
        comingSoon ? <Text style={styles.soonBadge}>Soon</Text> :
          <Ionicons name="arrow-forward" size={16} color={primary ? Theme.bg : Theme.textMuted} />}
    </Pressable>
  );
}
function ComingSoonChip({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.csChip, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={15} color={Theme.textMuted} />
      <Text style={styles.csChipLabel}>{label}</Text>
      <Text style={styles.csChipSoon}>Soon</Text>
    </Pressable>
  );
}
function PassportField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.passportField}>
      <Text style={styles.passportFieldLabel}>{label}</Text>
      <Text style={[styles.passportFieldValue, mono && { fontFamily: 'Courier' }]}>{value}</Text>
    </View>
  );
}
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.base, paddingVertical: Space.md },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.whiteAlpha06, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Font.md, color: Theme.text, fontWeight: '700', letterSpacing: -0.3 },

  // Logged-out hero
  hero: { paddingHorizontal: Space.xl, paddingTop: Space.lg, paddingBottom: Space.xl, alignItems: 'center' },
  passportEmblem: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(240,180,41,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: Space.lg },
  emblemRing: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: 'rgba(240,180,41,0.32)' },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(240,180,41,0.10)', borderWidth: 1, borderColor: 'rgba(240,180,41,0.30)', paddingHorizontal: Space.md, paddingVertical: 6, borderRadius: Radius.pill, marginBottom: Space.base },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.gold },
  eyebrowText: { fontSize: Font.xxs, fontWeight: '800', color: Theme.gold, letterSpacing: 1.6 },
  title: { fontSize: Font.xl + 4, fontWeight: '900', color: Theme.text, lineHeight: 38, letterSpacing: -1.2, textAlign: 'center', marginBottom: Space.md },
  titleAccent: { color: Theme.gold, fontStyle: 'italic', fontWeight: '600' },
  subtitle: { fontSize: Font.sm + 1, color: Theme.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 320, fontWeight: '500' },

  benefitsCard: { marginHorizontal: Space.base, marginTop: Space.md, padding: Space.lg, backgroundColor: Theme.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Theme.border, gap: Space.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  benefitDot: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  benefitLabel: { fontSize: Font.sm + 1, color: Theme.text, fontWeight: '600', flex: 1 },

  authSection: { paddingHorizontal: Space.base, paddingTop: Space.xxl, gap: Space.sm + 2 },
  authEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: Space.xs, paddingHorizontal: Space.sm },
  authBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg, paddingVertical: 14, borderRadius: Radius.pill, backgroundColor: Theme.surface, borderWidth: 1, borderColor: Theme.border, gap: Space.md },
  authBtnPrimary: { backgroundColor: Theme.text, borderColor: Theme.text },
  authBtnSoon: { opacity: 0.6 },
  authBtnText: { fontSize: Font.sm + 1, fontWeight: '700', color: Theme.text, flex: 1 },
  authBtnTextPrimary: { color: Theme.bg },
  soonBadge: { fontSize: 9, color: Theme.gold, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(240,180,41,0.12)', borderRadius: 4 },

  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: Space.sm, gap: Space.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Theme.border },
  dividerText: { fontSize: Font.xxs, color: Theme.textSubtle, letterSpacing: 2, fontWeight: '700' },
  comingSoonRow: { flexDirection: 'row', gap: Space.sm },
  csChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: Space.sm, borderRadius: Radius.pill, backgroundColor: Theme.whiteAlpha04, borderWidth: 1, borderColor: Theme.border },
  csChipLabel: { fontSize: Font.xs, color: Theme.textMuted, fontWeight: '700' },
  csChipSoon: { fontSize: 9, color: Theme.gold, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 5, paddingVertical: 2, backgroundColor: 'rgba(240,180,41,0.12)', borderRadius: 4 },
  fineprint: { fontSize: Font.xxs + 1, color: Theme.textSubtle, textAlign: 'center', marginTop: Space.xl, paddingHorizontal: Space.xl, lineHeight: 16 },
  link: { color: Theme.primary, fontWeight: '700' },

  // Logged-in: Passport card
  passportCard: { marginHorizontal: Space.base, marginTop: Space.md, padding: Space.lg, backgroundColor: '#0a1729', borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(240,180,41,0.22)', overflow: 'hidden', position: 'relative' },
  passportCardGlow: { position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(240,180,41,0.10)' },
  passportTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.lg },
  passportLabel: { fontSize: Font.xxs, fontWeight: '800', color: Theme.gold, letterSpacing: 1.8 },
  passportFlag: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(240,180,41,0.18)', borderWidth: 1, borderColor: 'rgba(240,180,41,0.32)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 78, height: 78, borderRadius: 39, marginBottom: Space.md, borderWidth: 2, borderColor: Theme.gold },
  avatarFallback: { backgroundColor: Theme.elevated, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: Theme.gold, letterSpacing: -1 },
  userName: { fontSize: Font.lg, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },
  userEmail: { fontSize: Font.xs + 1, color: Theme.textMuted, marginBottom: Space.lg },
  passportDetails: { gap: Space.sm, paddingTop: Space.md, borderTopWidth: 1, borderTopColor: 'rgba(240,180,41,0.18)' },
  passportField: { flexDirection: 'row', justifyContent: 'space-between' },
  passportFieldLabel: { fontSize: Font.xxs + 1, color: Theme.textSubtle, fontWeight: '600', letterSpacing: 0.8 },
  passportFieldValue: { fontSize: Font.xs + 1, color: Theme.text, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: Space.base, marginTop: Space.lg, gap: Space.sm },
  statCard: { flex: 1, paddingVertical: Space.md, paddingHorizontal: Space.sm, backgroundColor: Theme.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Theme.border, alignItems: 'center' },
  statValue: { fontSize: Font.lg + 4, fontWeight: '900', letterSpacing: -1 },
  statLabel: { fontSize: 10, color: Theme.textMuted, fontWeight: '700', letterSpacing: 1, marginTop: 2 },

  // Sections
  section: { paddingTop: Space.xl, paddingBottom: Space.xs },
  sectionHead: { paddingHorizontal: Space.lg, marginBottom: Space.md },
  sectionHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: Font.lg, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Space.md, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Theme.gold },
  addBtnText: { fontSize: Font.xs + 1, fontWeight: '700', color: Theme.bg },

  emptyCard: { marginHorizontal: Space.base, padding: Space.lg, backgroundColor: Theme.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Theme.border, borderStyle: 'dashed', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: Font.xs + 1, color: Theme.textMuted, textAlign: 'center', fontStyle: 'italic' },

  // Daily Discovery
  discoveryCard: { marginHorizontal: Space.base, height: 220, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Theme.elevated },
  discoveryImage: { width: '100%', height: '100%' },
  discoveryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Space.lg, backgroundColor: 'rgba(6,15,32,0.78)' },
  discoveryTagline: { fontSize: Font.sm, color: Theme.text, fontStyle: 'italic', marginBottom: Space.md, fontWeight: '500' },
  discoveryActions: { flexDirection: 'row', gap: Space.sm },
  discoveryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Space.md, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  discoveryBtnActive: { backgroundColor: Theme.gold, borderColor: Theme.gold },
  discoveryBtnPrimary: { backgroundColor: Theme.text, borderColor: Theme.text },
  discoveryBtnText: { fontSize: Font.xs + 1, fontWeight: '700', color: Theme.text },

  // Country chips
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Space.base, gap: Space.sm },
  countryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Space.md, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Theme.surface, borderWidth: 1, borderColor: Theme.border },
  countryCode: { fontSize: Font.xs, fontWeight: '800', color: Theme.gold, letterSpacing: 0.5 },
  countryName: { fontSize: Font.xs + 1, color: Theme.text, fontWeight: '600' },

  // Dream / Explore horizontal cards
  dreamCard: { width: 150, height: 200, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Theme.elevated },
  dreamImg: { width: '100%', height: '100%' },
  dreamOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Space.md, backgroundColor: 'rgba(6,15,32,0.82)' },
  dreamName: { fontSize: Font.sm + 1, fontWeight: '800', color: Theme.text, letterSpacing: -0.3 },
  dreamCountry: { fontSize: Font.xxs + 1, color: Theme.textMuted, marginTop: 2 },

  exploreCard: { width: 180, height: 240, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Theme.elevated, position: 'relative' },
  exploreImg: { width: '100%', height: '100%' },
  exploreOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Space.md, backgroundColor: 'rgba(6,15,32,0.85)' },
  exploreName: { fontSize: Font.sm + 1, fontWeight: '800', color: Theme.text, letterSpacing: -0.3 },
  exploreCountry: { fontSize: Font.xxs + 1, color: Theme.textMuted, marginTop: 2, marginBottom: Space.sm },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  exploreBtnActive: { backgroundColor: Theme.gold, borderColor: Theme.gold },
  exploreBtnText: { fontSize: Font.xxs + 1, fontWeight: '700', color: Theme.text },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Theme.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Space.lg, paddingTop: Space.md, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, backgroundColor: Theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: Space.md },
  modalTitle: { fontSize: Font.md, fontWeight: '800', color: Theme.text, marginBottom: Space.md },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.elevated, borderRadius: Radius.md, paddingHorizontal: Space.md, gap: Space.sm, marginBottom: Space.md },
  modalSearchInput: { flex: 1, color: Theme.text, fontSize: Font.sm + 1, paddingVertical: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Space.sm, borderBottomWidth: 1, borderBottomColor: Theme.border, gap: Space.md },
  modalRowCode: { fontSize: Font.xs, fontWeight: '800', color: Theme.gold, letterSpacing: 0.5, width: 32 },
  modalRowName: { flex: 1, fontSize: Font.sm + 1, color: Theme.text, fontWeight: '600' },
  modalEmpty: { textAlign: 'center', color: Theme.textMuted, padding: Space.lg },
  modalClose: { paddingVertical: 14, alignItems: 'center', backgroundColor: Theme.gold, borderRadius: Radius.pill, marginTop: Space.md },
  modalCloseText: { fontSize: Font.sm + 1, fontWeight: '800', color: Theme.bg },
});
