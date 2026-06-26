import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { trackScreenView } from '../utils/analytics';
import { useRouter } from 'expo-router';

interface CountryVisited {
  id: number;
  country_code: string;
  country_name: string;
}

interface Dream {
  id: number;
  destination_name: string;
  destination_country: string;
}

export default function PassportScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [countries, setCountries] = useState<CountryVisited[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [addCountry, setAddCountry] = useState('');
  const [addDream, setAddDream] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackScreenView('passport');
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        supabase.from('countries_visited').select('*').eq('user_id', user!.id).order('visited_at', { ascending: false }),
        supabase.from('saved_dreams').select('*').eq('user_id', user!.id).order('saved_at', { ascending: false }),
      ]);
      setCountries(c.data || []);
      setDreams(d.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCountry = async () => {
    if (!addCountry.trim() || !user) return;
    const { data, error } = await supabase.from('countries_visited').insert({
      user_id: user.id,
      country_code: addCountry.trim().toUpperCase().slice(0, 2),
      country_name: addCountry.trim(),
    }).select().single();
    if (!error && data) {
      setCountries(prev => [data as CountryVisited, ...prev]);
      setAddCountry('');
    }
  };

  const handleRemoveCountry = async (id: number) => {
    await supabase.from('countries_visited').delete().eq('id', id);
    setCountries(prev => prev.filter(c => c.id !== id));
  };

  const handleAddDream = async () => {
    if (!addDream.trim() || !user) return;
    const { data, error } = await supabase.from('saved_dreams').insert({
      user_id: user.id,
      destination_id: addDream.trim().toLowerCase().replace(/\s+/g, '-'),
      destination_name: addDream.trim(),
      destination_country: addDream.trim(),
    }).select().single();
    if (!error && data) {
      setDreams(prev => [data as Dream, ...prev]);
      setAddDream('');
    }
  };

  const handleRemoveDream = async (id: number) => {
    await supabase.from('saved_dreams').delete().eq('id', id);
    setDreams(prev => prev.filter(d => d.id !== id));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>TRAVEL PASSPORT</Text>
          <Text style={styles.headerTitle}>Your Journey Map</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="book-outline" size={48} color={Theme.textSubtle} />
          <Text style={styles.emptyTitle}>Sign in to access your Passport</Text>
          <Text style={styles.emptySubtitle}>Track countries visited, save dream destinations, and build your travel story.</Text>
          <Pressable style={styles.signInBtn} onPress={() => router.push('/profile' as any)}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>TRAVEL PASSPORT</Text>
        <Text style={styles.headerTitle}>Your Journey Map</Text>
        {profile?.passport_id && (
          <View style={styles.passportBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={Theme.gold} />
            <Text style={styles.passportId}>{profile.passport_id}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Countries Visited */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="earth-outline" size={18} color={Theme.teal} />
            </View>
            <Text style={styles.sectionTitle}>Countries Visited</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{countries.length}</Text>
            </View>
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={addCountry}
              onChangeText={setAddCountry}
              placeholder="Add a country..."
              placeholderTextColor={Theme.textSubtle}
              onSubmitEditing={handleAddCountry}
              returnKeyType="done"
            />
            <Pressable style={styles.addBtn} onPress={handleAddCountry}>
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
          {countries.length === 0 ? (
            <Text style={styles.emptyHint}>Add your first destination above</Text>
          ) : (
            <View style={styles.tagGrid}>
              {countries.map(c => (
                <View key={c.id} style={[styles.tag, { borderColor: Theme.teal + '44' }]}>
                  <Text style={[styles.tagText, { color: Theme.teal }]}>{c.country_name}</Text>
                  <Pressable onPress={() => handleRemoveCountry(c.id)} hitSlop={8}>
                    <Ionicons name="close" size={12} color={Theme.teal} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Dream Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="star-outline" size={18} color={Theme.gold} />
            </View>
            <Text style={styles.sectionTitle}>Dream Destinations</Text>
            <View style={[styles.countBadge, { backgroundColor: Theme.gold + '18' }]}>
              <Text style={[styles.countBadgeText, { color: Theme.gold }]}>{dreams.length}</Text>
            </View>
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={addDream}
              onChangeText={setAddDream}
              placeholder="Add a dream destination..."
              placeholderTextColor={Theme.textSubtle}
              onSubmitEditing={handleAddDream}
              returnKeyType="done"
            />
            <Pressable style={[styles.addBtn, { backgroundColor: Theme.gold }]} onPress={handleAddDream}>
              <Ionicons name="add" size={20} color={Theme.bg} />
            </Pressable>
          </View>
          {dreams.length === 0 ? (
            <Text style={styles.emptyHint}>Where do you dream of going?</Text>
          ) : (
            <View style={styles.tagGrid}>
              {dreams.map(d => (
                <View key={d.id} style={[styles.tag, { borderColor: Theme.gold + '44' }]}>
                  <Ionicons name="star" size={10} color={Theme.gold} />
                  <Text style={[styles.tagText, { color: Theme.gold }]}>{d.destination_name}</Text>
                  <Pressable onPress={() => handleRemoveDream(d.id)} hitSlop={8}>
                    <Ionicons name="close" size={12} color={Theme.gold} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{countries.length}</Text>
            <Text style={styles.statLabel}>Countries Visited</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dreams.length}</Text>
            <Text style={styles.statLabel}>Dream Destinations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.max(0, 195 - countries.length)}</Text>
            <Text style={styles.statLabel}>Yet to Explore</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: { paddingHorizontal: Space.base, paddingTop: Space.lg, paddingBottom: Space.md },
  headerEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: Font.xl, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },
  passportBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Space.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Theme.gold + '12',
    borderWidth: 1, borderColor: Theme.gold + '32',
  },
  passportId: { fontSize: Font.xxs, fontWeight: '700', color: Theme.gold, letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Space.base, paddingBottom: Space.xxxl, gap: Space.lg },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Space.xl, gap: Space.lg },
  emptyTitle: { fontSize: Font.md, fontWeight: '700', color: Theme.text, textAlign: 'center' },
  emptySubtitle: { fontSize: Font.sm, color: Theme.textMuted, textAlign: 'center', lineHeight: 20 },
  signInBtn: { paddingHorizontal: Space.xxl, paddingVertical: Space.md, borderRadius: Radius.pill, backgroundColor: Theme.primary },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.base },

  section: {
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: Space.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  sectionIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Theme.teal + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { flex: 1, fontSize: Font.base, fontWeight: '700', color: Theme.text },
  countBadge: {
    paddingHorizontal: Space.sm, paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Theme.teal + '18',
  },
  countBadgeText: { fontSize: Font.xxs, fontWeight: '700', color: Theme.teal },
  addRow: { flexDirection: 'row', gap: Space.sm },
  addInput: {
    flex: 1,
    backgroundColor: Theme.elevated,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    color: Theme.text,
    fontSize: Font.sm,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Theme.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyHint: { fontSize: Font.xs, color: Theme.textSubtle, fontStyle: 'italic' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Space.md, paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Theme.whiteAlpha04,
    borderWidth: 1,
  },
  tagText: { fontSize: Font.xs, fontWeight: '600' },

  statsCard: {
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Theme.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: Font.xl, fontWeight: '900', color: Theme.text },
  statLabel: { fontSize: Font.xxs, color: Theme.textMuted, textAlign: 'center', fontWeight: '600' },
  statDivider: { width: 1, height: 40, backgroundColor: Theme.border },
});
