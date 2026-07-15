import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/store/authStore';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const colors = useColors();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  if (!user) return null;

  return (
    <Screen scrollable safeAreaEdges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user.name.charAt(0)}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.collegeEmail || user.email}</Text>
        <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
          <Feather name="check-circle" size={14} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: colors.success }]}>Verified Student</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Academic Details</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow icon="book" label="College" value={user.college} />
          <InfoRow icon="award" label="Department" value={user.department} />
          <InfoRow icon="hash" label="Student ID" value={user.studentId} />
          <InfoRow icon="calendar" label="Year & Sem" value={`${user.year}, ${user.semester}`} hideBorder />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings & Preferences</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow icon="folder" label="Document Vault" onPress={() => {}} />
          <ActionRow icon="settings" label="App Settings" onPress={() => router.push('/settings')} />
          <ActionRow icon="help-circle" label="Help Center" onPress={() => router.push('/help')} hideBorder />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Sign Out" 
          variant="destructive" 
          icon="log-out" 
          onPress={handleLogout} 
        />
      </View>
    </Screen>
  );
}

function InfoRow({ icon, label, value, hideBorder }: { icon: any; label: string; value: string; hideBorder?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.row, !hideBorder && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
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
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
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
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
});
