import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '../constants/Colors';

interface WebViewScreenProps {
  url: string;
  title: string;
  onBack?: () => void;
}

// URLs that MUST open externally (UPI deep links, tel:, mailto:, etc.)
const EXTERNAL_SCHEMES = [
  'upi://',
  'tel:',
  'mailto:',
  'sms:',
  'whatsapp://',
  'tg://',
  'paytmmp://',
  'phonepe://',
  'gpay://',
  'intent://',
];

const LOADING_TIMEOUT_MS = 6000;

export default function WebViewScreen({ url, title, onBack }: WebViewScreenProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const webViewRef = useRef<WebView>(null);
  const isInitialLoad = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Fallback timeout — auto-hide loader if onLoadEnd never fires
  useEffect(() => {
    if (loading && !error) {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        isInitialLoad.current = false;
      }, LOADING_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loading, error]);

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    isInitialLoad.current = false;
  };

  const handleLoadStart = useCallback(() => {
    if (isInitialLoad.current) {
      setLoading(true);
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setError(false);
    isInitialLoad.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    if (navState.url) {
      setCurrentUrl(navState.url);
    }
  };

  /**
   * Intercept ALL navigation requests.
   * - UPI/phone/mail deep links → open externally
   * - Everything else (including payment pages) → stay in WebView
   */
  const handleShouldStartLoadWithRequest = useCallback((request: any) => {
    const { url: requestUrl } = request;

    // Allow about:blank and the initial URL
    if (!requestUrl || requestUrl === 'about:blank') return true;

    // Check if this is a deep link that MUST open externally
    const isExternalScheme = EXTERNAL_SCHEMES.some(scheme =>
      requestUrl.toLowerCase().startsWith(scheme)
    );

    if (isExternalScheme) {
      // Open UPI apps, phone dialer, email, etc. externally
      Linking.openURL(requestUrl).catch(() => {});
      return false; // Don't load in WebView
    }

    // Everything else stays in the WebView (including payment pages)
    return true;
  }, []);

  /**
   * Handle new window requests (target="_blank" links, window.open).
   * Instead of opening in external browser, load in the same WebView.
   */
  const handleOpenWindow = useCallback((event: any) => {
    // Load the new window URL in our existing WebView
    if (event?.nativeEvent?.targetUrl && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.location.href = '${event.nativeEvent.targetUrl}';true;`
      );
    }
  }, []);

  // JS to inject: override window.open to stay in WebView
  const injectedJS = `
    (function() {
      // Override window.open to prevent external browser opens
      window.open = function(url, target, features) {
        if (url) {
          window.location.href = url;
        }
        return null;
      };
      
      // Override target="_blank" links to open in same window
      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.tagName === 'A' && target.target === '_blank') {
          e.preventDefault();
          window.location.href = target.href;
        }
      }, true);
      
      true;
    })();
  `;

  // Responsive header padding based on orientation
  const isLandscape = width > height;
  const headerPaddingTop = Platform.select({
    ios: isLandscape ? Math.max(insets.top, 8) : insets.top,
    android: insets.top || Spacing.md,
    default: Spacing.md,
  });

  return (
    <View style={styles.container}>
      {/* Header — responsive to safe areas and orientation */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => webViewRef.current?.reload()}
            style={styles.reloadButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="reload" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* WebView — with payment-safe configuration */}
      {!error ? (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onOpenWindow={handleOpenWindow}
          injectedJavaScript={injectedJS}
          // Keep all navigation inside the WebView
          setSupportMultipleWindows={false}
          // Essential for payment flows
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          // Allow media and popups for payment UIs
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptCanOpenWindowsAutomatically={true}
          // Caching for smoother experience
          cacheEnabled={true}
          // User agent — some payment gateways check this
          userAgent={Platform.select({
            android: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            default: undefined,
          })}
          // Allow file access for payment receipts
          allowFileAccess={true}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          startInLoadingState={false}
          // Mixed content for payment gateways that use HTTP resources
          mixedContentMode="compatibility"
        />
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Service Unavailable</Text>
          <Text style={styles.errorMessage}>
            Service is loading or temporarily unavailable.{'\n'}Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
              isInitialLoad.current = true;
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  placeholder: {
    width: 44,
  },
  reloadButton: {
    padding: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.backgroundLight,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
});
