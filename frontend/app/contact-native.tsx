import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import CallbackForm from '../components/CallbackForm';
import { trackScreenView, trackWhatsAppClick, trackExternalLink } from '../utils/analytics';

export default function ContactScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  React.useEffect(() => {
    trackScreenView('contact');
  }, []);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const openEmail = (email: string) => {
    trackExternalLink(`mailto:${email}`, 'contact_page');
    Linking.openURL(`mailto:${email}`);
  };

  const openWhatsApp = (number: string) => {
    trackWhatsAppClick('contact_page');
    Linking.openURL(`https://wa.me/${number.replace(/[^0-9]/g, '')}`);
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
        <Text style={styles.headerTitle}>Contact Us</Text>
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
            <Ionicons name="mail" size={40} color={Colors.secondary} />
          </View>
          <Text style={styles.title}>Contact GoBaby Travel</Text>
          <Text style={styles.subtitle}>
            You're reaching the team responsible for your journey.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>How can we help you today?</Text>
          
          <TouchableOpacity
            style={styles.whatsappActionButton}
            onPress={() => openWhatsApp('+91 8829924128')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="logo-whatsapp" size={28} color={Colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: Colors.white }]}>Chat on WhatsApp</Text>
              <Text style={[styles.actionSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>Quick responses, anytime</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/guided-planning' as any)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="compass" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: Colors.secondary }]}>Plan a Trip</Text>
              <Text style={[styles.actionSubtitle, { color: Colors.textLight }]}>Start planning your journey</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.sectionTitle}>Or reach us directly</Text>
          <ContactCard
            icon="compass"
            title="Travel Planning"
            description="For planning new trips and understanding options before booking."
            email="info@gobabytravel.com"
            whatsapp="+91 8829914128"
            onEmailPress={openEmail}
            onWhatsAppPress={openWhatsApp}
          />

          <ContactCard
            icon="headset"
            title="Customer Support"
            description="For confirmed bookings and active journeys."
            email="support@gobabytravel.com"
            onEmailPress={openEmail}
          />

          <ContactCard
            icon="people"
            title="Partnerships"
            description="For business collaborations and integrations."
            email="partnerships@gobabytravel.com"
            onEmailPress={openEmail}
          />

          <ContactCard
            icon="alert-circle"
            title="Escalations"
            description="For serious concerns or unresolved issues."
            email="grievances@gobabytravel.com"
            onEmailPress={openEmail}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Your message is routed to the right team" />
            <BulletPoint text="You receive acknowledgment" />
            <BulletPoint text="One person stays responsible until resolution" />
          </View>
        </View>

        {/* Callback Form */}
        <CallbackForm />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactCard({ 
  icon, 
  title, 
  description, 
  email, 
  whatsapp, 
  onEmailPress, 
  onWhatsAppPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  description: string; 
  email: string; 
  whatsapp?: string;
  onEmailPress: (email: string) => void;
  onWhatsAppPress?: (number: string) => void;
}) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons name={icon} size={24} color={Colors.secondary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
      <TouchableOpacity 
        style={styles.emailButton}
        onPress={() => onEmailPress(email)}
      >
        <Ionicons name="mail" size={16} color={Colors.secondary} />
        <Text style={styles.emailText}>{email}</Text>
      </TouchableOpacity>
      {whatsapp && onWhatsAppPress && (
        <TouchableOpacity 
          style={styles.whatsappButton}
          onPress={() => onWhatsAppPress(whatsapp)}
        >
          <Ionicons name="logo-whatsapp" size={16} color={Colors.success} />
          <Text style={styles.whatsappText}>{whatsapp}</Text>
        </TouchableOpacity>
      )}
    </View>
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
    lineHeight: 24,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  cardDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  emailText: {
    fontSize: FontSizes.sm,
    color: Colors.secondary,
    marginLeft: Spacing.sm,
    textDecorationLine: 'underline',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  whatsappText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: `${Colors.secondary}10`,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  bulletList: {
    marginTop: Spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginLeft: Spacing.md,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundLight,
  },
  quickActionsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  whatsappActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FontSizes.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
