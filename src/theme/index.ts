export * from './colors';
export * from './spacing';
export * from './typography';
export * from './design-system';

import { lightTheme, darkTheme, Theme } from './colors';
import { spacing, borderRadius, iconSize } from './spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, textStyles } from './typography';

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkTheme : lightTheme,
  spacing,
  borderRadius,
  iconSize,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  textStyles,
});

export type AppTheme = ReturnType<typeof createTheme>;



