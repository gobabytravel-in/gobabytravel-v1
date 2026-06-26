import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/about-us"
      title="About Us"
      onBack={() => router.back()}
    />
  );
}
