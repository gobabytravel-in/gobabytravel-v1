import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function AboutScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackScreenView('about');
  }, []);

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
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="airplane" size={40} color={Colors.secondary} />
          </View>
          <Text style={styles.title}>GoBaby Travel OS</Text>
          <Text style={styles.subtitle}>
            One system that plans, protects, and supports your journey.
          </Text>
        </View>

        {/* The Problem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Problem</Text>
          <Text style={styles.sectionText}>
            Travel today is fragmented. Flights, visas, hotels, insurance, and support all exist in different places — forcing you to manage everything yourself.
          </Text>
        </View>

        {/* Our Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.sectionText}>
            GoBaby Travel is built as an operating system for travel — where planning, booking, documents, and support work together instead of separately.
          </Text>
        </View>

        {/* What We Do */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Plan complete trips in one place" />
            <BulletPoint text="Handle visas and documentation" />
            <BulletPoint text="Coordinate flights, stays, and transfers" />
            <BulletPoint text="Provide real-time support across your journey" />
          </View>
        </View>

        {/* Why It Matters */}
        <View style={styles.highlightSection}>
          <Text style={styles.sectionTitle}>Why It Matters</Text>
          <Text style={styles.highlightText}>
            Travel isn't just logistics — it's uncertainty, decisions, and risk. We simplify the process so you can focus on the experience, not the complexity.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/guided-planning' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Start Planning Your Trip</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
      <Text style={styles.bulletText}>{text}</Text>
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
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 28,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: Spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginLeft: Spacing.md,
    lineHeight: 24,
  },
  highlightSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    backgroundColor: `${Colors.secondary}10`,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  highlightText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    shadowColor: Colors.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});
