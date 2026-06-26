import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import { trackCallbackFormOpen, trackCallbackFormSubmit } from '../utils/analytics';

interface CallbackFormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  message: string;
}

export default function CallbackForm() {
  const [formData, setFormData] = useState<CallbackFormData>({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track form view on mount
  React.useEffect(() => {
    trackCallbackFormOpen();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert('Required', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Submit to Firestore
      await addDoc(collection(db, 'callback_requests'), {
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`,
        message: formData.message || 'No message provided',
        status: 'pending',
        createdAt: serverTimestamp(),
        source: 'mobile_app',
      });

      setSubmitted(true);
      trackCallbackFormSubmit(true);
      Alert.alert(
        'Request Submitted!',
        "We'll get back to you within 24 hours.",
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      console.error('Error submitting callback request:', error);
      trackCallbackFormSubmit(false);
      Alert.alert(
        'Submission Failed',
        'Please try again or contact us directly via WhatsApp.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      countryCode: '+91',
      message: '',
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Request Received!</Text>
        <Text style={styles.successText}>
          We'll contact you within 24 hours.
        </Text>
        <TouchableOpacity style={styles.newRequestButton} onPress={resetForm}>
          <Text style={styles.newRequestButtonText}>Submit Another Request</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Request a Callback</Text>
        <Text style={styles.formSubtitle}>
          We'll reach out to help plan your journey
        </Text>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            editable={!loading}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={styles.countryCodeInput}
              value={formData.countryCode}
              onChangeText={(text) => setFormData({ ...formData, countryCode: text })}
              editable={!loading}
            />
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9]/g, '') })}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* Message */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about your travel plans..."
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Request Callback</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          By submitting, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryCodeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.white,
    width: 70,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  privacyText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  successContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  newRequestButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  newRequestButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.secondary,
  },
});
