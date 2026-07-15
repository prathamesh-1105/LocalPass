import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Digital Concession\nMade Effortless',
    description: 'Replace tedious paperwork with a few taps. Apply for your railway concession pass directly from your phone.',
    icon: 'smartphone' as const,
  },
  {
    id: '2',
    title: 'Real-time Tracking\n& College Verification',
    description: 'Track your application status at every step. Seamless integration with your college for quick approvals.',
    icon: 'check-circle' as const,
  },
  {
    id: '3',
    title: 'Your Digital\nCertificate Vault',
    description: 'Always carry your approved certificates securely. Never worry about losing paper documents again.',
    icon: 'shield' as const,
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const setHasSeenOnboarding = useAuthStore((s) => s.setHasSeenOnboarding);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom']} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <Animated.View 
              entering={FadeInRight.delay(200)}
              style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}
            >
              <Feather name={item.icon} size={80} color={colors.primary} />
            </Animated.View>
            <View style={styles.textContainer}>
              <Animated.Text entering={FadeIn.delay(300)} style={[styles.title, { color: colors.foreground }]}>
                {item.title}
              </Animated.Text>
              <Animated.Text entering={FadeIn.delay(400)} style={[styles.description, { color: colors.mutedForeground }]}>
                {item.description}
              </Animated.Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: currentIndex === index ? colors.primary : colors.border,
                  width: currentIndex === index ? 24 : 8 
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex < SLIDES.length - 1 && (
            <Button
              title="Skip"
              variant="ghost"
              onPress={handleComplete}
              style={{ flex: 1, marginRight: 16 }}
            />
          )}
          <Button
            title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
