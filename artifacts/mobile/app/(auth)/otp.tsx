import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function OtpScreen() {
  return (
    <Screen style={{ padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 24 }}>Verify OTP</Text>
      <Text style={{ marginBottom: 32 }}>OTP flow placeholder</Text>
      <Button title="Verify" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
