import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function HotelsWebView() {
  const router = useRouter();

  React.useEffect(() => {
    trackScreenView('hotels_webview');
    trackToolOpen('booking');
  }, []);

  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_HOTELS_URL || "https://bookings.gobabytravel.com/search/trips#stay"}
      title="Browse Hotels"
      onBack={() => router.back()}
    />
  );
}
