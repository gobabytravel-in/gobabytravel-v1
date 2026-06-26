import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function ActivitiesWebView() {
  const router = useRouter();

  React.useEffect(() => {
    trackScreenView('activities_webview');
    trackToolOpen('booking');
  }, []);

  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_ACTIVITIES_URL || "https://bookings.gobabytravel.com/search/trips#activity"}
      title="Explore Activities"
      onBack={() => router.back()}
    />
  );
}
