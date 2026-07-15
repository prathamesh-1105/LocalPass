import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSubmitApplication } from '@/services/api';
import * as Haptics from 'expo-haptics';

const TOTAL_STEPS = 5;

export default function ApplyWizard() {
  const colors = useColors();
  const submitApp = useSubmitApplication();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sourceStation: '',
    destinationStation: '',
    travelType: 'Monthly',
  });

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleSubmit = () => {
    submitApp.mutate(formData, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep(6); // Success step
      }
    });
  };

  if (step === 6) {
    return (
      <Screen safeAreaEdges={['top', 'bottom']} style={styles.successScreen}>
        <Animated.View entering={FadeIn} style={styles.successContent}>
          <View style={[styles.successIconWrap, { backgroundColor: colors.success + '20' }]}>
            <Feather name="check" size={64} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Application Submitted!</Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Your concession application has been sent to your college for verification. You'll be notified once approved.
          </Text>
          <Button 
            title="Go to Dashboard" 
            onPress={() => router.replace('/(tabs)')} 
            style={{ marginTop: 32 }}
          />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Concession</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { backgroundColor: colors.primary, width: `${(step / TOTAL_STEPS) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.stepText, { color: colors.mutedForeground }]}>Step {step} of {TOTAL_STEPS}</Text>
        </View>
      </View>

      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80}>
        <Animated.View key={step} entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(300)}>
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Personal Details</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>Confirm your information</Text>
              
              <Input label="Full Name" value="Alex Johnson" editable={false} />
              <Input label="Date of Birth" value="14 May 2001" editable={false} />
              <Input label="Mobile Number" value="+1234567890" editable={false} />
              <Input label="Address" value="123 Campus Drive, City" editable={false} multiline />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Academic Details</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>Your college info</Text>
              
              <Input label="College" value="State University" editable={false} />
              <Input label="Student ID" value="CS2021001" editable={false} />
              <Input label="Year / Semester" value="3rd Year, 6th Sem" editable={false} />
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Journey Details</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>Where do you travel?</Text>
              
              <Input 
                label="Source Station" 
                placeholder="E.g. Central Station" 
                value={formData.sourceStation}
                onChangeText={(t) => setFormData({...formData, sourceStation: t})}
              />
              <Input 
                label="Destination Station" 
                placeholder="E.g. University Station" 
                value={formData.destinationStation}
                onChangeText={(t) => setFormData({...formData, destinationStation: t})}
              />

              <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Pass Duration</Text>
              <View style={styles.durationGrid}>
                {['Monthly', 'Quarterly', 'Half-Yearly'].map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.durationCard,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      formData.travelType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => setFormData({...formData, travelType: type})}
                  >
                    <Text style={[
                      styles.durationText,
                      { color: colors.foreground },
                      formData.travelType === type && { color: colors.primary, fontWeight: '600' }
                    ]}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Upload Documents</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>Attach required proof</Text>
              
              <DocUpload title="College ID Card" />
              <DocUpload title="Bonafide Certificate" />
              <DocUpload title="Passport Size Photo" />
            </View>
          )}

          {step === 5 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>Check your details carefully</Text>
              
              <View style={[styles.reviewBox, { backgroundColor: colors.muted }]}>
                <ReviewRow label="Route" value={`${formData.sourceStation || 'N/A'} → ${formData.destinationStation || 'N/A'}`} />
                <ReviewRow label="Duration" value={formData.travelType} />
                <ReviewRow label="College" value="State University" />
                <ReviewRow label="Student ID" value="CS2021001" />
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={step === TOTAL_STEPS ? "Submit Application" : "Continue"}
          onPress={step === TOTAL_STEPS ? handleSubmit : handleNext}
          loading={submitApp.isPending}
          disabled={step === 3 && (!formData.sourceStation || !formData.destinationStation)}
        />
      </View>
    </View>
  );
}

function DocUpload({ title }: { title: string }) {
  const colors = useColors();
  const [uploaded, setUploaded] = useState(false);

  return (
    <View style={styles.docUpload}>
      <Text style={[styles.docTitle, { color: colors.foreground }]}>{title}</Text>
      <Pressable 
        style={[styles.uploadBox, { backgroundColor: colors.background, borderColor: colors.border, borderStyle: uploaded ? 'solid' : 'dashed' }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setUploaded(true);
        }}
      >
        {uploaded ? (
          <View style={styles.uploadedState}>
            <Feather name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.uploadedText, { color: colors.foreground }]}>Document attached</Text>
          </View>
        ) : (
          <View style={styles.uploadState}>
            <Feather name="upload-cloud" size={24} color={colors.mutedForeground} />
            <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>Tap to select file</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.reviewRow}>
      <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  durationText: {
    fontWeight: '500',
  },
  docUpload: {
    marginBottom: 24,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  uploadState: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontWeight: '500',
  },
  uploadedState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadedText: {
    fontWeight: '500',
  },
  reviewBox: {
    borderRadius: 16,
    padding: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  reviewLabel: {
    fontSize: 14,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  successScreen: {
    justifyContent: 'center',
    padding: 32,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
