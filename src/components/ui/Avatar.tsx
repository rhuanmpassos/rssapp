import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 22;
      case 'xl':
        return 28;
      default:
        return 16;
    }
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
          style,
        ]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: theme.primaryLight,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: theme.primary }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});



