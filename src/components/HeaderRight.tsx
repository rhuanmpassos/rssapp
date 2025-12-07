import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useProgressStore } from '../store/progressStore';

export function HeaderRight() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Settings Icon - Now handling navigation to strict Settings screen */}
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={[styles.button, { backgroundColor: colors.backgroundSecondary }]}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
  }
});
