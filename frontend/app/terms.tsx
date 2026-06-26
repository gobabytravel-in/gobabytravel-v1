import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/terms---conditions"
      title="Terms & Conditions"
      onBack={() => router.back()}
    />
  );
}
