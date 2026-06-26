// GoBaby Travel — Travel Setup Screen
// Shown on first app use to request device permissions.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import { requestAllPermissions, skipSetup } from '../utils/permissions';
import { syncAllUserData } from '../utils/dataSync';
import { trackScreenView } from '../utils/analytics';

interface TravelSetupProps {
  onComplete: () => void;
}

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

const benefits: BenefitItem[] = [
  {
    icon: 'location',
    title: 'Location',
    description: 'Smarter recommendations based on where you are',
  },
  {
    icon: 'camera',
    title: 'Camera & Photos',
    description: 'Upload documents and travel photos easily',
  },
  {
    icon: 'notifications',
    title: 'Notifications',
    description: 'Real-time updates on flights, deals, and bookings',
  },
  {
    icon: 'mic',
    title: 'Microphone',
    description: 'Voice features for hands-free planning',
    tag: 'Coming soon',
  },
  {
    icon: 'people',
    title: 'Contacts',
    description: 'Share trips and itineraries with travel companions',
    tag: 'Coming soon',
  },
];

export default function TravelSetup({ onComplete }: TravelSetupProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  React.useEffect(() => {
    trackScreenView('travel_setup');
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const results = await requestAllPermissions((step, _index) => {
        setCurrentStep(step);
      });
      // Sync contacts + gallery if permissions were granted
      if (results.contacts === 'granted' || results.photos === 'granted') {
        setCurrentStep('syncing data');
        await syncAllUserData();
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
      onComplete();
    }
  };

  const handleSkip = async () => {
    await skipSetup();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Icon */}
        <View style={styles.headerIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="settings" size={32} color={Colors.secondary} />
          </View>
        </View>

        <Text style={styles.title}>Set up your travel experience</Text>
        <Text style={styles.subtitle}>
          Enable a few things to make your trips faster, smoother, and personalized
        </Text>

        <Text style={styles.disclaimer}>
          To deliver a fully assisted travel experience, GoBaby Travel may access certain
          device features when needed. You remain in control.
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          {benefits.map((item, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={item.icon as any} size={22} color={Colors.secondary} />
              </View>
              <View style={styles.benefitContent}>
                <View style={styles.benefitTitleRow}>
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  {item.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.benefitDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Loading state */}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.secondary} />
            <Text style={styles.loadingText}>Requesting {currentStep}...</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.enableButton, loading && styles.enableButtonDisabled]}
          onPress={handleEnable}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
          <Text style={styles.enableButtonText}>Enable Smart Travel Features</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    zIndex: 9998,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.secondary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl + 2,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    fontSize: FontSizes.xs + 1,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  benefitsList: {
    gap: Spacing.md + 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.secondary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitContent: {
    flex: 1,
    paddingTop: 2,
  },
  benefitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  benefitTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  tagBadge: {
    backgroundColor: `${Colors.secondary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: FontSizes.xs - 1,
    color: Colors.secondary,
    fontWeight: '600',
  },
  benefitDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  enableButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  enableButtonDisabled: {
    opacity: 0.7,
  },
  enableButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  skipButton: {
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
