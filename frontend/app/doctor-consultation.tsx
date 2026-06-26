import React from 'react';
import { useRouter } from 'expo-router';
import WebViewScreen from '../components/WebViewScreen';

export default function DoctorConsultationScreen() {
  const router = useRouter();

  return (
    <WebViewScreen
      url="https://gobabytravel.com/doctor-consultation"
      title="Doctor Consultation"
      onBack={() => router.back()}
    />
  );
}
