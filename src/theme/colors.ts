// ========================================
// Color Palette - Modern & Vibrant
// ========================================

export const palette = {
  // Primary - Indigo/Purple gradient feel
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary - Emerald
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Accent - Amber/Orange
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // YouTube Red
  youtube: {
    light: '#FF0000',
    dark: '#FF4444',
  },

  // Neutrals - Slate
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ========================================
// Light Theme
// ========================================
export const lightTheme = {
  mode: 'light' as const,

  // Backgrounds
  background: {
    primary: palette.white,
    secondary: palette.slate[50],
    tertiary: palette.slate[100],
    elevated: palette.white,
    card: palette.white,
    input: palette.slate[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text (WCAG AA compliant contrast ratios)
  text: {
    primary: palette.slate[900],
    secondary: palette.slate[600],
    tertiary: palette.slate[500], // Improved from slate[400] for better contrast (4.5:1)
    inverse: palette.white,
    link: palette.primary[600],
    placeholder: palette.slate[400],
  },

  // Focus states
  focus: {
    ring: palette.primary[500],
    background: palette.primary[50],
  },

  // Borders
  border: {
    light: palette.slate[200],
    medium: palette.slate[300],
    dark: palette.slate[400],
    focus: palette.primary[500],
  },

  // Brand colors
  primary: palette.primary[600],
  primaryLight: palette.primary[100],
  secondary: palette.secondary[500],
  secondaryLight: palette.secondary[100],
  accent: palette.accent[500],

  // Status
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,

  // YouTube
  youtube: palette.youtube.light,

  // Tab bar
  tabBar: {
    background: palette.white,
    border: palette.slate[200],
    active: palette.primary[600],
    inactive: palette.slate[400],
  },

  // Cards
  card: {
    background: palette.white,
    border: palette.slate[200],
    shadow: 'rgba(0, 0, 0, 0.08)',
  },

  // Skeleton
  skeleton: {
    background: palette.slate[200],
    highlight: palette.slate[100],
  },
};

// ========================================
// Dark Theme
// ========================================
export const darkTheme = {
  mode: 'dark' as const,

  // Backgrounds
  background: {
    primary: palette.slate[950],
    secondary: palette.slate[900],
    tertiary: palette.slate[800],
    elevated: palette.slate[800],
    card: palette.slate[900],
    input: palette.slate[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Text (WCAG AA compliant contrast ratios)
  text: {
    primary: palette.slate[50],
    secondary: palette.slate[300],
    tertiary: palette.slate[400], // Improved from slate[500] for better contrast (4.5:1)
    inverse: palette.slate[900],
    link: palette.primary[400],
    placeholder: palette.slate[500],
  },

  // Focus states
  focus: {
    ring: palette.primary[400],
    background: palette.primary[900],
  },

  // Borders
  border: {
    light: palette.slate[800],
    medium: palette.slate[700],
    dark: palette.slate[600],
    focus: palette.primary[500],
  },

  // Brand colors
  primary: palette.primary[500],
  primaryLight: palette.primary[900],
  secondary: palette.secondary[400],
  secondaryLight: palette.secondary[900],
  accent: palette.accent[400],

  // Status
  success: palette.secondary[400],
  warning: palette.accent[400],
  error: '#F87171',
  info: '#60A5FA',

  // YouTube
  youtube: palette.youtube.dark,

  // Tab bar
  tabBar: {
    background: palette.slate[900],
    border: palette.slate[800],
    active: palette.primary[400],
    inactive: palette.slate[500],
  },

  // Cards
  card: {
    background: palette.slate[900],
    border: palette.slate[800],
    shadow: 'rgba(0, 0, 0, 0.3)',
  },

  // Skeleton
  skeleton: {
    background: palette.slate[800],
    highlight: palette.slate[700],
  },
};

export type Theme = typeof lightTheme | typeof darkTheme;



