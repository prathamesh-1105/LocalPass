import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, containerStyle, style, ...props }, ref) => {
    const colors = useColors();

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.foreground }]}>
            {label}
          </Text>
        )}
        <View style={styles.inputContainer}>
          {icon && (
            <Feather
              name={icon}
              size={20}
              color={colors.mutedForeground}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: error ? colors.destructive : colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
                paddingLeft: icon ? 44 : 16,
              },
              style,
            ]}
            {...props}
          />
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    fontSize: 16,
    paddingRight: 16,
    fontFamily: 'Inter_400Regular',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
  },
});
