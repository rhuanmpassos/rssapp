import { Stack } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function SubscriptionsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="sites" />
      <Stack.Screen name="youtube" />
    </Stack>
  );
}



