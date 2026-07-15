import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function SignupScreen() {
  return (
    <Screen style={{ padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 24 }}>Create Account</Text>
      <Text style={{ marginBottom: 32 }}>Signup flow placeholder</Text>
      <Button title="Back to Login" onPress={() => router.back()} />
    </Screen>
  );
}
