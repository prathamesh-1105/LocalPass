import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { useApplication } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Feather } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { data: app } = useApplication(id as string);
  const { user } = useAuthStore();

  if (!app || !user) return null;

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: 'Digital Pass',
        headerRight: () => (
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Feather name="share" size={24} color={colors.foreground} />
          </Pressable>
        )
      }} />

      <View style={styles.container}>
        <Animated.View entering={ZoomIn.duration(400).springify()} style={[styles.certCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.certHeader, { backgroundColor: colors.primary }]}>
            <Text style={styles.certGovText}>GOVERNMENT OF RAILWAYS</Text>
            <Text style={styles.certTitle}>Student Concession Pass</Text>
          </View>

          <View style={styles.certBody}>
            <View style={styles.topSection}>
              <View style={styles.photoBox}>
                <Feather name="user" size={40} color={colors.mutedForeground} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
                <Text style={[styles.college, { color: colors.mutedForeground }]}>{user.college}</Text>
                <Text style={[styles.idText, { color: colors.mutedForeground }]}>ID: {user.studentId}</Text>
              </View>
            </View>

            <View style={styles.routeSection}>
              <View style={styles.routeCol}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>From</Text>
                <Text style={[styles.value, { color: colors.foreground }]}>{app.sourceStation}</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.primary} style={{ marginTop: 16 }} />
              <View style={styles.routeCol}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>To</Text>
                <Text style={[styles.value, { color: colors.foreground }]}>{app.destinationStation}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Type</Text>
                <Text style={[styles.valueSmall, { color: colors.foreground }]}>{app.travelType}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Class</Text>
                <Text style={[styles.valueSmall, { color: colors.foreground }]}>Second</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Valid Till</Text>
                <Text style={[styles.valueSmall, { color: colors.foreground }]}>30 Oct 2024</Text>
              </View>
            </View>

            <View style={styles.qrSection}>
              <View style={[styles.qrPlaceholder, { borderColor: colors.border }]}>
                <Feather name="maximize" size={64} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.certNo, { color: colors.mutedForeground }]}>Cert No: {app.certificateId || 'CERT-982103'}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  certCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  certHeader: {
    padding: 20,
    alignItems: 'center',
  },
  certGovText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  certTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  certBody: {
    padding: 24,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  photoBox: {
    width: 80,
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  college: {
    fontSize: 14,
    marginBottom: 4,
  },
  idText: {
    fontSize: 12,
  },
  routeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  routeCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gridItem: {
    flex: 1,
  },
  valueSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  certNo: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});
