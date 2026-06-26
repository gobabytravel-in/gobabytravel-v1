import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function PartnershipsScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/partnerships"
      title="Partnerships"
      onBack={() => router.back()}
    />
  );
}
