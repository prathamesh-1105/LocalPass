import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useColors } from '@/hooks/useColors';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useVerifyOtp } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function OtpScreen() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const colors = useColors();
  const verifyOtp = useVerifyOtp();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Mask mobile number for privacy (e.g., +91 ******3210)
  const maskedMobile = mobile ? `+91 ******${mobile.slice(-4)}` : '';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimer(30);
      setCode('');
      setErrorMsg('');
      inputRef.current?.focus();
    }
  };

  const handleVerify = () => {
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    verifyOtp.mutate(code, {
      onSuccess: (data) => {
        // If mobile is the mock user's mobile number, log them in directly
        // Otherwise, they are a new user and need to complete registration.
        if (mobile === '9876543210') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)');
        } else {
          // Clear any stored user to ensure register flow works cleanly
          setUser(null);
          setToken(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace({
            pathname: '/(auth)/register',
            params: { mobile }
          });
        }
      },
      onError: (err) => {
        setErrorMsg(err.message || 'Verification failed. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    });
  };

  // Helper to render code boxes
  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = code[i] || '';
      const isFocused = code.length === i;
      boxes.push(
        <View
          key={i}
          style={[
            styles.codeBox,
            {
              backgroundColor: colors.card,
              borderColor: isFocused ? colors.primary : colors.border,
            },
          ]}
        >
          {char ? (
            <Text style={[styles.codeText, { color: colors.foreground }]}>{char}</Text>
          ) : isFocused ? (
            <View style={[styles.cursor, { backgroundColor: colors.primary }]} />
          ) : (
            <View style={[styles.dot, { backgroundColor: colors.mutedForeground + '50' }]} />
          )}
        </View>
      );
    }
    return boxes;
  };

  return (
    <Screen safeAreaEdges={['top', 'bottom']} style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Verify OTP</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We sent a verification code to {maskedMobile}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.codeContainer}>
          <Pressable style={styles.boxesRow} onPress={() => inputRef.current?.focus()}>
            {renderCodeBoxes()}
          </Pressable>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/[^0-9]/g, ''));
              if (errorMsg) setErrorMsg('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          {errorMsg ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{errorMsg}</Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actions}>
          <Button
            title="Verify Code"
            onPress={handleVerify}
            loading={verifyOtp.isPending}
            style={styles.verifyBtn}
          />

          <View style={styles.timerRow}>
            {timer > 0 ? (
              <Text style={{ color: colors.mutedForeground }}>
                Resend OTP in <Text style={{ color: colors.foreground, fontWeight: '600' }}>{timer}s</Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  header: {
    marginBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  cursor: {
    width: 2,
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
  },
  actions: {
    gap: 20,
  },
  verifyBtn: {
    width: '100%',
  },
  timerRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
