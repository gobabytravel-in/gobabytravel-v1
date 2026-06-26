import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: Theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Theme.primary} />
    </View>
  );
}
