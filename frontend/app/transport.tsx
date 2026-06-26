import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function TransportScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackScreenView('transport_tool');
  }, []);


  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_TRANSPORT_URL!}
      title="Transport Engine"
      onBack={() => router.back()}
    />
  );
}
