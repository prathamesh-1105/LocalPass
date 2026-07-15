import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSubmitApplication, useApplications, useResubmitApplication } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';

const TOTAL_STEPS = 5;

const MUMBAI_STATIONS = [
  'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
  'Masjid',
  'Sandhurst Road',
  'Byculla',
  'Dadar',
  'Kurla',
  'Ghatkopar',
  'Thane',
  'Dombivli',
  'Kalyan',
  'Churchgate',
  'Mumbai Central',
  'Bandra',
  'Andheri',
  'Borivali',
  'Bhayandar',
  'Vasai Road',
  'Virar',
  'Vashi',
  'Nerul',
  'Belapur',
  'Panvel',
];

export default function ApplyWizard() {
  const colors = useColors();
  const { user } = useAuthStore();
  const submitApp = useSubmitApplication();
  const resubmitApp = useResubmitApplication();
  const { data: applications } = useApplications();
  const { renew, resubmit, id } = useLocalSearchParams<{ renew?: string; resubmit?: string; id?: string }>();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sourceStation: user?.sourceStation || '',
    destinationStation: user?.destinationStation || '',
    travelType: 'Monthly',
    ticketClass: 'Second',
    bonafideName: null as string | null,
    bonafideSize: 0,
    bonafideType: '' as string,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill when applications load if in resubmission mode
  const existingApp = applications?.find(a => a.id === id);

  React.useEffect(() => {
    if (resubmit && existingApp) {
      const parts = existingApp.travelType.split(' - ');
      setFormData({
        sourceStation: existingApp.sourceStation,
        destinationStation: existingApp.destinationStation,
        travelType: parts[1] || 'Monthly',
        ticketClass: parts[0] || 'Second',
        bonafideName: 'bonafide_resubmit_draft.pdf',
        bonafideSize: 1.1 * 1024 * 1024,
        bonafideType: 'application/pdf',
      });
    }
  }, [existingApp, resubmit]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  // Simulate file picker with validations
  const handleUploadBonafide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMsg('');

    // Simulate selecting a file
    const mockFiles = [
      { name: 'bonafide_2026.pdf', size: 1.2 * 1024 * 1024, type: 'application/pdf' }, // Valid
      { name: 'document_scan.jpg', size: 850 * 1024, type: 'image/jpeg' }, // Valid
      { name: 'cert_archive.zip', size: 3.5 * 1024 * 1024, type: 'application/zip' }, // Invalid type and size
      { name: 'high_res_photo.png', size: 4.1 * 1024 * 1024, type: 'image/png' }, // Invalid size (>2MB)
    ];

    // Pick a random mock file (60% chance of valid file, 40% invalid for demonstration)
    const rand = Math.random();
    let selectedFile = mockFiles[0]; // Default valid PDF
    if (rand > 0.8) {
      selectedFile = mockFiles[2]; // ZIP
    } else if (rand > 0.6) {
      selectedFile = mockFiles[3]; // Large PNG
    } else if (rand > 0.3) {
      selectedFile = mockFiles[1]; // Valid JPG
    }

    // Validation
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (selectedFile.size > maxSize) {
      setErrorMsg(`File size exceeds 2MB limit (selected: ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB)`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg('Invalid file format. Please upload PDF, JPG or PNG.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Start progress simulation
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setFormData({
          ...formData,
          bonafideName: selectedFile.name,
          bonafideSize: selectedFile.size,
          bonafideType: selectedFile.type,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 200);
  };

  const handleSubmit = () => {
    setErrorMsg('');

    if (resubmit && id) {
      resubmitApp.mutate({
        id,
        sourceStation: formData.sourceStation,
        destinationStation: formData.destinationStation,
        travelType: `${formData.ticketClass} Class - ${formData.travelType}`,
      }, {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStep(6);
        },
        onError: (err) => {
          setErrorMsg(err.message || 'Resubmission failed');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      });
      return;
    }

    // Check for duplicate application
    const hasPending = applications?.some(
      (app) => app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'College Verification'
    );

    if (hasPending && !renew) {
      setErrorMsg('Duplicate Application: You already have an active concession application under review.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    submitApp.mutate({
      sourceStation: formData.sourceStation,
      destinationStation: formData.destinationStation,
      travelType: `${formData.ticketClass} Class - ${formData.travelType}`,
    }, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep(6); // Success screen
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
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            {renew ? 'Renewal Submitted!' : 'Application Submitted!'}
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            {renew 
              ? 'Your concession pass renewal has been requested. We will notify you once college verifies it.'
              : 'Your new concession application has been sent to your college. You can track progress on the dashboard.'}
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
      
      {/* Header with Progress Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {renew ? 'Renew Pass Concession' : 'Apply for Concession'}
          </Text>
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
        <Animated.View key={step} entering={SlideInRight.duration(200)} exiting={SlideOutLeft.duration(200)}>
          
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Verify Saved Profile</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Confirm your student details are accurate
              </Text>
              
              <Input label="Full Name" value={user?.name || 'N/A'} editable={false} />
              <Input label="College Name" value={user?.college || 'N/A'} editable={false} />
              <Input label="Department & Sem" value={`${user?.department || 'N/A'} - ${user?.semester || 'N/A'}`} editable={false} />
              <Input label="Student ID / Roll No" value={`${user?.studentId || 'N/A'} / Roll No. ${user?.rollNumber || 'N/A'}`} editable={false} />
              <Input label="DOB" value={user?.dob || 'N/A'} editable={false} />
              <Input label="Mobile Number" value={user?.mobile || 'N/A'} editable={false} />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Select Pass Type</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Choose duration and ticket class
              </Text>
              
              <Text style={[styles.label, { color: colors.foreground }]}>Pass Duration</Text>
              <View style={styles.durationGrid}>
                {['Monthly', 'Quarterly', 'Half-Yearly'].map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.durationCard,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      formData.travelType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({...formData, travelType: type});
                    }}
                  >
                    <Text style={[
                      styles.durationText,
                      { color: colors.foreground },
                      formData.travelType === type && { color: colors.primary, fontWeight: '600' }
                    ]}>{type}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Ticket Class</Text>
              <View style={styles.durationGrid}>
                {['Second', 'First'].map((tClass) => (
                  <Pressable
                    key={tClass}
                    style={[
                      styles.durationCard,
                      { borderColor: colors.border, backgroundColor: colors.card, flex: 1, alignItems: 'center' },
                      formData.ticketClass === tClass && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData({...formData, ticketClass: tClass});
                    }}
                  >
                    <Text style={[
                      styles.durationText,
                      { color: colors.foreground },
                      formData.ticketClass === tClass && { color: colors.primary, fontWeight: '600' }
                    ]}>{tClass} Class</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirm Route</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Modify stations if they differ from your defaults
              </Text>
              
              <SearchableDropdown
                label="Source Station"
                placeholder="Search station..."
                options={MUMBAI_STATIONS}
                selectedValue={formData.sourceStation}
                onSelect={(val) => setFormData({...formData, sourceStation: val})}
                icon="map-pin"
              />

              <SearchableDropdown
                label="Destination Station"
                placeholder="Search station..."
                options={MUMBAI_STATIONS}
                selectedValue={formData.destinationStation}
                onSelect={(val) => setFormData({...formData, destinationStation: val})}
                icon="map-pin"
              />
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Bonafide Certificate</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Upload valid Bonafide (PDF/JPG/PNG max 2MB)
              </Text>
              
              <View style={styles.docUpload}>
                <Pressable 
                  style={[
                    styles.uploadBox, 
                    { 
                      backgroundColor: colors.card, 
                      borderColor: formData.bonafideName ? colors.success : colors.border, 
                      borderStyle: formData.bonafideName ? 'solid' : 'dashed' 
                    }
                  ]}
                  onPress={handleUploadBonafide}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <View style={styles.uploadingState}>
                      <Text style={[styles.uploadText, { color: colors.foreground, marginBottom: 8 }]}>
                        Uploading... {uploadProgress}%
                      </Text>
                      <View style={[styles.progressBar, { width: 150, backgroundColor: colors.muted }]}>
                        <View style={[styles.progressFill, { width: `${uploadProgress}%`, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                  ) : formData.bonafideName ? (
                    <View style={styles.uploadedState}>
                      <Feather name="file-text" size={36} color={colors.success} />
                      <Text style={[styles.uploadedText, { color: colors.foreground, marginTop: 8 }]}>
                        {formData.bonafideName}
                      </Text>
                      <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>
                        Size: ${(formData.bonafideSize / (1024 * 1024)).toFixed(2)} MB • Tap to replace
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.uploadState}>
                      <Feather name="upload-cloud" size={40} color={colors.primary} />
                      <Text style={[styles.uploadText, { color: colors.foreground, marginTop: 8, fontWeight: '600' }]}>
                        Tap to select Bonafide document
                      </Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 4 }}>
                        PDF, PNG or JPG (Limit 2MB)
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {errorMsg ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>{errorMsg}</Text>
              ) : null}
            </View>
          )}

          {step === 5 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Ensure details are correct. Double-check your route.
              </Text>
              
              <View style={[styles.reviewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ReviewRow label="Student Name" value={user?.name || 'N/A'} />
                <ReviewRow label="College Name" value={user?.college || 'N/A'} />
                <ReviewRow label="Route" value={`${formData.sourceStation} ➔ ${formData.destinationStation}`} />
                <ReviewRow label="Pass Duration" value={formData.travelType} />
                <ReviewRow label="Class Type" value={`${formData.ticketClass} Class`} />
                <ReviewRow label="Bonafide Certificate" value={formData.bonafideName || 'N/A'} hideBorder />
              </View>

              {errorMsg ? (
                <Text style={[styles.errorText, { color: colors.destructive, textAlign: 'center', marginTop: 16 }]}>
                  {errorMsg}
                </Text>
              ) : null}
            </View>
          )}

        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      {/* Wizard Footer Navigation */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={step === TOTAL_STEPS ? "Submit Application" : "Continue"}
          onPress={step === TOTAL_STEPS ? handleSubmit : handleNext}
          loading={submitApp.isPending || resubmitApp.isPending}
          disabled={
            (step === 3 && (!formData.sourceStation || !formData.destinationStation)) ||
            (step === 4 && !formData.bonafideName)
          }
        />
      </View>
    </View>
  );
}

function ReviewRow({ label, value, hideBorder }: { label: string; value: string; hideBorder?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.reviewRow, !hideBorder && { borderBottomColor: colors.border }]}>
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
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_500Medium',
  },
  content: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    fontFamily: 'Inter_400Regular',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  durationCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  docUpload: {
    marginBottom: 16,
  },
  uploadBox: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  uploadedState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedText: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  reviewBox: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    maxWidth: '65%',
    textAlign: 'right',
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
    fontFamily: 'Inter_700Bold',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
});
