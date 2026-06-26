// NotificationPrompt - A soft, non-aggressive push notification opt-in
// Shown as a bottom sheet after the user has engaged with the app
// (e.g., viewed 3+ screens, selected a destination, etc.)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import { useNotifications } from '../contexts/NotificationContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PROMPT_HEIGHT = 320;

export default function NotificationPrompt() {
  const { showPrompt, acceptPrompt, declinePrompt } = useNotifications();
  const slideAnim = useRef(new Animated.Value(PROMPT_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showPrompt) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PROMPT_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPrompt]);

  if (!showPrompt) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={declinePrompt}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Prompt Card */}
      <Animated.View
        style={[
          styles.promptContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={32} color={Colors.white} />
          </View>
        </View>

        {/* Content */}
        <Text style={styles.title}>Stay in the loop!</Text>
        <Text style={styles.description}>
          Get personalized travel deals, trip reminders, and exclusive offers for your favorite destinations.
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsRow}>
          <View style={styles.benefitItem}>
            <Ionicons name="pricetag" size={16} color={Colors.secondary} />
            <Text style={styles.benefitText}>Deals</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="time" size={16} color={Colors.secondary} />
            <Text style={styles.benefitText}>Reminders</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="star" size={16} color={Colors.secondary} />
            <Text style={styles.benefitText}>Exclusive</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={acceptPrompt}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.white} />
          <Text style={styles.acceptButtonText}>Yes, notify me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineButton}
          onPress={declinePrompt}
          activeOpacity={0.7}
        >
          <Text style={styles.declineButtonText}>Maybe later</Text>
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
  promptContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  benefitText: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    fontWeight: '500',
  },
  acceptButton: {
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
  acceptButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  declineButton: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
  },
  declineButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
