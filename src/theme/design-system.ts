// ========================================
// Design System Completo
// Baseado em Material Design 3, Apple HIG e melhores práticas
// ========================================

import { Platform } from 'react-native';

// ========================================
// Elevation System (Material Design 3)
// ========================================
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Dark mode elevations (mais sutis)
export const elevationDark = {
  none: elevation.none,
  sm: {
    ...elevation.sm,
    shadowOpacity: 0.1,
  },
  md: {
    ...elevation.md,
    shadowOpacity: 0.15,
  },
  lg: {
    ...elevation.lg,
    shadowOpacity: 0.2,
  },
  xl: {
    ...elevation.xl,
    shadowOpacity: 0.25,
  },
  '2xl': {
    ...elevation['2xl'],
    shadowOpacity: 0.3,
  },
} as const;

// ========================================
// Animation Durations
// ========================================
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

// ========================================
// Opacity Levels
// ========================================
export const opacity = {
  disabled: 0.38,
  hover: 0.87,
  pressed: 0.7,
  focus: 0.12,
  overlay: 0.5,
  divider: 0.12,
} as const;

// ========================================
// Z-Index Scale
// ========================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ========================================
// Breakpoints (para responsividade futura)
// ========================================
export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ========================================
// Grid System
// ========================================
export const grid = {
  columns: 12,
  gutter: 16,
  margin: 16,
  containerMaxWidth: 1200,
} as const;

// ========================================
// Component Tokens
// ========================================
export const componentTokens = {
  // Button
  button: {
    minHeight: 44, // Apple HIG minimum touch target
    minWidth: 88,
    paddingHorizontal: {
      sm: 12,
      md: 16,
      lg: 24,
    },
    paddingVertical: {
      sm: 8,
      md: 12,
      lg: 16,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
    },
  },

  // Input
  input: {
    minHeight: 52, // Apple HIG recommended
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 17, // iOS default
  },

  // Card
  card: {
    borderRadius: {
      sm: 12,
      md: 16,
      lg: 20,
    },
    padding: {
      sm: 12,
      md: 16,
      lg: 24,
    },
  },

  // Avatar
  avatar: {
    sizes: {
      xs: 24,
      sm: 32,
      md: 44,
      lg: 56,
      xl: 80,
      '2xl': 96,
    },
  },

  // Icon
  icon: {
    sizes: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      '2xl': 40,
    },
  },

  // FAB
  fab: {
    size: 56,
    miniSize: 40,
    borderRadius: 28,
    iconSize: 24,
  },

  // Tab Bar
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    iconSize: 24,
    labelSize: 10,
  },
} as const;

// ========================================
// Spacing Scale (8px base)
// ========================================
export const spacingScale = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ========================================
// Border Radius Scale
// ========================================
export const radiusScale = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ========================================
// Typography Scale (refinado)
// ========================================
export const typographyScale = {
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// ========================================
// Interaction States
// ========================================
export const interactionStates = {
  default: {
    opacity: 1,
    scale: 1,
  },
  hover: {
    opacity: 0.87,
    scale: 1.02,
  },
  pressed: {
    opacity: 0.7,
    scale: 0.98,
  },
  disabled: {
    opacity: 0.38,
    scale: 1,
  },
  loading: {
    opacity: 0.7,
    scale: 1,
  },
} as const;

// ========================================
// Helper Functions
// ========================================
export const getElevation = (level: keyof typeof elevation, isDark: boolean = false) => {
  return isDark ? elevationDark[level] : elevation[level];
};

export const getSpacing = (multiplier: number) => {
  return multiplier * 4; // 4px base
};

export const getRadius = (size: keyof typeof radiusScale) => {
  return radiusScale[size];
};

