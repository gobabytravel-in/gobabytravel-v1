import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function ContactScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/contact-us"
      title="Contact Us"
      onBack={() => router.back()}
    />
  );
}
