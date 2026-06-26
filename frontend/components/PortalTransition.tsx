import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Font, Radius } from '../constants/Theme';

export type PortalTheme = 'booking' | 'visa' | 'transport' | 'rewards' | 'health';

interface PortalThemeConfig {
  primary: string;
  glow: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
  headline: string;
  subline: string;
}

const THEMES: Record<PortalTheme, PortalThemeConfig> = {
  booking: {
    primary: '#4a9eff',
    glow: 'rgba(74,158,255,0.45)',
    bg: '#061a36',
    icon: 'airplane',
    headline: 'Entering Travel Booking',
    subline: 'Flights • Hotels • Activities',
  },
  visa: {
    primary: '#10b981',
    glow: 'rgba(16,185,129,0.45)',
    bg: '#062618',
    icon: 'document-text',
    headline: 'Entering Visa Ease',
    subline: 'Travel Documentation Simplified',
  },
  transport: {
    primary: '#ff8c00',
    glow: 'rgba(255,140,0,0.40)',
    bg: '#2a1505',
    icon: 'git-network',
    headline: 'Entering Transport',
    subline: 'Connecting Every Journey',
  },
  rewards: {
    primary: '#b794ff',
    glow: 'rgba(155,89,182,0.45)',
    bg: '#1f0e36',
    icon: 'gift',
    headline: 'Entering Rewards',
    subline: 'Every Journey Deserves More',
  },
  health: {
    primary: '#5eead4',
    glow: 'rgba(94,234,212,0.32)',
    bg: '#082427',
    icon: 'heart',
    headline: 'Travel Health',
    subline: "Wherever you go, you're never travelling alone.",
  },
};

interface PortalTransitionProps {
  theme: PortalTheme;
  onComplete: () => void;
  duration?: number; // 1200–1800ms recommended
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function PortalTransition({ theme, onComplete, duration = 1500 }: PortalTransitionProps) {
  const cfg = THEMES[theme];

  // Reusable animation values
  const fade = useRef(new Animated.Value(0)).current;
  const portalScale = useRef(new Animated.Value(0.2)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const exitFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Enter: fade in + portal expand + ring ripple + icon pulse + text reveal
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(portalScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 700,
          delay: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
      // Hold + breathe
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(iconPulse, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(iconPulse, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
          { iterations: 2 },
        ),
      ]),
    ]).start();

    // Ring ripple (looping while transition is visible)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.8, duration: 1400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(ringScale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    // Schedule exit
    const exitTimer = setTimeout(() => {
      Animated.timing(exitFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }).start(() => {
        onComplete();
      });
    }, duration);

    return () => clearTimeout(exitTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconScale = iconPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const iconGlow = iconPulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const exitOpacity = exitFade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, { backgroundColor: cfg.bg, opacity: Animated.multiply(fade, exitOpacity) }]}>
      {/* Soft radial vignette glow */}
      <View style={[styles.vignette, { backgroundColor: cfg.glow }]} pointerEvents="none" />

      {/* Pulsing ripple ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: cfg.primary,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Inner portal disc */}
      <Animated.View
        style={[
          styles.portal,
          {
            backgroundColor: `${cfg.primary}18`,
            borderColor: cfg.primary,
            shadowColor: cfg.primary,
            transform: [{ scale: portalScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconWrap,
            {
              backgroundColor: `${cfg.primary}22`,
              borderColor: `${cfg.primary}66`,
              transform: [{ scale: iconScale }],
              opacity: iconGlow,
            },
          ]}
        >
          <Ionicons name={cfg.icon} size={36} color={cfg.primary} />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textWrap, { opacity: textFade }]}>
        <Text style={[styles.headline, { color: cfg.primary }]}>{cfg.headline}</Text>
        <Text style={styles.subline}>{cfg.subline}</Text>
        <View style={styles.dotsRow}>
          <Dot color={cfg.primary} delay={0} />
          <Dot color={cfg.primary} delay={160} />
          <Dot color={cfg.primary} delay={320} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// Lightweight animated loading dot (no external lib)
function Dot({ color, delay }: { color: string; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 500, delay, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(v, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });
  return <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />;
}

const RING = Math.min(SCREEN_W, SCREEN_H) * 0.5;
const PORTAL = RING * 0.7;

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  vignette: {
    position: 'absolute',
    width: SCREEN_W * 1.4,
    height: SCREEN_W * 1.4,
    borderRadius: SCREEN_W * 0.7,
    opacity: 0.55,
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 1.5,
  },
  portal: {
    width: PORTAL,
    height: PORTAL,
    borderRadius: PORTAL / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textWrap: {
    position: 'absolute',
    bottom: SCREEN_H * 0.18,
    alignItems: 'center',
    paddingHorizontal: Space.xl,
  },
  headline: {
    fontSize: Font.lg + 2,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: Space.xs + 2,
    textAlign: 'center',
  },
  subline: {
    fontSize: Font.sm,
    color: Theme.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Space.base,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
