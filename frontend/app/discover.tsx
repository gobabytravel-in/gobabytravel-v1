import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { trackScreenView } from '../utils/analytics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Discovery {
  date: string;
  destination: string;
  tagline: string;
  cultural_insight: string;
  hidden_gem: string;
  travel_fact: string;
  best_for: string[];
  quick_stats: { language: string; currency: string; timezone: string };
}

export default function DiscoverScreen() {
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(false);
      const res = await fetch(`${BACKEND_URL}/api/discover/today`);
      const data = await res.json();
      setDiscovery(data.discovery);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    trackScreenView('discover');
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>DAILY DISCOVERY</Text>
        <Text style={styles.headerTitle}>Explore The World</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Theme.primary}
          />
        }
      >
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Theme.primary} />
            <Text style={styles.loadingText}>Discovering today's destination...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.centered}>
            <Ionicons name="wifi-outline" size={40} color={Theme.textSubtle} />
            <Text style={styles.errorText}>Couldn't load today's discovery</Text>
            <Pressable style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {discovery && !loading && (
          <>
            {/* Hero Destination Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroGlowBlue} pointerEvents="none" />
              <View style={styles.heroGlowGold} pointerEvents="none" />
              <View style={styles.heroEyebrowRow}>
                <View style={styles.todayBadge}>
                  <Ionicons name="today-outline" size={11} color={Theme.gold} />
                  <Text style={styles.todayBadgeText}>DESTINATION OF THE DAY</Text>
                </View>
              </View>
              <Text style={styles.heroDestination}>{discovery.destination}</Text>
              <Text style={styles.heroTagline}>{discovery.tagline}</Text>
              {discovery.best_for?.length > 0 && (
                <View style={styles.bestForRow}>
                  {discovery.best_for.map(tag => (
                    <View key={tag} style={styles.bestForTag}>
                      <Text style={styles.bestForTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              {discovery.quick_stats && (
                <View style={styles.statsRow}>
                  <StatPill icon="language-outline" text={discovery.quick_stats.language} />
                  <StatPill icon="cash-outline" text={discovery.quick_stats.currency} />
                  <StatPill icon="time-outline" text={discovery.quick_stats.timezone} />
                </View>
              )}
            </View>

            {/* Cultural Insight */}
            <DiscoveryCard
              icon="earth-outline"
              iconColor={Theme.primary}
              eyebrow="CULTURAL INSIGHT"
              content={discovery.cultural_insight}
            />

            {/* Hidden Gem */}
            <DiscoveryCard
              icon="diamond-outline"
              iconColor={Theme.gold}
              eyebrow="HIDDEN GEM"
              content={discovery.hidden_gem}
            />

            {/* Travel Fact */}
            <DiscoveryCard
              icon="bulb-outline"
              iconColor={Theme.teal}
              eyebrow="TRAVEL FACT"
              content={discovery.travel_fact}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon as any} size={12} color={Theme.textMuted} />
      <Text style={styles.statPillText}>{text}</Text>
    </View>
  );
}

function DiscoveryCard({ icon, iconColor, eyebrow, content }: { icon: string; iconColor: string; eyebrow: string; content: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={[styles.cardEyebrow, { color: iconColor }]}>{eyebrow}</Text>
      </View>
      <Text style={styles.cardContent}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: { paddingHorizontal: Space.base, paddingTop: Space.lg, paddingBottom: Space.md },
  headerEyebrow: { fontSize: Font.xxs, fontWeight: '700', color: Theme.primary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: Font.xl, fontWeight: '800', color: Theme.text, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: Space.base, paddingBottom: Space.xxxl, gap: Space.md },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: Space.xxxl, gap: Space.md },
  loadingText: { color: Theme.textMuted, fontSize: Font.sm },
  errorText: { color: Theme.textMuted, fontSize: Font.base, textAlign: 'center' },
  retryBtn: { paddingHorizontal: Space.xl, paddingVertical: Space.md, borderRadius: Radius.pill, backgroundColor: Theme.primary },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.sm },

  heroCard: {
    backgroundColor: Theme.surface,
    borderRadius: Radius.xl,
    padding: Space.xl,
    borderWidth: 1,
    borderColor: Theme.border,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowBlue: {
    position: 'absolute', top: -80, right: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(74,158,255,0.10)',
  },
  heroGlowGold: {
    position: 'absolute', bottom: -60, left: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(240,180,41,0.10)',
  },
  heroEyebrowRow: { marginBottom: Space.md },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(240,180,41,0.12)',
    borderWidth: 1, borderColor: 'rgba(240,180,41,0.32)',
  },
  todayBadgeText: { fontSize: 9, fontWeight: '800', color: Theme.gold, letterSpacing: 1.4 },
  heroDestination: { fontSize: Font.xxl, fontWeight: '900', color: Theme.text, letterSpacing: -1, marginBottom: Space.sm },
  heroTagline: { fontSize: Font.base, color: Theme.textMuted, fontStyle: 'italic', lineHeight: 22, marginBottom: Space.md },
  bestForRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginBottom: Space.md },
  bestForTag: {
    paddingHorizontal: Space.md, paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Theme.whiteAlpha06,
    borderWidth: 1, borderColor: Theme.border,
  },
  bestForTagText: { fontSize: Font.xxs, fontWeight: '600', color: Theme.textMuted, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Space.md, paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Theme.whiteAlpha04,
    borderWidth: 1, borderColor: Theme.border,
  },
  statPillText: { fontSize: Font.xxs, color: Theme.textMuted, fontWeight: '500' },

  card: {
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Theme.border,
    gap: Space.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  cardIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardEyebrow: { fontSize: Font.xxs, fontWeight: '800', letterSpacing: 1.5 },
  cardContent: { fontSize: Font.sm, color: Theme.textMuted, lineHeight: 22 },
});
