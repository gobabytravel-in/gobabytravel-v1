// Notification Context - manages push notification state app-wide
// Handles smart permission prompting, token storage, and behavior linking

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotifications,
  setupNotificationListeners,
  updateTokenActivity,
  updateTokenBehavior,
  hasNotificationPermission,
  recordInteraction,
  setPromptReadyCallback,
} from '../utils/notifications';

const STORAGE_KEY_TOKEN = '@gobaby_push_token';
const STORAGE_KEY_DECLINED = '@gobaby_push_declined';
const STORAGE_KEY_PROMPT_SHOWN = '@gobaby_prompt_shown_date';

interface NotificationContextType {
  pushToken: string | null;
  isPermissionGranted: boolean;
  showPrompt: boolean;
  dismissPrompt: () => void;
  acceptPrompt: () => Promise<void>;
  declinePrompt: () => void;
  trackBehavior: (behavior: {
    destination_viewed?: string;
    flow_step_completed?: { destination: string; step: string; step_number: number };
    tool_used?: string;
    callback_submitted?: boolean;
    last_screen?: string;
  }) => void;
  recordUserInteraction: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
  isPermissionGranted: false,
  showPrompt: false,
  dismissPrompt: () => {},
  acceptPrompt: async () => {},
  declinePrompt: () => {},
  trackBehavior: () => {},
  recordUserInteraction: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const appState = useRef(AppState.currentState);

  // Initialize on mount
  useEffect(() => {
    initializeNotifications();

    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        // Handle foreground notification
        console.log('[NotificationContext] Foreground notification:', notification.request.content.title);
      },
      (response) => {
        // Handle notification tap - could navigate to specific screen
        const data = response.notification.request.content.data;
        console.log('[NotificationContext] Notification tapped:', data);
      }
    );

    // Set up the smart prompt callback
    setPromptReadyCallback(() => {
      checkAndShowPrompt();
    });

    // Track app state changes for last_active_at updates
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      cleanup();
      appStateSubscription.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check if we already have a token stored
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedToken) {
        setPushToken(storedToken);
        setIsPermissionGranted(true);
        // Update activity
        updateTokenActivity(storedToken);
        return;
      }

      // Check if permission is already granted (e.g. from a previous install)
      const hasPermission = await hasNotificationPermission();
      if (hasPermission) {
        const token = await registerForPushNotifications();
        if (token) {
          setPushToken(token);
          setIsPermissionGranted(true);
          await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
        }
      }
    } catch (error) {
      console.error('[NotificationContext] Init error:', error);
    }
  };

  const handleAppStateChange = async (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - update activity
      const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (token) {
        updateTokenActivity(token);
      }
    }
    appState.current = nextAppState as any;
  };

  const checkAndShowPrompt = async () => {
    try {
      // Don't show if already has permission
      if (isPermissionGranted || pushToken) return;

      // Don't show if user already declined (respect for 7 days)
      const declinedDate = await AsyncStorage.getItem(STORAGE_KEY_DECLINED);
      if (declinedDate) {
        const daysSinceDecline = (Date.now() - parseInt(declinedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceDecline < 7) return;
      }

      // Don't show if prompt was shown today
      const promptShownDate = await AsyncStorage.getItem(STORAGE_KEY_PROMPT_SHOWN);
      if (promptShownDate) {
        const today = new Date().toDateString();
        if (promptShownDate === today) return;
      }

      // Web doesn't support push well, skip prompt
      if (Platform.OS === 'web') return;

      setShowPrompt(true);
      await AsyncStorage.setItem(STORAGE_KEY_PROMPT_SHOWN, new Date().toDateString());
    } catch (error) {
      // Silent fail
    }
  };

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const acceptPrompt = useCallback(async () => {
    setShowPrompt(false);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setIsPermissionGranted(true);
        await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
      }
    } catch (error) {
      console.error('[NotificationContext] Accept error:', error);
    }
  }, []);

  const declinePrompt = useCallback(async () => {
    setShowPrompt(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DECLINED, Date.now().toString());
    } catch (error) {
      // Silent fail
    }
  }, []);

  const trackBehavior = useCallback(
    (behavior: {
      destination_viewed?: string;
      flow_step_completed?: { destination: string; step: string; step_number: number };
      tool_used?: string;
      callback_submitted?: boolean;
      last_screen?: string;
    }) => {
      if (pushToken) {
        updateTokenBehavior(pushToken, behavior);
      }
    },
    [pushToken]
  );

  const recordUserInteraction = useCallback(() => {
    recordInteraction();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        isPermissionGranted,
        showPrompt,
        dismissPrompt,
        acceptPrompt,
        declinePrompt,
        trackBehavior,
        recordUserInteraction,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
