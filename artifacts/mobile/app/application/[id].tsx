import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApplication } from '@/services/api';
import { Screen } from '@/components/Screen';
import { Badge } from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// List of all chronological stages in the concession lifecycle
const LIFECYCLE_STAGES = [
  { status: 'Submitted', label: 'Application Submitted', desc: 'Sent to college for review' },
  { status: 'College Verification', label: 'College Verification', desc: 'Verifying student credentials' },
  { status: 'Approved', label: 'College Approved', desc: 'Signed by college registrar' },
  { status: 'Railway Verification', label: 'Railway Verification (Future)', desc: 'Validating with railway database' },
  { status: 'Payment', label: 'Concession Payment (Future)', desc: 'Generate discount pass coupon' },
  { status: 'Completed', label: 'Pass Generated', desc: 'Digital pass is ready to use' }
];

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { data: app, isLoading } = useApplication(id as string);

  if (isLoading) {
    return (
      <Screen style={{ padding: 24 }}>
        <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={100} style={{ marginBottom: 32 }} />
        <Skeleton width={150} height={24} style={{ marginBottom: 24 }} />
        <Skeleton width="100%" height={200} />
      </Screen>
    );
  }

  if (!app) {
    return (
      <Screen style={styles.errorScreen}>
        <Feather name="alert-circle" size={48} color={colors.destructive} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Application Not Found</Text>
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  // Determine stage progress
  const getStageIndex = (status: string) => {
    if (status === 'Rejected') return 1; // Highlight up to verification
    if (status === 'Under Review') return 1;
    if (status === 'College Verification') return 1;
    if (status === 'Approved') return 2;
    if (status === 'Completed') return 5;
    return 0; // Submitted
  };

  const currentStageIndex = getStageIndex(app.status);
  const isRejected = app.status === 'Rejected';

  const handleResubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/apply?resubmit=true&id=${app.id}`);
  };

  return (
    <Screen scrollable style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: 'Concession Details' }} />

      {/* Header Info */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appId, { color: colors.mutedForeground }]}>Concession #{app.id}</Text>
          <Badge 
            label={app.status} 
            variant={isRejected ? 'destructive' : app.status === 'Approved' || app.status === 'Completed' ? 'success' : 'warning'} 
          />
        </View>
        <Text style={[styles.routeText, { color: colors.foreground }]}>
          {app.sourceStation} ➔ {app.destinationStation}
        </Text>
        <Text style={[styles.subText, { color: colors.mutedForeground }]}>
          {app.travelType} Pass • Submitted {new Date(app.submittedAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Rejection Alert Card */}
      {isRejected && (
        <Animated.View entering={FadeInUp.springify()} style={styles.rejectionCard}>
          <View style={[styles.rejectionHeader, { backgroundColor: colors.destructive }]}>
            <Feather name="alert-triangle" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.rejectionTitle}>Application Rejected</Text>
          </View>
          <View style={[styles.rejectionBody, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
            <Text style={[styles.rejectionReasonLabel, { color: colors.mutedForeground }]}>Reason for rejection:</Text>
            <Text style={[styles.rejectionReason, { color: colors.foreground }]}>
              {app.rejectionReason || 'Uploaded Bonafide certificate is blurry or has missing college seal. Please upload a clear digital copy.'}
            </Text>
            <Button 
              title="Edit & Resubmit Application" 
              icon="edit"
              onPress={handleResubmit}
              style={{ marginTop: 16 }}
            />
          </View>
        </Animated.View>
      )}

      {/* Digital Pass Button if Completed */}
      {(app.status === 'Approved' || app.status === 'Completed') && (
        <View style={styles.actionSection}>
          <Button 
            title="View Digital Pass" 
            icon="qr-code"
            onPress={() => router.push(`/certificate/${app.id}`)}
          />
        </View>
      )}

      {/* Lifecycle Timeline */}
      <View style={styles.timelineSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Verification Timeline</Text>
        <View style={styles.timeline}>
          {LIFECYCLE_STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex && !isRejected;
            const isCurrent = index === currentStageIndex && !isRejected;
            const isStageRejected = isRejected && index === 1; // Highlight rejection at verification stage
            const isFuture = index > currentStageIndex && !isRejected;

            let nodeColor = colors.muted;
            if (isCompleted) nodeColor = colors.success;
            if (isCurrent) nodeColor = colors.primary;
            if (isStageRejected) nodeColor = colors.destructive;

            return (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(index * 100)}
                style={styles.timelineItem}
              >
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.node, 
                    { 
                      backgroundColor: nodeColor,
                      width: isCurrent || isStageRejected ? 16 : 12,
                      height: isCurrent || isStageRejected ? 16 : 12,
                      borderRadius: isCurrent || isStageRejected ? 8 : 6,
                    }
                  ]} />
                  {index < LIFECYCLE_STAGES.length - 1 && (
                    <View style={[
                      styles.line, 
                      { backgroundColor: isCompleted ? colors.success : colors.border }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.eventLabel, 
                    { color: isFuture ? colors.mutedForeground : colors.foreground },
                    isCurrent && { color: colors.primary, fontWeight: '700' },
                    isStageRejected && { color: colors.destructive, fontWeight: '700' }
                  ]}>
                    {isStageRejected ? 'Rejected by College registrar' : stage.label}
                  </Text>
                  <Text style={[styles.eventDesc, { color: colors.mutedForeground }]}>
                    {isStageRejected ? 'See details above to resubmit.' : stage.desc}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appId: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  routeText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rejectionCard: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rejectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  rejectionBody: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 6,
  },
  rejectionReason: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  actionSection: {
    padding: 24,
    paddingBottom: 0,
  },
  timelineSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 16,
  },
  node: {
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 6,
    marginBottom: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 28,
  },
  eventLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
