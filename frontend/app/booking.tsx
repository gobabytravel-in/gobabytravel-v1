import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackToolOpen } from '../utils/analytics';

export default function BookingScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackScreenView('booking_tool');
  }, []);


  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_BOOKING_URL || "https://bookings.gobabytravel.com"}
      title="Booking Engine"
      onBack={() => router.back()}
    />
  );
}
