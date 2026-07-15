import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { useApplication } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Feather } from '@expo/vector-icons';
import Animated, { ZoomIn, useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { data: app } = useApplication(id as string);
  const { user } = useAuthStore();

  const [timer, setTimer] = useState(30);
  const qrOpacity = useSharedValue(1);

  // Auto-refresh timer for dynamic QR code placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t === 1) {
          // Trigger a quick flash animation on QR refresh
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          qrOpacity.value = withSequence(
            withTiming(0.2, { duration: 150 }),
            withTiming(1, { duration: 250 })
          );
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const animatedQrStyle = useAnimatedStyle(() => ({
    opacity: qrOpacity.value,
  }));

  if (!app || !user) return null;

  return (
    <Screen style={{ backgroundColor: colors.background }} safeAreaEdges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Digital Railway Pass',
        headerRight: () => null // Explicitly remove download/share button
      }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View 
          entering={ZoomIn.duration(350).springify()} 
          style={[styles.certCard, { backgroundColor: '#0f172a', borderColor: '#334155' }]} // Deep slate 900 for premium theme
        >
          {/* Railway Header Branding */}
          <View style={[styles.certHeader, { backgroundColor: '#0284c7' }]}>
            <Text style={styles.certGovText}>INDIAN RAILWAYS • MUMBAI DIVISION</Text>
            <Text style={styles.certTitle}>STUDENT CONCESSION PASS</Text>
          </View>

          <View style={styles.certBody}>
            {/* Student Info */}
            <View style={styles.topSection}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.photoBox} />
              ) : (
                <View style={[styles.photoBox, { backgroundColor: '#334155', borderColor: '#475569' }]}>
                  <Feather name="user" size={40} color="#94a3b8" />
                </View>
              )}
              <View style={styles.studentInfo}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.college} numberOfLines={1}>{user.college}</Text>
                <Text style={styles.idText}>ID: {user.studentId} • Roll: {user.rollNumber}</Text>
              </View>
            </View>

            {/* Travel Route */}
            <View style={styles.routeSection}>
              <View style={styles.routeCol}>
                <Text style={styles.label}>SOURCE</Text>
                <Text style={styles.value} numberOfLines={1}>{app.sourceStation.split(' (')[0]}</Text>
              </View>
              <View style={styles.routeColCenter}>
                <Feather name="arrow-right" size={18} color="#0284c7" />
                <View style={styles.classBadge}>
                  <Text style={styles.classBadgeText}>2ND CLASS</Text>
                </View>
              </View>
              <View style={styles.routeCol}>
                <Text style={styles.label}>DESTINATION</Text>
                <Text style={styles.value} numberOfLines={1}>{app.destinationStation.split(' (')[0]}</Text>
              </View>
            </View>

            {/* Pass Metadata */}
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>PASS NUMBER</Text>
                <Text style={styles.valueSmall}>OP-{app.id.toUpperCase()}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>DURATION</Text>
                <Text style={styles.valueSmall}>{app.travelType.includes(' - ') ? app.travelType.split(' - ')[1] : app.travelType}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>VALID TILL</Text>
                <Text style={[styles.valueSmall, { color: '#ef4444', fontWeight: '700' }]}>30 Oct 2026</Text>
              </View>
            </View>

            {/* Dynamic Security QR Code */}
            <View style={styles.qrSection}>
              <Animated.View style={[styles.qrWrapper, animatedQrStyle]}>
                {/* Visual mock representation of a premium QR code */}
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=150' }} 
                  style={styles.qrImage}
                />
                <View style={styles.qrOverlay}>
                  <Feather name="qr-code" size={48} color="#0284c7" />
                </View>
              </Animated.View>

              {/* Refresh Timer Display */}
              <View style={styles.timerRow}>
                <Feather name="shield" size={14} color="#0ea5e9" style={{ marginRight: 6 }} />
                <Text style={styles.timerText}>
                  Dynamic security code refreshes in <Text style={styles.timerSecs}>{timer}s</Text>
                </Text>
              </View>
              <Text style={styles.certNo}>Cert ID: {app.certificateId || `CERT-${app.id.toUpperCase()}`}</Text>
            </View>
          </View>
        </Animated.View>

        {/* In-app security warning footer */}
        <View style={[styles.securityNotice, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '30' }]}>
          <Feather name="lock" size={18} color={colors.destructive} style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.securityTitleText, { color: colors.destructive }]}>Secured Digital Pass</Text>
            <Text style={[styles.securityDescText, { color: colors.foreground }]}>
              This pass is valid only when displayed live inside this app. Printed copies, screenshots, or videos will not be accepted by railway authorities.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  certCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  certHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  certGovText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  certTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  certBody: {
    padding: 24,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  photoBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#38bdf8', // sky-400
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  college: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  idText: {
    color: '#64748b',
    fontSize: 12,
  },
  routeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  routeCol: {
    flex: 1.2,
  },
  routeColCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  classBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  classBadgeText: {
    color: '#0284c7',
    fontSize: 9,
    fontWeight: '700',
  },
  label: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
  },
  valueSmall: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  qrSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingTop: 24,
  },
  qrWrapper: {
    width: 144,
    height: 144,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  qrImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    opacity: 0.05, // keep it faint as background
  },
  qrOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginBottom: 12,
  },
  timerText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  timerSecs: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  certNo: {
    color: '#475569',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  securityNotice: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
  },
  securityTitleText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  securityDescText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
});
