import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { useAuth } from '../contexts/AuthContext';

export default function EmailOtpScreen() {
  const router = useRouter();
  const { sendEmailOtp, verifyEmailOtp } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<TextInput>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendCode = async () => {
    if (!isValidEmail) return;
    setBusy(true);
    const { error } = await sendEmailOtp(email);
    setBusy(false);
    if (error) { Alert.alert('Could not send code', error); return; }
    setStep('code');
    setTimeout(() => codeRef.current?.focus(), 250);
  };

  const handleVerify = async () => {
    if (code.trim().length < 6) return;
    setBusy(true);
    const { error } = await verifyEmailOtp(email, code);
    setBusy(false);
    if (error) { Alert.alert('Invalid code', error); return; }
    router.replace('/travel-passport' as any);
  };

  const handleResend = async () => {
    setBusy(true);
    const { error } = await sendEmailOtp(email);
    setBusy(false);
    Alert.alert(error ? 'Could not resend' : 'Code resent', error || 'Check your email for a fresh code.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => step === 'code' ? setStep('email') : router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Theme.text} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <View style={styles.iconBg} />
            <Ionicons name={step === 'email' ? 'mail-outline' : 'shield-checkmark'} size={48} color={Theme.gold} />
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.title}>Sign in with email</Text>
              <Text style={styles.subtitle}>We'll send you a 6-digit code to verify it's you. No password needed.</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail" size={18} color={Theme.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Theme.textSubtle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  style={styles.input}
                  editable={!busy}
                  returnKeyType="send"
                  onSubmitEditing={handleSendCode}
                />
              </View>
              <Pressable
                onPress={handleSendCode}
                disabled={!isValidEmail || busy}
                style={({ pressed }) => [styles.primaryBtn, (!isValidEmail || busy) && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
              >
                {busy ? <ActivityIndicator color={Theme.bg} /> : <Text style={styles.primaryBtnText}>Send Code</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter your code</Text>
              <Text style={styles.subtitle}>Sent to <Text style={styles.emailHighlight}>{email}</Text>. Code expires in 60 minutes.</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="key" size={18} color={Theme.textMuted} />
                <TextInput
                  ref={codeRef}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  placeholderTextColor={Theme.textSubtle}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  style={[styles.input, styles.inputCode]}
                  editable={!busy}
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                />
              </View>
              <Pressable
                onPress={handleVerify}
                disabled={code.length < 6 || busy}
                style={({ pressed }) => [styles.primaryBtn, (code.length < 6 || busy) && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
              >
                {busy ? <ActivityIndicator color={Theme.bg} /> : <Text style={styles.primaryBtnText}>Verify & Continue</Text>}
              </Pressable>
              <Pressable onPress={handleResend} disabled={busy} style={styles.resendBtn}>
                <Text style={styles.resendText}>Didn't get it? <Text style={styles.link}>Resend code</Text></Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },
  header: { paddingHorizontal: Space.base, paddingVertical: Space.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.whiteAlpha06, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: Space.xl, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  iconWrap: { marginBottom: Space.xl, alignItems: 'center', justifyContent: 'center' },
  iconBg: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(240,180,41,0.10)', borderWidth: 1, borderColor: 'rgba(240,180,41,0.28)' },
  title: { fontSize: Font.xl, fontWeight: '900', color: Theme.text, letterSpacing: -1, textAlign: 'center', marginBottom: Space.md },
  subtitle: { fontSize: Font.sm + 1, color: Theme.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 340, marginBottom: Space.xxl },
  emailHighlight: { color: Theme.gold, fontWeight: '700' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 380, backgroundColor: Theme.surface, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Theme.border, paddingHorizontal: Space.base, gap: Space.sm, marginBottom: Space.lg },
  input: { flex: 1, color: Theme.text, fontSize: Font.md, paddingVertical: 16, fontWeight: '600' },
  inputCode: { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '800' },
  primaryBtn: { width: '100%', maxWidth: 380, paddingVertical: 16, borderRadius: Radius.pill, backgroundColor: Theme.gold, alignItems: 'center' },
  primaryBtnText: { fontSize: Font.md, fontWeight: '800', color: Theme.bg, letterSpacing: -0.2 },
  resendBtn: { marginTop: Space.lg, padding: Space.sm },
  resendText: { fontSize: Font.xs + 1, color: Theme.textMuted, textAlign: 'center' },
  link: { color: Theme.primary, fontWeight: '700' },
});
