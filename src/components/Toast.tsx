import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius } from '../theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const getToastColors = (type: ToastType) => {
  const colors = {
    success: {
      border: '#10B981',
      icon: '#10B981',
    },
    error: {
      border: '#EF4444',
      icon: '#EF4444',
    },
    warning: {
      border: '#F59E0B',
      icon: '#F59E0B',
    },
    info: {
      border: '#3B82F6',
      icon: '#3B82F6',
    },
  };
  return colors[type];
};

const getToastIcon = (type: ToastType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
  }
};

interface ToastProps {
  config: ToastConfig | null;
  onHide: () => void;
}

function Toast({ config, onHide }: ToastProps) {
  const { isDark, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config) {
      // Show toast
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Haptic feedback
      if (config.type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (config.type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Auto hide
      const duration = config.duration || 3000;
      const timer = setTimeout(() => {
        hideAnimation();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [config]);

  const hideAnimation = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!config) return null;

  const type = config.type || 'info';
  const colors = getToastColors(type);
  const icon = getToastIcon(type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideAnimation}
        style={[
          styles.toast,
          {
            backgroundColor: theme.card.background,
            borderLeftColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={colors.icon} style={styles.icon} />
        <Text style={[styles.message, { color: theme.text.primary }]} numberOfLines={2}>
          {config.message}
        </Text>
        {config.action && (
          <TouchableOpacity
            onPress={() => {
              config.action?.onPress();
              hideAnimation();
            }}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: colors.icon }]}>
              {config.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig(config);
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast config={toastConfig} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 12, // Less padding on left for border accent
    borderRadius: 16, // More rounded
    borderLeftWidth: 4, // Accent border on left
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
