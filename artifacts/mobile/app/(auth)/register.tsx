import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

// Constants
const MUMBAI_COLLEGES = [
  'Veermata Jijabai Technological Institute (VJTI)',
  'K. J. Somaiya College of Engineering (KJSCE)',
  'Sardar Patel Institute of Technology (SPIT)',
  'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
  'Thadomal Shahani Engineering College (TSEC)',
  'Fr. Conceicao Rodrigues College of Engineering (CRCE)',
  'Ramrao Adik Institute of Technology (RAIT)',
  'Mithibai College of Arts',
  'St. Xavier\'s College',
  'Jai Hind College',
  'H.R. College of Commerce and Economics',
  'Wilson College',
  'Sophia College for Women',
  'Narsee Monjee College of Commerce (NM College)',
  'R. A. Podar College of Commerce and Economics',
  'D. G. Ruparel College of Arts, Science and Commerce',
];

const MUMBAI_STATIONS = [
  'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
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

const TOTAL_STEPS = 4;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  collegeEmail: z.string().email('Please enter a valid college email'),
  college: z.string().min(1, 'Please select your college'),
  department: z.string().min(1, 'Please enter your department'),
  year: z.string().min(1, 'Please enter your academic year'),
  semester: z.string().min(1, 'Please enter your semester'),
  studentId: z.string().min(1, 'Please enter your Student ID / Roll Number'),
  rollNumber: z.string().min(1, 'Please enter your Roll Number'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter DOB in YYYY-MM-DD format'),
  gender: z.string().min(1, 'Please select your gender'),
  sourceStation: z.string().min(1, 'Please select your source station'),
  destinationStation: z.string().min(1, 'Please select your destination station'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const colors = useColors();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const [step, setStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [collegeIdFile, setCollegeIdFile] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [studentPhotoFile, setStudentPhotoFile] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      collegeEmail: '',
      college: '',
      department: '',
      year: '3rd Year',
      semester: '6th Sem',
      studentId: '',
      rollNumber: '',
      dob: '2004-01-01',
      gender: 'Male',
      sourceStation: '',
      destinationStation: '',
    },
  });

  const pickImage = async (onSelected: (uri: string) => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Mock fallback in case of simulator permission issues
      onSelected('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      onSelected(result.assets[0].uri);
    } else {
      // Mock fallback
      onSelected('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Step validation before moving next
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'dob', 'gender']);
    } else if (step === 2) {
      isValid = await trigger(['college', 'collegeEmail', 'department', 'studentId', 'rollNumber']);
    } else if (step === 3) {
      isValid = await trigger(['sourceStation', 'destinationStation']);
    }

    if (isValid && step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) setStep(step - 1);
    else router.replace('/(auth)/login');
  };

  const onSubmit = (data: RegisterFormData) => {
    if (!collegeIdFile || !aadhaarFile || !studentPhotoFile) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      alert('Please upload all required documents.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save in Auth store
    setUser({
      id: `u-${Date.now()}`,
      name: data.name,
      email: data.collegeEmail,
      mobile: mobile || '9876543210',
      collegeEmail: data.collegeEmail,
      collegeEmailVerified: true,
      avatarUrl: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      dob: data.dob,
      gender: data.gender,
      address: 'Mumbai, Maharashtra',
      college: data.college,
      department: data.department,
      year: data.year,
      semester: data.semester,
      studentId: data.studentId,
      rollNumber: data.rollNumber,
      emergencyContactName: 'Guardian',
      emergencyContactPhone: '9876500000',
    });
    setToken('mock-registered-token');

    // Route to Dashboard
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>One-Time Register</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${(step / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.stepText, { color: colors.mutedForeground }]}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View key={step} entering={SlideInRight.duration(200)} exiting={SlideOutLeft.duration(200)}>
          
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Personal Details</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Tell us about yourself
              </Text>

              <View style={styles.photoContainer}>
                <Pressable
                  style={[styles.photoBox, { borderColor: colors.border }]}
                  onPress={() => pickImage(setProfilePhoto)}
                >
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Feather name="camera" size={28} color={colors.mutedForeground} />
                      <Text style={[styles.photoText, { color: colors.mutedForeground }]}>Profile Photo</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name (As per College ID)"
                    placeholder="E.g. Rohan Mehta"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.name?.message}
                  />
                )}
              />

              <Input label="Mobile Number" value={mobile || '9876543210'} editable={false} icon="phone" />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Controller
                    control={control}
                    name="dob"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="DOB (YYYY-MM-DD)"
                        placeholder="2004-01-01"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.dob?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownLabel, { color: colors.foreground }]}>Gender</Text>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.genderRow}>
                        {['Male', 'Female'].map((g) => (
                          <Pressable
                            key={g}
                            style={[
                              styles.genderBtn,
                              { borderColor: colors.border, backgroundColor: colors.card },
                              value === g && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              onChange(g);
                            }}
                          >
                            <Text
                              style={[
                                styles.genderBtnText,
                                { color: colors.foreground },
                                value === g && { color: colors.primary, fontWeight: '600' },
                              ]}
                            >
                              {g}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Academic Details</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Provide your college credentials
              </Text>

              <Controller
                control={control}
                name="college"
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label="College Name"
                    placeholder="Search Mumbai College..."
                    options={MUMBAI_COLLEGES}
                    selectedValue={value}
                    onSelect={onChange}
                    error={errors.college?.message}
                    icon="book"
                  />
                )}
              />

              <Controller
                control={control}
                name="collegeEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="College Email ID"
                    placeholder="rohan@vjti.ac.in"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.collegeEmail?.message}
                    icon="mail"
                  />
                )}
              />

              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Department"
                    placeholder="E.g. Information Technology"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.department?.message}
                  />
                )}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Controller
                    control={control}
                    name="studentId"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Student ID"
                        placeholder="E.g. 21102001"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.studentId?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="rollNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Roll Number"
                        placeholder="E.g. 15"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.rollNumber?.message}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Journey Stations</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Select your travel route
              </Text>

              <Controller
                control={control}
                name="sourceStation"
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label="Source Station"
                    placeholder="Search Local Station..."
                    options={MUMBAI_STATIONS}
                    selectedValue={value}
                    onSelect={onChange}
                    error={errors.sourceStation?.message}
                    icon="map-pin"
                  />
                )}
              />

              <Controller
                control={control}
                name="destinationStation"
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label="Destination Station"
                    placeholder="Search Local Station..."
                    options={MUMBAI_STATIONS}
                    selectedValue={value}
                    onSelect={onChange}
                    error={errors.destinationStation?.message}
                    icon="map-pin"
                  />
                )}
              />
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Upload Documents</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Verification documents (One-time upload)
              </Text>

              <DocUploadRow
                title="College ID Card"
                description="Upload scanned front side"
                fileName={collegeIdFile}
                onSelect={() => pickImage(setCollegeIdFile)}
              />

              <DocUploadRow
                title="Aadhaar Card"
                description="Upload Aadhaar card copy"
                fileName={aadhaarFile}
                onSelect={() => pickImage(setAadhaarFile)}
              />

              <DocUploadRow
                title="Student Photo"
                description="Passport size photo with clear face"
                fileName={studentPhotoFile}
                onSelect={() => pickImage(setStudentPhotoFile)}
              />
            </View>
          )}

        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title={step === TOTAL_STEPS ? 'Register Profile' : 'Continue'}
          onPress={step === TOTAL_STEPS ? handleSubmit(onSubmit) : handleNext}
        />
      </View>
    </View>
  );
}

interface DocUploadRowProps {
  title: string;
  description: string;
  fileName: string | null;
  onSelect: () => void;
}

function DocUploadRow({ title, description, fileName, onSelect }: DocUploadRowProps) {
  const colors = useColors();
  const isUploaded = !!fileName;

  return (
    <View style={styles.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.docTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.docDesc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <Pressable
        style={[
          styles.uploadBtn,
          {
            borderColor: isUploaded ? colors.success : colors.border,
            backgroundColor: isUploaded ? colors.success + '08' : colors.card,
          },
        ]}
        onPress={onSelect}
      >
        {isUploaded ? (
          <View style={styles.btnRow}>
            <Feather name="check" size={16} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.uploadBtnText, { color: colors.success }]}>Attached</Text>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <Feather name="upload" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.uploadBtnText, { color: colors.primary }]}>Upload</Text>
          </View>
        )}
      </Pressable>
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  row: {
    flexDirection: 'row',
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  docDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  uploadBtn: {
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
});
