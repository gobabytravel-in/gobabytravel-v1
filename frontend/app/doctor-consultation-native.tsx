import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { trackScreenView } from '../utils/analytics';

const HEALTH = '#5eead4'; // Soft teal accent specific to Travel Health
const HEALTH_DIM = 'rgba(94,234,212,0.14)';
const HEALTH_LINE = 'rgba(94,234,212,0.30)';

export default function DoctorConsultationScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Gentle breathing animation for hero icon — never aggressive
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackScreenView('doctor_consultation');
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(breathe, { toValue: 0, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    ).start();
  }, [breathe]);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const bookConsultation = () => router.push('/calendly' as any);

  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const breatheOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={openDrawer} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="menu" size={22} color={Theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Travel Health</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HERO ──────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Ambient soft glow */}
          <View style={styles.heroGlow} pointerEvents="none" />

          {/* Breathing icon halo */}
          <View style={styles.iconStack}>
            <Animated.View
              style={[
                styles.iconHalo,
                { transform: [{ scale: breatheScale }], opacity: breatheOpacity },
              ]}
              pointerEvents="none"
            />
            <View style={styles.iconCore}>
              <Ionicons name="heart" size={36} color={HEALTH} />
            </View>
          </View>

          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>TRAVEL HEALTH</Text>
          </View>

          <Text style={styles.heroTitle}>
            Wherever you go,{'\n'}
            <Text style={styles.heroTitleAccent}>you're never{'\n'}travelling alone.</Text>
          </Text>

          <Text style={styles.heroSub}>
            Clear guidance from a doctor who understands travel — calm, careful, and always within reach.
          </Text>
        </View>

        {/* ─── INTRO QUOTE ───────────────────────────────────────────── */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>
            Your health shouldn't become a question mark while travelling. Talk to a doctor who understands travel situations — not just symptoms.
          </Text>
        </View>

        {/* ─── HIGHLIGHTS ────────────────────────────────────────────── */}
        <View style={styles.highlightsGrid}>
          <Highlight icon="globe" text="Travel-specific advice" />
          <Highlight icon="videocam" text="15-minute video consult" />
          <Highlight icon="cash" text="₹250 flat pricing" />
          <Highlight icon="lock-closed" text="Secure & confidential" />
        </View>

        {/* ─── WHY THIS MATTERS ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WHY THIS MATTERS</Text>
          <Text style={styles.sectionTitle}>A calm voice when you need one.</Text>
          <Text style={styles.sectionBody}>
            Most travel health issues are not emergencies, but they can still feel confusing. This service helps you make calm, informed decisions instead of guessing.
          </Text>
        </View>

        {/* ─── WHEN YOU NEED IT ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WHEN YOU NEED IT</Text>
          <Text style={styles.sectionTitle}>Care that travels with you.</Text>

          <View style={styles.timeline}>
            <TimelineStage
              stage="Before Travel"
              items={['Vaccination guidance', 'Health preparation']}
            />
            <TimelineStage
              stage="During Travel"
              items={['Fever, fatigue, minor issues', 'Medication confusion']}
            />
            <TimelineStage
              stage="After Travel"
              items={['Follow-up symptoms', 'Post-trip concerns']}
              last
            />
          </View>
        </View>

        {/* ─── PRICING ───────────────────────────────────────────────── */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingEyebrow}>FLAT PRICING</Text>
          <Text style={styles.pricingPrice}>
            ₹250<Text style={styles.pricingPer}>/consultation</Text>
          </Text>
          <Text style={styles.pricingCaption}>One transparent fee. Nothing hidden.</Text>

          <View style={styles.includesList}>
            <Include text="15-minute video call" />
            <Include text="Qualified doctor" />
            <Include text="Personalised guidance" />
          </View>
        </View>

        {/* ─── SAFETY NOTE ───────────────────────────────────────────── */}
        <View style={styles.warningRow}>
          <View style={styles.warningIcon}>
            <Ionicons name="alert-circle" size={18} color="#fbbf24" />
          </View>
          <Text style={styles.warningText}>
            This service is not for medical emergencies. Please contact local emergency services if urgent help is needed.
          </Text>
        </View>

        {/* ─── PRIMARY CTA ───────────────────────────────────────────── */}
        <Pressable
          onPress={bookConsultation}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
        >
          <Ionicons name="calendar" size={18} color={Theme.bg} />
          <Text style={styles.primaryBtnText}>Book Consultation</Text>
          <Ionicons name="arrow-forward" size={16} color={Theme.bg} />
        </Pressable>

        {/* ─── TRAVEL SUPPORT INITIATIVE ──────────────────────────── */}
        <View style={styles.supportCard}>
          <View style={styles.supportEyebrow}>
            <View style={styles.supportDot} />
            <Text style={styles.supportEyebrowText}>TRAVEL SUPPORT INITIATIVE</Text>
          </View>
          <Text style={styles.supportTitle}>
            We are <Text style={{ color: HEALTH, fontStyle: 'italic' }}>never far away.</Text>
          </Text>
          <Text style={styles.supportBody}>
            Exploring a new country should feel exciting, not overwhelming. If you encounter unexpected travel challenges, need help understanding local processes, or are unsure where to turn next — we will do our best to guide you toward the appropriate resources and support channels.
          </Text>

          <View style={styles.supportList}>
            {[
              ['shield-checkmark', 'Safety concerns'],
              ['medkit', 'Medical assistance guidance'],
              ['train', 'Railway & transport issues'],
              ['document-text', 'Lost travel documents'],
              ['location', 'Local travel support'],
            ].map(([icn, lbl], i) => (
              <View key={i} style={styles.supportRow}>
                <View style={styles.supportRowIcon}>
                  <Ionicons name={icn as any} size={14} color={HEALTH} />
                </View>
                <Text style={styles.supportRowText}>{lbl}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.supportClosing}>Travel with confidence. We are never far away.</Text>

          <Pressable
            onPress={() => Linking.openURL('https://wa.me/918829924128?text=Hi%20GoBaby%20Travel%20%E2%80%94%20I%20need%20travel%20support%20guidance.').catch(() => {})}
            style={({ pressed }) => [styles.supportBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="logo-whatsapp" size={18} color={Theme.bg} />
            <Text style={styles.supportBtnText}>Reach Travel Support</Text>
            <Ionicons name="arrow-forward" size={14} color={Theme.bg} />
          </Pressable>

          <Text style={styles.supportDisclaimer}>
            Support and guidance initiative. Not an emergency response service.
          </Text>
        </View>

        {/* ─── CONTINUE JOURNEY ─────────────────────────────────────── */}
        <View style={styles.continueSection}>
          <Text style={styles.continueLabel}>CONTINUE YOUR JOURNEY</Text>
          <View style={styles.continueRow}>
            <Pressable onPress={() => router.push('/plan-trip' as any)} style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="map" size={16} color={Theme.gold} />
              <Text style={styles.continueBtnText}>Plan a Trip</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/visa' as any)} style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="document-text" size={16} color={Theme.teal} />
              <Text style={styles.continueBtnText}>Visa</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/transport' as any)} style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="car-sport" size={16} color={Theme.orange} />
              <Text style={styles.continueBtnText}>Transport</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer whisper */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>Every Journey Starts Here</Text>
          <View style={styles.footerLine} />
        </View>

        <View style={{ height: Space.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────
function Highlight({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.highlight}>
      <View style={styles.highlightIcon}>
        <Ionicons name={icon} size={18} color={HEALTH} />
      </View>
      <Text style={styles.highlightText}>{text}</Text>
    </View>
  );
}

function TimelineStage({ stage, items, last }: { stage: string; items: string[]; last?: boolean }) {
  return (
    <View style={[styles.timelineStage, last && { marginBottom: 0 }]}>
      <View style={styles.timelineSide}>
        <View style={styles.timelineDot} />
        {!last && <View style={styles.timelineConnector} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineStageTitle}>{stage}</Text>
        {items.map((item, i) => (
          <Text key={i} style={styles.timelineItem}>• {item}</Text>
        ))}
      </View>
    </View>
  );
}

function Include({ text }: { text: string }) {
  return (
    <View style={styles.includeRow}>
      <Ionicons name="checkmark-circle" size={16} color={HEALTH} />
      <Text style={styles.includeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.whiteAlpha06,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: Font.md, color: Theme.text, fontWeight: '700', letterSpacing: -0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Space.xxxl },

  // Hero
  hero: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.lg,
    paddingBottom: Space.xxl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: HEALTH_DIM,
    opacity: 0.55,
  },
  iconStack: {
    width: 110, height: 110,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Space.lg,
    position: 'relative',
  },
  iconHalo: {
    position: 'absolute',
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: HEALTH_DIM,
    borderWidth: 1,
    borderColor: HEALTH_LINE,
  },
  iconCore: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(94,234,212,0.10)',
    borderWidth: 1, borderColor: HEALTH_LINE,
    alignItems: 'center', justifyContent: 'center',
  },
  eyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: HEALTH_DIM,
    borderWidth: 1, borderColor: HEALTH_LINE,
    paddingHorizontal: Space.md, paddingVertical: 6,
    borderRadius: Radius.pill,
    marginBottom: Space.base,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HEALTH },
  eyebrowText: { fontSize: Font.xxs, fontWeight: '800', color: HEALTH, letterSpacing: 1.8 },
  heroTitle: {
    fontSize: Font.xl,
    fontWeight: '900',
    color: Theme.text,
    lineHeight: 36,
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: Space.md,
  },
  heroTitleAccent: { color: HEALTH, fontStyle: 'italic', fontWeight: '600' },
  heroSub: {
    fontSize: Font.sm + 1, color: Theme.textMuted,
    textAlign: 'center', lineHeight: 22,
    maxWidth: 320, fontWeight: '500',
  },

  // Quote
  quoteCard: {
    marginHorizontal: Space.base,
    padding: Space.lg,
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Theme.border,
    marginBottom: Space.lg,
    position: 'relative',
  },
  quoteMark: {
    fontSize: 48,
    color: HEALTH,
    opacity: 0.4,
    lineHeight: 28,
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  quoteText: {
    fontSize: Font.sm + 1,
    color: Theme.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Highlights
  highlightsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Space.sm + 2,
    paddingHorizontal: Space.base,
    marginBottom: Space.xl,
  },
  highlight: {
    flexBasis: '47%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: Space.md,
    padding: Space.md,
    backgroundColor: Theme.surface,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Theme.border,
  },
  highlightIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: HEALTH_DIM,
    borderWidth: 1, borderColor: HEALTH_LINE,
    alignItems: 'center', justifyContent: 'center',
  },
  highlightText: {
    fontSize: Font.xs + 1, color: Theme.text,
    fontWeight: '600', flex: 1,
  },

  // Section
  section: {
    paddingHorizontal: Space.xl,
    marginBottom: Space.xl,
  },
  sectionEyebrow: {
    fontSize: Font.xxs, fontWeight: '700',
    color: HEALTH, letterSpacing: 2,
    marginBottom: Space.xs + 2,
  },
  sectionTitle: {
    fontSize: Font.lg, fontWeight: '800',
    color: Theme.text, letterSpacing: -0.5,
    marginBottom: Space.md,
    lineHeight: 26,
  },
  sectionBody: {
    fontSize: Font.sm + 1,
    color: Theme.textMuted,
    lineHeight: 22,
  },

  // Timeline
  timeline: { marginTop: Space.sm },
  timelineStage: {
    flexDirection: 'row',
    marginBottom: Space.lg,
  },
  timelineSide: {
    width: 22, alignItems: 'center',
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: HEALTH,
    borderWidth: 2, borderColor: 'rgba(94,234,212,0.30)',
    marginTop: 4,
  },
  timelineConnector: {
    width: 1, flex: 1,
    backgroundColor: Theme.border,
    marginTop: 4,
  },
  timelineContent: { flex: 1, paddingLeft: Space.md },
  timelineStageTitle: {
    fontSize: Font.sm + 1, fontWeight: '700',
    color: Theme.text, marginBottom: 4,
  },
  timelineItem: {
    fontSize: Font.xs + 1, color: Theme.textMuted,
    lineHeight: 20,
  },

  // Pricing
  pricingCard: {
    marginHorizontal: Space.base,
    padding: Space.xl,
    backgroundColor: Theme.surface,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: HEALTH_LINE,
    marginBottom: Space.base,
    alignItems: 'center',
  },
  pricingEyebrow: {
    fontSize: Font.xxs, fontWeight: '800',
    color: HEALTH, letterSpacing: 2,
    marginBottom: Space.sm,
  },
  pricingPrice: {
    fontSize: 44, fontWeight: '900',
    color: Theme.text,
    letterSpacing: -2,
    marginBottom: 4,
  },
  pricingPer: {
    fontSize: Font.md, fontWeight: '600',
    color: Theme.textMuted,
    letterSpacing: 0,
  },
  pricingCaption: {
    fontSize: Font.xs + 1, color: Theme.textMuted,
    fontStyle: 'italic',
    marginBottom: Space.lg,
  },
  includesList: {
    width: '100%',
    gap: Space.sm,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  includeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm + 2,
    justifyContent: 'center',
  },
  includeText: { fontSize: Font.sm, color: Theme.text, fontWeight: '500' },

  // Warning
  warningRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Space.md,
    marginHorizontal: Space.base, marginBottom: Space.lg,
    padding: Space.md,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.22)',
  },
  warningIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  warningText: {
    flex: 1, fontSize: Font.xs + 1,
    color: Theme.textMuted, lineHeight: 18,
  },

  // Primary CTA
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Space.sm,
    marginHorizontal: Space.base,
    paddingVertical: Space.base,
    backgroundColor: HEALTH,
    borderRadius: Radius.pill,
    marginBottom: Space.xl,
    shadowColor: HEALTH,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: Font.md, fontWeight: '800',
    color: Theme.bg, letterSpacing: -0.2,
  },

  // Continue journey
  continueSection: {
    paddingHorizontal: Space.base,
    marginBottom: Space.xl,
  },
  continueLabel: {
    fontSize: Font.xxs, fontWeight: '700',
    color: Theme.textSubtle, letterSpacing: 1.8,
    marginBottom: Space.md, textAlign: 'center',
  },
  continueRow: {
    flexDirection: 'row', gap: Space.sm,
  },
  continueBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Theme.border,
  },
  continueBtnText: {
    fontSize: Font.xs + 1, fontWeight: '700',
    color: Theme.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    marginTop: Space.lg,
    paddingHorizontal: Space.xl,
  },

  // Travel Support Initiative
  supportCard: {
    marginHorizontal: Space.base, marginBottom: Space.xl,
    padding: Space.lg + 4,
    backgroundColor: 'rgba(94,234,212,0.04)',
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: HEALTH_LINE,
  },
  supportEyebrow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: HEALTH_DIM, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: HEALTH_LINE,
    marginBottom: Space.md,
  },
  supportDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HEALTH },
  supportEyebrowText: { fontSize: Font.xxs, fontWeight: '800', color: HEALTH, letterSpacing: 1.6 },
  supportTitle: { fontSize: Font.lg, fontWeight: '800', color: Theme.text, letterSpacing: -0.5, marginBottom: Space.sm + 2, lineHeight: 26 },
  supportBody: { fontSize: Font.sm + 1, color: Theme.textMuted, lineHeight: 22, marginBottom: Space.lg },
  supportList: { gap: Space.sm + 2, marginBottom: Space.lg },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  supportRowIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: HEALTH_DIM, borderWidth: 1, borderColor: HEALTH_LINE, alignItems: 'center', justifyContent: 'center' },
  supportRowText: { fontSize: Font.sm, color: Theme.text, fontWeight: '600' },
  supportClosing: { fontSize: Font.sm + 1, color: Theme.text, fontStyle: 'italic', textAlign: 'center', marginBottom: Space.lg, letterSpacing: 0.2, fontWeight: '500' },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Space.sm,
    paddingVertical: 14,
    backgroundColor: HEALTH,
    borderRadius: Radius.pill,
    marginBottom: Space.sm,
    shadowColor: HEALTH,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  supportBtnText: { fontSize: Font.sm + 1, fontWeight: '800', color: Theme.bg, letterSpacing: -0.2 },
  supportDisclaimer: { fontSize: Font.xxs + 1, color: Theme.textSubtle, textAlign: 'center', fontStyle: 'italic', lineHeight: 16 },
  footerLine: { flex: 1, height: 1, backgroundColor: Theme.border, maxWidth: 60 },
  footerText: {
    fontSize: Font.xxs, color: Theme.textSubtle,
    letterSpacing: 1.6, fontWeight: '600',
  },
});
