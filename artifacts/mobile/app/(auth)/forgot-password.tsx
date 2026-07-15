import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';

export default function ForgotPassword() {
  const colors = useColors();
  const [email, setEmail] = useState('');

  return (
    <Screen style={{ padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 12, color: colors.foreground }}>Reset Password</Text>
      <Text style={{ fontSize: 16, color: colors.mutedForeground, marginBottom: 32 }}>
        Enter your college email address and we'll send you a link to reset your password.
      </Text>
      <Input
        placeholder="student@college.edu"
        value={email}
        onChangeText={setEmail}
        icon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Send Reset Link" onPress={() => router.back()} style={{ marginTop: 16 }} />
    </Screen>
  );
}
