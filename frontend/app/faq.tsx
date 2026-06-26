import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function FAQScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/faq"
      title="FAQ"
      onBack={() => router.back()}
    />
  );
}
