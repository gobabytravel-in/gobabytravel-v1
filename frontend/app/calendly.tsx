import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView } from '../utils/analytics';

export default function CalendlyWebView() {
  const router = useRouter();

  React.useEffect(() => {
    trackScreenView('calendly_booking');
  }, []);

  return (
    <WebViewScreen
      url="https://calendly.com/gobabytravel/new-meeting"
      title="Book Consultation"
      onBack={() => router.back()}
    />
  );
}
