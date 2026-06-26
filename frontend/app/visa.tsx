import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function VisaScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackScreenView('visa_tool');
  }, []);


  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_VISA_URL!}
      title="Visa Ease"
      onBack={() => router.back()}
    />
  );
}
