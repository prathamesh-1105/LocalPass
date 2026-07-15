import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  index?: number; // for staggered entrance
  animated?: boolean;
}

export function Card({ children, style, onPress, index = 0, animated = false }: CardProps) {
  const colors = useColors();

  const Container = onPress ? Pressable : View;
  
  const content = (
    <Container
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          borderWidth: 1,
          opacity: pressed && onPress ? 0.8 : 1,
          transform: [{ scale: pressed && onPress ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Container>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInUp.delay(index * 100).springify().damping(14)}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
