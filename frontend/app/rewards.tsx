import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function RewardsScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackToolOpen('rewards', 'sidebar');
    trackScreenView('rewards');
  }, []);

  return (
    <WebViewScreen
      url="https://rewards.gobabytravel.com"
      title="Rewards & Offers"
      onBack={() => router.back()}
    />
  );
}
