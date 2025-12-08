import { Stack } from 'expo-router';
import { StatusBar, setStatusBarBackgroundColor, setStatusBarStyle, setStatusBarTranslucent } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { ToastProvider } from '../src/components/Toast';
import { DialogProvider } from '../src/contexts/DialogContext';
import { ChallengeCelebration } from '../src/components/ChallengeCelebration';
import { useProgressStore } from '../src/store/progressStore';
import { useEffect, useRef } from 'react';

function RootStack() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isInitialized = useRef(false);

  // Global celebration state (rendered only once here)
  const pendingChallengeCelebration = useProgressStore((state) => state.pendingChallengeCelebration);
  const dismissChallengeCelebration = useProgressStore((state) => state.dismissChallengeCelebration);

  // Set translucent only once on mount to avoid layout shift
  useEffect(() => {
    if (Platform.OS === 'android' && !isInitialized.current) {
      setStatusBarTranslucent(false);
      isInitialized.current = true;
    }
  }, []);

  // Update status bar colors when theme changes (without changing translucent)
  useEffect(() => {
    if (Platform.OS === 'android') {
      setStatusBarBackgroundColor(colors.background, false);
    }
    setStatusBarStyle(isDark ? 'light' : 'dark', false);
  }, [colors.background, isDark]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'default',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="add-subscription"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="bookmarks"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="subscriptions"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
      </Stack>

      {/* Global Challenge Celebration - rendered only once */}
      <ChallengeCelebration
        challenge={pendingChallengeCelebration}
        onDismiss={dismissChallengeCelebration}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DialogProvider>
            <ToastProvider>
              <RootStack />
            </ToastProvider>
          </DialogProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


