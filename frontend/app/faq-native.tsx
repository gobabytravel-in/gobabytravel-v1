import React, { useState } from 'react';
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

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What does GoBaby Travel do?',
        answer: 'We help you plan and book complete trips — flights, stays, activities, transfers, and visa support — in one connected system.',
      },
      {
        question: 'What makes GoBaby Travel different?',
        answer: 'Instead of using multiple platforms, everything is coordinated in one place with one accountable team.',
      },
      {
        question: 'Can I customize my trip?',
        answer: 'Yes. You can adjust destinations, dates, hotels, and activities or ask our team to help.',
      },
    ],
  },
  {
    title: 'Bookings & Payments',
    items: [
      {
        question: 'How do cancellations work?',
        answer: 'Cancellation rules depend on airlines and hotels. We clearly show charges before processing any request.',
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'Cards, UPI, net banking, wallets, and supported international options.',
      },
    ],
  },
  {
    title: 'Visa',
    items: [
      {
        question: 'How does Visa Ease work?',
        answer: 'You upload documents, we process your application, and keep you updated throughout.',
      },
      {
        question: 'What if my visa is rejected?',
        answer: 'You can reapply after addressing the reason. We help guide improvements where possible.',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        question: 'Do you provide support during trips?',
        answer: 'Yes. Our team assists with changes, issues, and coordination throughout your journey.',
      },
    ],
  },
  {
    title: 'Health',
    items: [
      {
        question: 'How does doctor consultation work?',
        answer: 'Book a 15-minute video consultation with a travel-aware doctor for ₹250.',
      },
    ],
  },
];

export default function FAQScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackScreenView('faq');
  }, []);

  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
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
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={40} color={Colors.secondary} />
          </View>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>Quick answers to common questions</Text>
        </View>

        {/* FAQ Categories */}
        {FAQ_DATA.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.items.map((item, itemIndex) => {
              const key = `${categoryIndex}-${itemIndex}`;
              const isExpanded = expandedItems.has(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.faqItem}
                  onPress={() => toggleItem(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.question}>{item.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Colors.secondary}
                    />
                  </View>
                  {isExpanded && (
                    <Text style={styles.answer}>{item.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomTitle}>Still have questions?</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/contact-native' as any)}
          >
            <Ionicons name="mail" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/guided-planning' as any)}
          >
            <Text style={styles.secondaryButtonText}>Plan a Trip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: Spacing.md,
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
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
  categorySection: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  categoryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  faqItem: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.md,
    lineHeight: 22,
  },
  answer: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  bottomTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.secondary,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.secondary,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});
