import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApplication } from '@/services/api';
import { Screen } from '@/components/Screen';
import { Badge } from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

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

  if (!app) return null;

  return (
    <Screen scrollable>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appId, { color: colors.mutedForeground }]}>Application #{app.id}</Text>
          <Badge 
            label={app.status} 
            variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'destructive' : app.status === 'Under Review' ? 'warning' : 'default'} 
          />
        </View>
        <Text style={[styles.routeText, { color: colors.foreground }]}>
          {app.sourceStation} <Feather name="arrow-right" size={16} /> {app.destinationStation}
        </Text>
        <Text style={[styles.subText, { color: colors.mutedForeground }]}>
          {app.travelType} Pass • Submitted {new Date(app.submittedAt).toLocaleDateString()}
        </Text>
      </View>

      {app.status === 'Approved' && (
        <View style={styles.actionSection}>
          <Button 
            title="View Digital Certificate" 
            icon="award"
            onPress={() => router.push(`/certificate/${app.id}`)}
          />
        </View>
      )}

      <View style={styles.timelineSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Status Timeline</Text>
        <View style={styles.timeline}>
          {app.timeline.map((event, index) => {
            const isLast = index === app.timeline.length - 1;
            const isApproved = event.status === 'Approved';
            const isRejected = event.status === 'Rejected';
            const nodeColor = isApproved ? colors.success : isRejected ? colors.destructive : colors.primary;

            return (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(index * 150)}
                style={styles.timelineItem}
              >
                <View style={styles.timelineLeft}>
                  <View style={[styles.node, { backgroundColor: nodeColor }]} />
                  {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.eventStatus, { color: colors.foreground }]}>{event.status}</Text>
                  <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>
                    {new Date(event.timestamp).toLocaleString()}
                  </Text>
                  {event.note && (
                    <View style={[styles.noteBox, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.noteText, { color: colors.foreground }]}>{event.note}</Text>
                    </View>
                  )}
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
    fontWeight: '500',
  },
  routeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 32,
  },
  eventStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
  },
  noteBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
