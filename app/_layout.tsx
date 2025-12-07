import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { ToastProvider } from '../src/components/Toast';

function RootStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <RootStack />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


