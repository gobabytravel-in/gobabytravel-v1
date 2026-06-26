import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface JourneyPortalProps {
  title: string;
  subtitle: string;
  icon: IoniconName;
  accent: string;
  glow: string;
  onPress: () => void;
}

export default function JourneyPortal({ title, subtitle, icon, accent, glow, onPress }: JourneyPortalProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: accent,
            transform: [{ scale }],
            shadowColor: accent,
          },
        ]}
      >
        {/* Subtle inner glow overlay */}
        <View style={[styles.glowOverlay, { backgroundColor: glow }]} pointerEvents="none" />

        {/* Icon disc */}
        <View style={[styles.iconDisc, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
          <Ionicons name={icon} size={26} color={accent} />
        </View>

        {/* Labels */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>

        {/* Bottom hairline accent */}
        <View style={[styles.bottomAccent, { backgroundColor: accent }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: '47%',
  },
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Theme.surface,
    paddingHorizontal: Space.base,
    paddingTop: Space.lg,
    paddingBottom: Space.base,
    overflow: 'hidden',
    position: 'relative',
    // Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  glowOverlay: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.7,
  },
  iconDisc: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.base,
  },
  title: {
    fontSize: Font.md,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Font.xs,
    color: Theme.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.7,
  },
});
