import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function FlightsWebView() {
  const router = useRouter();

  React.useEffect(() => {
    trackScreenView('flights_webview');
    trackToolOpen('booking');
  }, []);

  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_FLIGHTS_URL || "https://bookings.gobabytravel.com/search/trips#travel"}
      title="Search Flights"
      onBack={() => router.back()}
    />
  );
}
