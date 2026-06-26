// GoBaby Travel — App Update Prompt
// Shows a modal when a new version is available.
// Supports force_update flag.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';
import { UpdateInfo } from '../utils/updateChecker';

interface UpdatePromptProps {
  visible: boolean;
  updateInfo: UpdateInfo;
  onDismiss: () => void;
}

export default function UpdatePrompt({ visible, updateInfo, onDismiss }: UpdatePromptProps) {
  // Block hardware back button on force update
  React.useEffect(() => {
    if (visible && updateInfo.forceUpdate && Platform.OS === 'android') {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => handler.remove();
    }
  }, [visible, updateInfo.forceUpdate]);

  const handleUpdate = () => {
    if (updateInfo.updateUrl) {
      Linking.openURL(updateInfo.updateUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!updateInfo.forceUpdate) onDismiss();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-download" size={40} color={Colors.secondary} />
          </View>

          <Text style={styles.title}>Update Available</Text>

          <Text style={styles.version}>
            v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
          </Text>

          <Text style={styles.message}>{updateInfo.message}</Text>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.8}>
            <Ionicons name="download" size={18} color={Colors.white} />
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          {!updateInfo.forceUpdate && (
            <TouchableOpacity style={styles.laterButton} onPress={onDismiss}>
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
          )}

          {updateInfo.forceUpdate && (
            <Text style={styles.forceNote}>This update is required to continue.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg + 4,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl + Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  updateButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  laterButton: {
    paddingVertical: Spacing.sm,
  },
  laterButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  forceNote: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
