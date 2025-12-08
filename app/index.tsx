import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuthStore } from '../src/store/authStore';
import { setOnAuthExpired } from '../src/services/api';

const ONBOARDING_KEY = '@rss_aggregator:onboarding_completed';

export default function Index() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch {
        setHasCompletedOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    // Register callback for when auth token expires (401 error)
    setOnAuthExpired(() => {
      router.replace('/(auth)/login');
    });

    checkOnboarding();
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !checkingOnboarding) {
      const timer = setTimeout(() => {
        // Se não completou onboarding, mostrar onboarding primeiro
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding' as any);
        } else if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, checkingOnboarding, hasCompletedOnboarding]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

