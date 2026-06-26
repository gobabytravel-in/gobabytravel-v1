import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';

interface SmartSearchProps {
  onRoute: (destinationUrl: string, internalRoute: string | null, label: string) => void;
}

// Keyword routing rules — first match wins
const ROUTING_RULES: Array<{ keywords: string[]; url: string; internal: string | null; label: string }> = [
  { keywords: ['visa', 'document', 'passport', 'permit', 'evisa', 'e-visa'], url: 'https://gobabytravel.visa2fly.com', internal: '/visa', label: 'Visa Ease' },
  { keywords: ['transport', 'bus', 'train', 'ferry', 'cab', 'taxi', '12go', 'ground'], url: 'https://transport.gobabytravel.com', internal: '/transport', label: 'Transport Engine' },
  { keywords: ['reward', 'offer', 'point', 'loyalty', 'cashback', 'deal', 'discount'], url: 'https://rewards.gobabytravel.com', internal: '/rewards', label: 'Rewards Portal' },
  { keywords: ['doctor', 'health', 'medical', 'consult', 'medicine', 'symptom', 'sick'], url: '', internal: '/doctor-consultation-native', label: 'Travel Health' },
  { keywords: ['hotel', 'flight', 'fly', 'stay', 'resort', 'villa', 'package', 'trip', 'book', 'booking', 'plan', 'itinerary', 'activity', 'experience'], url: 'https://bookings.gobabytravel.com/search/trips', internal: '/booking', label: 'Booking Engine' },
];
const DEFAULT_ROUTE = ROUTING_RULES[ROUTING_RULES.length - 1];

export default function SmartSearch({ onRoute }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [routing, setRouting] = useState<{ label: string } | null>(null);
  const [listening, setListening] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const recognitionRef = useRef<any>(null);

  const handleFocus = () => Animated.timing(focusAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  const handleBlur = () => Animated.timing(focusAnim, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

  const handleSubmit = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    Keyboard.dismiss();
    const match = ROUTING_RULES.find((rule) => rule.keywords.some((k) => q.includes(k))) ?? DEFAULT_ROUTE;
    setRouting({ label: match.label });
    setTimeout(() => {
      setRouting(null);
      setQuery('');
      onRoute(match.url, match.internal, match.label);
    }, 900);
  };

  // Microphone: Web Speech API on web; on native, graceful coming-soon alert until full native build
  const handleMicPress = () => {
    if (listening) {
      try { recognitionRef.current?.stop?.(); } catch { /* */ }
      setListening(false);
      return;
    }

    if (Platform.OS === 'web') {
      const SR: any = (typeof window !== 'undefined') && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      if (!SR) {
        Alert.alert('Voice search', 'Your browser does not support voice input. Try Chrome or Safari, or type your search.');
        return;
      }
      try {
        const rec = new SR();
        rec.lang = 'en-IN';
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.onstart = () => setListening(true);
        rec.onresult = (e: any) => {
          let transcript = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          setQuery(transcript.trim());
        };
        rec.onend = () => setListening(false);
        rec.onerror = (e: any) => {
          setListening(false);
          if (e?.error && e.error !== 'no-speech' && e.error !== 'aborted') {
            Alert.alert('Voice search', 'Could not hear that — please try again.');
          }
        };
        recognitionRef.current = rec;
        rec.start();
      } catch {
        setListening(false);
        Alert.alert('Voice search', 'Voice input not available right now.');
      }
    } else {
      // Native: native speech recognition will ship in next build (requires native module rebuild)
      Alert.alert(
        'Voice search',
        'Tap-to-speak will be available in the next app update. Please type your search for now.',
        [{ text: 'OK' }],
      );
    }
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme.border, Theme.primary],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bar, { borderColor }]}>
        <Ionicons name="search" size={18} color={Theme.textMuted} style={{ marginRight: Space.sm }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder="Search destinations, visas, hotels..."
          placeholderTextColor={Theme.textSubtle}
          returnKeyType="search"
          style={styles.input}
          editable={!routing}
        />
        <Pressable
          hitSlop={10}
          onPress={handleMicPress}
          style={[styles.micBtn, listening && styles.micBtnActive]}
          accessibilityLabel={listening ? 'Stop listening' : 'Voice search'}
        >
          <Ionicons
            name={listening ? 'mic' : 'mic-outline'}
            size={18}
            color={listening ? '#ff4d4f' : Theme.primary}
          />
        </Pressable>
      </Animated.View>

      {listening && (
        <View style={styles.listeningPill}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>Listening… tap mic to stop</Text>
        </View>
      )}

      {routing && (
        <View style={styles.routingPill}>
          <ActivityIndicator size="small" color={Theme.primary} />
          <Text style={styles.routingText}>
            Taking you to <Text style={styles.routingLabel}>{routing.label}</Text>…
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.elevated,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: Space.base,
    height: 52,
  },
  input: { flex: 1, color: Theme.text, fontSize: Font.base, fontWeight: '500', paddingVertical: 0, height: 50 },
  micBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(74,158,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: 'rgba(255,77,79,0.18)' },
  listeningPill: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm,
    marginTop: Space.md,
    paddingHorizontal: Space.base, paddingVertical: Space.sm + 2,
    backgroundColor: 'rgba(255,77,79,0.08)',
    borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,77,79,0.32)',
    alignSelf: 'flex-start',
  },
  listeningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4d4f' },
  listeningText: { fontSize: Font.xs, color: Theme.text, fontWeight: '600' },
  routingPill: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm,
    marginTop: Space.md,
    paddingHorizontal: Space.base, paddingVertical: Space.sm + 2,
    backgroundColor: Theme.elevated,
    borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Theme.border,
    alignSelf: 'flex-start',
  },
  routingText: { fontSize: Font.xs, color: Theme.textMuted, fontWeight: '500' },
  routingLabel: { color: Theme.text, fontWeight: '700' },
});
