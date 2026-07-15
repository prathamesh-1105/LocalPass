import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/store/authStore';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const colors = useColors();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    mobile: user?.mobile || '',
    address: user?.address || '',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace('/(auth)/login');
  };

  const pickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permissions are required to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri && user) {
      setUser({
        ...user,
        avatarUrl: result.assets[0].uri,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;

    if (!editForm.mobile || editForm.mobile.length !== 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUser({
      ...user,
      mobile: editForm.mobile,
      address: editForm.address,
      emergencyContactName: editForm.emergencyContactName,
      emergencyContactPhone: editForm.emergencyContactPhone,
    });
    setEditModalVisible(false);
  };

  const handleOpenEdit = () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditForm({
      mobile: user.mobile,
      address: user.address,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
    });
    setEditModalVisible(true);
  };

  if (!user) return null;

  return (
    <Screen scrollable safeAreaEdges={['top']} style={{ backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Profile</Text>
      </View>

      {/* Main Profile Info */}
      <View style={styles.profileCard}>
        <Pressable style={styles.avatarWrapper} onPress={pickAvatar}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user.name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
            <Feather name="camera" size={12} color="#fff" />
          </View>
        </Pressable>

        <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.collegeEmail}</Text>
        <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
          <Feather name="check-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
          <Text style={[styles.badgeText, { color: colors.success }]}>VERIFIED STUDENT</Text>
        </View>
      </View>

      {/* Academic Details Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Academic Details</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow icon="book" label="College" value={user.college} />
          <InfoRow icon="award" label="Department" value={user.department} />
          <InfoRow icon="hash" label="Student ID / Roll No" value={`${user.studentId} / Roll No. ${user.rollNumber}`} />
          <InfoRow icon="calendar" label="Academic Year" value={`${user.year} (${user.semester})`} hideBorder />
        </View>
      </View>

      {/* Contact & Emergency Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
            Contact & Emergency Info
          </Text>
          <Pressable onPress={handleOpenEdit}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>Edit</Text>
          </Pressable>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow icon="phone" label="Mobile" value={`+91 ${user.mobile}`} />
          <InfoRow icon="map-pin" label="Address" value={user.address || 'Not Added'} />
          <InfoRow 
            icon="heart" 
            label="Emergency Contact" 
            value={user.emergencyContactName ? `${user.emergencyContactName} (${user.emergencyContactPhone})` : 'Not Added'} 
            hideBorder 
          />
        </View>
      </View>

      {/* Settings & Vault Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences & Support</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow icon="folder" label="Document Vault" onPress={() => router.push('/documents')} />
          <ActionRow icon="settings" label="App Settings" onPress={() => router.push('/settings')} />
          <ActionRow icon="help-circle" label="Help & Support" onPress={() => router.push('/help')} hideBorder />
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={styles.footer}>
        <Button 
          title="Sign Out" 
          variant="destructive" 
          icon="log-out" 
          onPress={handleLogout} 
        />
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input
              label="Mobile Number"
              placeholder="E.g. 9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={editForm.mobile}
              onChangeText={(text) => setEditForm({ ...editForm, mobile: text.replace(/[^0-9]/g, '') })}
              icon="phone"
            />

            <Input
              label="Home Address"
              placeholder="Enter your home address"
              multiline
              value={editForm.address}
              onChangeText={(text) => setEditForm({ ...editForm, address: text })}
              icon="map-pin"
            />

            <View style={styles.emergencyDivider}>
              <Text style={[styles.emergencyHeading, { color: colors.primary }]}>Emergency Contact Details</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.primary + '30' }]} />
            </View>

            <Input
              label="Contact Name (Parent/Guardian)"
              placeholder="E.g. Rajesh Mehta"
              value={editForm.emergencyContactName}
              onChangeText={(text) => setEditForm({ ...editForm, emergencyContactName: text })}
              icon="user"
            />

            <Input
              label="Contact Phone"
              placeholder="E.g. 9876500000"
              keyboardType="phone-pad"
              maxLength={10}
              value={editForm.emergencyContactPhone}
              onChangeText={(text) => setEditForm({ ...editForm, emergencyContactPhone: text.replace(/[^0-9]/g, '') })}
              icon="phone"
            />
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Button title="Save Details" onPress={handleSaveProfile} />
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

function InfoRow({ icon, label, value, hideBorder }: { icon: any; label: string; value: string; hideBorder?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.row, !hideBorder && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '0a' }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.foreground }]} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, onPress, hideBorder }: { icon: any; label: string; onPress: () => void; hideBorder?: boolean }) {
  const colors = useColors();
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow, 
        !hideBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.muted }
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '0a' }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'Inter_400Regular',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
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
  emergencyDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  emergencyHeading: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginRight: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
  },
});
