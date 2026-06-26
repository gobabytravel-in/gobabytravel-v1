import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function TransfersWebView() {
  const router = useRouter();

  React.useEffect(() => {
    trackScreenView('transfers_webview');
    trackToolOpen('booking');
  }, []);

  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_TRANSFERS_URL || "https://bookings.gobabytravel.com/search/trips#transfer"}
      title="Airport Transfers"
      onBack={() => router.back()}
    />
  );
}
