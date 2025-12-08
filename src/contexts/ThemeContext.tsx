import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../theme/colors';

// Re-export colors for backward compatibility
export const lightColors = {
  // Backgrounds
  background: lightTheme.background.primary,
  backgroundSecondary: lightTheme.background.secondary,
  backgroundTertiary: lightTheme.background.tertiary,
  card: lightTheme.card.background,

  // Text
  text: lightTheme.text.primary,
  textSecondary: lightTheme.text.secondary,
  textTertiary: lightTheme.text.tertiary,

  // UI Elements
  primary: lightTheme.primary,
  primaryLight: lightTheme.primaryLight,
  secondary: lightTheme.secondary,
  secondaryLight: lightTheme.secondaryLight,
  accent: lightTheme.accent,
  destructive: lightTheme.error,
  destructiveLight: '#FEE2E2',

  // Borders & Separators
  separator: lightTheme.border.medium,
  border: lightTheme.border.light,

  // System (mantido para compatibilidade)
  systemGray: lightTheme.text.tertiary,
  systemGray2: lightTheme.text.tertiary,
  systemGray3: lightTheme.border.medium,
  systemGray4: lightTheme.border.light,
  systemGray5: lightTheme.background.secondary,
  systemGray6: lightTheme.background.secondary,

  // Special
  youtube: lightTheme.youtube,
  tabBar: lightTheme.tabBar.background,
  tabBarBorder: lightTheme.tabBar.border,
};

export const darkColors = {
  // Backgrounds
  background: darkTheme.background.primary,
  backgroundSecondary: darkTheme.background.secondary,
  backgroundTertiary: darkTheme.background.tertiary,
  card: darkTheme.card.background,

  // Text
  text: darkTheme.text.primary,
  textSecondary: darkTheme.text.secondary,
  textTertiary: darkTheme.text.tertiary,

  // UI Elements
  primary: darkTheme.primary,
  primaryLight: darkTheme.primaryLight,
  secondary: darkTheme.secondary,
  secondaryLight: darkTheme.secondaryLight,
  accent: darkTheme.accent,
  destructive: darkTheme.error,
  destructiveLight: '#7F1D1D',

  // Borders & Separators
  separator: darkTheme.border.medium,
  border: darkTheme.border.light,

  // System (mantido para compatibilidade)
  systemGray: darkTheme.text.tertiary,
  systemGray2: darkTheme.text.tertiary,
  systemGray3: darkTheme.border.medium,
  systemGray4: darkTheme.border.light,
  systemGray5: darkTheme.background.secondary,
  systemGray6: darkTheme.background.secondary,

  // Special
  youtube: darkTheme.youtube,
  tabBar: darkTheme.tabBar.background,
  tabBarBorder: darkTheme.tabBar.border,
};

export type Colors = typeof lightColors;

interface ThemeContextType {
  colors: Colors;
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@rssapp_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    } catch (e) {
      console.log('Error loading theme');
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
    } catch (e) {
      console.log('Error saving theme');
    }
  };

  const colors = isDark ? darkColors : lightColors;
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if not in provider
    return {
      colors: darkColors,
      theme: darkTheme,
      isDark: true,
      toggleTheme: () => { },
    };
  }
  return context;
}
