import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { trackScreenView } from '../utils/analytics';
import { useRouter } from 'expo-router';

interface Conversation {
  id: string;
  title: string;
  destination: string | null;
  created_at: string;
  updated_at: string;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  created_at: string;
}

export default function TripsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'itineraries'>('conversations');

  useEffect(() => {
    trackScreenView('trips');
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, it] = await Promise.all([
        supabase.from('conversations').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
        supabase.from('itineraries').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);
      setConversations(c.data || []);
      setItineraries(it.data || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  const deleteItinerary = async (id: string) => {
    await supabase.from('itineraries').delete().eq('id', id);
    setItineraries(prev => prev.filter(i => i.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>MY TRIPS</Text>
          <Text style={styles.headerTitle}>Saved Journeys</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="map-outline" size={48} color={Theme.textSubtle} />
          <Text style={styles.emptyTitle}>Sign in to save trips</Text>
          <Text style={styles.emptySubtitle}>Your AI conversations and generated itineraries will appear here.</Text>
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
        <Text style={styles.headerEyebrow}>MY TRIPS</Text>
        <Text style={styles.headerTitle}>Saved Journeys</Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'conversations' && styles.tabActive]}
          onPress={() => setActiveTab('conversations')}
        >
          <Ionicons name="chatbubbles-outline" size={16} color={activeTab === 'conversations' ? Theme.primary : Theme.textSubtle} />
          <Text style={[styles.tabLabel, activeTab === 'conversations' && styles.tabLabelActive]}>
            Conversations ({conversations.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'itineraries' && styles.tabActive]}
          onPress={() => setActiveTab('itineraries')}
        >
          <Ionicons name="list-outline" size={16} color={activeTab === 'itineraries' ? Theme.primary : Theme.textSubtle} />
          <Text style={[styles.tabLabel, activeTab === 'itineraries' && styles.tabLabelActive]}>
            Itineraries ({itineraries.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Theme.primary} />
          </View>
        )}

        {!loading && activeTab === 'conversations' && (
          conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color={Theme.textSubtle} />
              <Text style={styles.emptyTitle}>No saved conversations yet</Text>
              <Text style={styles.emptySubtitle}>Start a chat with the AI Concierge and save your planning sessions here.</Text>
            </View>
          ) : (
            conversations.map(c => (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="chatbubble-outline" size={18} color={Theme.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  {c.destination && <Text style={styles.cardMeta}>{c.destination}</Text>}
                  <Text style={styles.cardDate}>{formatDate(c.updated_at)}</Text>
                </View>
                <Pressable style={styles.deleteBtn} onPress={() => deleteConversation(c.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={Theme.textSubtle} />
                </Pressable>
              </View>
            ))
          )
        )}

        {!loading && activeTab === 'itineraries' && (
          itineraries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={40} color={Theme.textSubtle} />
              <Text style={styles.emptyTitle}>No saved itineraries yet</Text>
              <Text style={styles.emptySubtitle}>Ask the AI to build you an itinerary and save it here for offline access.</Text>
            </View>
          ) : (
            itineraries.map(it => (
              <View key={it.id} style={styles.card}>
                <View style={[styles.cardIconWrap, { backgroundColor: Theme.gold + '18' }]}>
                  <Ionicons name="map-outline" size={18} color={Theme.gold} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{it.title}</Text>
                  <Text style={styles.cardMeta}>{it.destination} · {it.duration_days} days</Text>
                  <Text style={styles.cardDate}>{formatDate(it.created_at)}</Text>
                </View>
                <Pressable style={styles.deleteBtn} onPress={() => deleteItinerary(it.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={Theme.textSubtle} />
                </Pressable>
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: { paddingHorizontal: Space.base, paddingTop: Space.lg, paddingBottom: Space.md },
  headerEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: Font.xl, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Space.base,
    gap: Space.sm,
    paddingBottom: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    backgroundColor: Theme.whiteAlpha04,
  },
  tabActive: { backgroundColor: Theme.primary + '18', borderWidth: 1, borderColor: Theme.primary + '44' },
  tabLabel: { fontSize: Font.xs, fontWeight: '600', color: Theme.textSubtle },
  tabLabelActive: { color: Theme.primary },

  scroll: { flex: 1 },
  scrollContent: { padding: Space.base, paddingBottom: Space.xxxl, gap: Space.md },

  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: Space.xxxl, gap: Space.md },
  emptyState: { alignItems: 'center', paddingVertical: Space.xxxl, gap: Space.md },
  emptyTitle: { fontSize: Font.md, fontWeight: '700', color: Theme.text, textAlign: 'center' },
  emptySubtitle: { fontSize: Font.sm, color: Theme.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  signInBtn: { paddingHorizontal: Space.xxl, paddingVertical: Space.md, borderRadius: Radius.pill, backgroundColor: Theme.primary },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.base },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Theme.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: Font.base, fontWeight: '700', color: Theme.text },
  cardMeta: { fontSize: Font.xs, color: Theme.primary },
  cardDate: { fontSize: Font.xxs, color: Theme.textSubtle },
  deleteBtn: { padding: Space.sm },
});
