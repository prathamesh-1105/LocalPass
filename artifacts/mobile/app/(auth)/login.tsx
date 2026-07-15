import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSmsConfig, saveSmsConfig, sendSmsOtp, SmsConfig } from '@/utils/smsService';

const loginSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const colors = useColors();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // SMS settings state
  const [smsConfig, setSmsConfig] = useState<SmsConfig>({
    enabled: false,
    provider: 'disabled',
    apiKey: '',
    twilioSid: '',
    twilioPhone: '',
  });

  useEffect(() => {
    // Load existing gateway configuration
    getSmsConfig().then((cfg) => {
      setSmsConfig(cfg);
    });
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' }
  });

  const onSubmit = async (data: LoginFormData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save in storage for verification
    await AsyncStorage.setItem('localone_active_otp', generatedOtp);

    // Send SMS
    const dispatch = await sendSmsOtp(data.mobile, generatedOtp);
    setLoading(false);

    if (dispatch.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('OTP Dispatched', 'A verification code has been sent to your phone number.', [
        {
          text: 'Verify Now',
          onPress: () => {
            router.push({
              pathname: '/(auth)/otp',
              params: { mobile: data.mobile }
            });
          }
        }
      ]);
    } else {
      // Demo fallback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Demo Code Generated',
        `SMS gateway is offline or not configured.\n\nUse Verification Code: ${generatedOtp}`,
        [
          {
            text: 'Proceed',
            onPress: () => {
              router.push({
                pathname: '/(auth)/otp',
                params: { mobile: data.mobile, mockOtp: generatedOtp }
              });
            }
          }
        ]
      );
    }
  };

  const handleSaveConfig = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveSmsConfig(smsConfig);
    setConfigModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dev Configuration Gear Button */}
      <Pressable 
        style={[styles.gearBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setConfigModalVisible(true);
        }}
      >
        <Feather name="settings" size={20} color={colors.foreground} />
      </Pressable>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.scrollContent}
        bottomOffset={40}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="train" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>LocalOne</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Mumbai Student Railway Concession Portal
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Text style={[styles.inputHeading, { color: colors.foreground }]}>
            Enter your mobile number to sign in or register
          </Text>
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number"
                placeholder="E.g. 9876543210"
                icon="phone"
                keyboardType="phone-pad"
                maxLength={10}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.mobile?.message}
              />
            )}
          />

          <Button
            title="Send OTP"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
          <Feather name="shield" size={14} color={colors.mutedForeground} style={{ marginRight: 6 }} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Secured by Government Railways Concession Guidelines.
          </Text>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      {/* Gateway settings configuration modal */}
      <Modal
        visible={configModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setConfigModalVisible(false)} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>SMS Gateway Config</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
              Configure your developer API keys below to test sending real SMS messages to your phone number.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Gateway Provider</Text>
            <View style={styles.providerRow}>
              {[
                { id: 'disabled', label: 'Disabled (Mock)' },
                { id: 'fast2sms', label: 'Fast2SMS' },
                { id: 'twilio', label: 'Twilio' }
              ].map((prov) => (
                <Pressable
                  key={prov.id}
                  style={[
                    styles.providerBtn,
                    { borderColor: colors.border, backgroundColor: colors.card },
                    smsConfig.provider === prov.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => setSmsConfig({ ...smsConfig, provider: prov.id as any, enabled: prov.id !== 'disabled' })}
                >
                  <Text style={[
                    styles.providerBtnText,
                    { color: colors.foreground },
                    smsConfig.provider === prov.id && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {prov.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {smsConfig.provider !== 'disabled' && (
              <View style={{ gap: 16, marginTop: 16 }}>
                {smsConfig.provider === 'twilio' && (
                  <View style={{ gap: 16 }}>
                    <Input
                      label="Twilio Account SID"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={smsConfig.twilioSid || ''}
                      onChangeText={(text) => setSmsConfig({ ...smsConfig, twilioSid: text })}
                    />
                    <Input
                      label="Twilio Auth Token"
                      placeholder="Auth Token"
                      secureTextEntry
                      value={smsConfig.apiKey}
                      onChangeText={(text) => setSmsConfig({ ...smsConfig, apiKey: text })}
                    />
                    <Input
                      label="Twilio From Phone Number"
                      placeholder="+15017122661"
                      value={smsConfig.twilioPhone || ''}
                      onChangeText={(text) => setSmsConfig({ ...smsConfig, twilioPhone: text })}
                    />
                  </View>
                )}

                {smsConfig.provider === 'fast2sms' && (
                  <Input
                    label="Fast2SMS API Authorization Key"
                    placeholder="Enter Fast2SMS API key"
                    secureTextEntry
                    value={smsConfig.apiKey}
                    onChangeText={(text) => setSmsConfig({ ...smsConfig, apiKey: text })}
                  />
                )}
              </View>
            )}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Button title="Save Gateway Settings" onPress={handleSaveConfig} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gearBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  form: {
    marginBottom: 32,
  },
  inputHeading: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  /* Modal Styles */
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  modalContent: {
    padding: 24,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
  },
});
