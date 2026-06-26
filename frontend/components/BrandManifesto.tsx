import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, Space, Font } from '../constants/Theme';

// Subtle premium brand signature — placed at bottom of Homepage + Travel Passport.
// Designed to feel "discovered", not "advertised".
export default function BrandManifesto() {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.text}>
        <Text style={styles.italic}>Born in the Land Where Every Guest Is God.</Text>{'\n'}
        <Text style={styles.subtle}>Loved by a World That Was Always One Family.</Text>
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: Space.xl,
    paddingVertical: Space.xl,
  },
  line: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(240,180,41,0.45)',
    marginVertical: Space.md,
  },
  text: {
    textAlign: 'center',
    fontSize: Font.xs + 1,
    lineHeight: 22,
    color: Theme.textMuted,
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  italic: {
    fontStyle: 'italic',
    color: Theme.gold,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  subtle: {
    color: Theme.textSubtle,
    fontStyle: 'italic',
    fontSize: Font.xs,
  },
});
