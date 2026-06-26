import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';
import { trackScreenView, trackOpenPlanTrip } from '../utils/analytics';

export default function PlanTripScreen() {
  const router = useRouter();
  React.useEffect(() => {
    trackOpenPlanTrip();
    trackScreenView('plan_trip');
  }, []);


  return (
    <WebViewScreen
      url={process.env.EXPO_PUBLIC_PLAN_TRIP_URL || "https://bookings.gobabytravel.com/search/trips#travel_and_stay"}
      title="Plan a Trip"
      onBack={() => router.back()}
    />
  );
}
