import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';

export default function PlanJourneyScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Your Journey</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="map" size={64} color={Colors.secondary} />
          </View>
        </View>

        <Text style={styles.title}>Complete Journey Planning</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        
        <Text style={styles.description}>
          Plan your entire trip with our comprehensive journey planner:
        </Text>

        <View style={styles.featuresList}>
          <FeatureItem icon="airplane" text="Flights & Multi-city Routes" />
          <FeatureItem icon="bed" text="Hotels & Accommodations" />
          <FeatureItem icon="car" text="Transfers & Ground Transport" />
          <FeatureItem icon="boat" text="Ferries & Water Transport" />
          <FeatureItem icon="compass" text="Activities & Experiences" />
          <FeatureItem icon="shield-checkmark" text="Travel Insurance" />
        </View>

        <Text style={styles.footerText}>
          This dynamic itinerary planning system will help you organize every aspect of your journey in one place.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color={Colors.secondary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  menuButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  featuresList: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
});
