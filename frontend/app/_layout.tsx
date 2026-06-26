import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { AuthProvider } from '../contexts/AuthContext';
import BrandedSplash from '../components/BrandedSplash';
import { initUserIdentity } from '../utils/userIdentity';
import { trackAppOpen } from '../utils/analytics';

export default function Layout() {
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowSplash(true);
    (async () => {
      await initUserIdentity();
      trackAppOpen();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Theme.bg }}>
      <AuthProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Theme.surface,
              borderTopColor: Theme.border,
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 6,
            },
            tabBarActiveTintColor: Theme.primary,
            tabBarInactiveTintColor: Theme.textSubtle,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'AI',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="sparkles" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: 'Discover',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="compass-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="passport"
            options={{
              title: 'Passport',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="trips"
            options={{
              title: 'My Trips',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
          {/* Hidden screens */}
          <Tabs.Screen name="email-otp" options={{ href: null }} />
          <Tabs.Screen name="booking" options={{ href: null }} />
          <Tabs.Screen name="visa" options={{ href: null }} />
          <Tabs.Screen name="transport" options={{ href: null }} />
          <Tabs.Screen name="plan-trip" options={{ href: null }} />
          <Tabs.Screen name="plan-journey" options={{ href: null }} />
          <Tabs.Screen name="rewards" options={{ href: null }} />
          <Tabs.Screen name="doctor-consultation-native" options={{ href: null }} />
          <Tabs.Screen name="doctor-consultation" options={{ href: null }} />
          <Tabs.Screen name="calendly" options={{ href: null }} />
          <Tabs.Screen name="flights-webview" options={{ href: null }} />
          <Tabs.Screen name="hotels-webview" options={{ href: null }} />
          <Tabs.Screen name="activities-webview" options={{ href: null }} />
          <Tabs.Screen name="transfers-webview" options={{ href: null }} />
          <Tabs.Screen name="about" options={{ href: null }} />
          <Tabs.Screen name="about-native" options={{ href: null }} />
          <Tabs.Screen name="contact" options={{ href: null }} />
          <Tabs.Screen name="contact-native" options={{ href: null }} />
          <Tabs.Screen name="faq" options={{ href: null }} />
          <Tabs.Screen name="faq-native" options={{ href: null }} />
          <Tabs.Screen name="terms" options={{ href: null }} />
          <Tabs.Screen name="privacy" options={{ href: null }} />
          <Tabs.Screen name="partnerships" options={{ href: null }} />
          <Tabs.Screen name="travel-passport" options={{ href: null }} />
          <Tabs.Screen name="auth-callback" options={{ href: null }} />
        </Tabs>
        {showSplash && <BrandedSplash onFinish={() => setShowSplash(false)} />}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
