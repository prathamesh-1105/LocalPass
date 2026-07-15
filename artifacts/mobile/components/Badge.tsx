import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const colors = useColors();

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.success + '20',
          text: colors.success,
          border: 'transparent',
        };
      case 'warning':
        return {
          bg: colors.warning + '20',
          text: colors.warning,
          border: 'transparent',
        };
      case 'destructive':
        return {
          bg: colors.destructive + '20',
          text: colors.destructive,
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: colors.secondary,
          text: colors.secondaryForeground,
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.foreground,
          border: colors.border,
        };
      case 'default':
      default:
        return {
          bg: colors.primary + '15',
          text: colors.primary,
          border: 'transparent',
        };
    }
  };

  const theme = getStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
