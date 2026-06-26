// NudgePrompt — A gentle, non-blocking prompt shown when users try to skip a step
// Encourages exploration without forcing it

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';

interface NudgePromptProps {
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  encouragement?: string;
  onContinue: () => void;
  onStay: () => void;
}

export default function NudgePrompt({
  visible,
  icon,
  message,
  encouragement,
  onContinue,
  onStay,
}: NudgePromptProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) },
        ]}
      >
        <TouchableOpacity style={styles.backdropTouch} onPress={onContinue} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handleBar} />

        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={24} color={Colors.secondary} />
          </View>
        </View>

        <Text style={styles.message}>{message}</Text>

        {encouragement && (
          <Text style={styles.encouragement}>{encouragement}</Text>
        )}

        <TouchableOpacity
          style={styles.stayButton}
          onPress={onStay}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={Colors.white} />
          <Text style={styles.stayButtonText}>Let me check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Already done, continue</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  iconRow: {
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  encouragement: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  stayButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stayButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  continueButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  continueButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
