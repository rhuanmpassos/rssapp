import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';
import { getElevation, animation } from '../theme/design-system';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  // New props for title mode
  title?: string;
  showSettings?: boolean;
  onSettingsPress?: () => void;
}

export function SearchBar({
  placeholder = 'Buscar...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  autoFocus = false,
  title,
  showSettings = false,
  onSettingsPress,
}: SearchBarProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const scale = React.useRef(new Animated.Value(1)).current;
  const elevation = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(elevation, {
        toValue: 1,
        duration: animation.fast,
        useNativeDriver: false,
      }),
    ]).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(elevation, {
        toValue: 0,
        duration: animation.fast,
        useNativeDriver: false,
      }),
    ]).start();
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  // Title mode - display as header with title
  if (title) {
    return (
      <View
        style={[
          styles.titleContainer,
          {
            backgroundColor: theme.background.primary,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <Text style={[styles.titleText, { color: theme.text.primary }]}>
          {title}
        </Text>
        {showSettings && (
          <TouchableOpacity
            onPress={onSettingsPress}
            style={styles.settingsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Search mode - display as search input with optional settings icon
  return (
    <View style={[styles.searchWrapper, { paddingTop: insets.top + spacing.sm }]}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.background.input,
            borderColor: isFocused ? theme.primary : theme.border.light,
            transform: [{ scale }],
            ...getElevation(isFocused ? 'sm' : 'none', isDark),
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? theme.primary : theme.text.tertiary}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: theme.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {showSettings && (
        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsButtonInline}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48, // Melhor área de toque
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.xs,
    fontWeight: '400',
  },
  clearButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  // Title mode styles
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  settingsButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  settingsButtonInline: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
});

