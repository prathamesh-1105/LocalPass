import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/authStore';
import { useApplications } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const colors = useColors();
  const { data: applications, isLoading, refetch } = useApplications();

  const activeApp = applications?.[0];

  return (
    <Screen 
      scrollable 
      safeAreaEdges={['top']} 
      refreshing={isLoading}
      onRefresh={refetch}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good morning,
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.name.split(' ')[0]}
          </Text>
        </View>
        <Pressable 
          style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.name.charAt(0)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card 
            style={[styles.statusCard, { backgroundColor: colors.primary }]}
            onPress={() => activeApp ? router.push(`/application/${activeApp.id}`) : router.push('/apply')}
          >
            <View style={styles.statusHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name="train" size={24} color="#fff" />
              </View>
              {activeApp ? (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.statusBadgeText}>{activeApp.status}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.statusBody}>
              <Text style={styles.statusTitle}>
                {activeApp ? 'Current Concession Pass' : 'Apply for Concession'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {activeApp 
                  ? `${activeApp.sourceStation} to ${activeApp.destinationStation}`
                  : 'Start your application for a railway pass online.'}
              </Text>
            </View>
            <View style={styles.statusFooter}>
              <Text style={styles.statusAction}>
                {activeApp ? 'View Details' : 'Start Application'}
              </Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </View>
          </Card>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.grid}>
            <ActionBox icon="file-plus" label="New Apply" delay={200} onPress={() => router.push('/apply')} />
            <ActionBox icon="refresh-cw" label="Renew" delay={250} onPress={() => router.push('/apply')} />
            <ActionBox icon="folder" label="Documents" delay={300} onPress={() => {}} />
            <ActionBox icon="message-circle" label="Assistant" delay={350} onPress={() => {}} />
          </View>
        </View>

        {applications && applications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Recent Applications</Text>
              <Pressable onPress={() => router.push('/(tabs)/applications')}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>See all</Text>
              </Pressable>
            </View>
            {applications.slice(0, 2).map((app, index) => (
              <Animated.View key={app.id} entering={FadeInDown.delay(400 + index * 100).springify()}>
                <Card 
                  style={styles.appCard} 
                  onPress={() => router.push(`/application/${app.id}`)}
                >
                  <View style={styles.appHeader}>
                    <Text style={[styles.appId, { color: colors.mutedForeground }]}>#{app.id}</Text>
                    <Badge 
                      label={app.status} 
                      variant={app.status === 'Approved' ? 'success' : app.status === 'Under Review' ? 'warning' : 'default'} 
                    />
                  </View>
                  <Text style={[styles.appRoute, { color: colors.foreground }]}>
                    {app.sourceStation} <Feather name="arrow-right" size={14} /> {app.destinationStation}
                  </Text>
                  <Text style={[styles.appDate, { color: colors.mutedForeground }]}>
                    Submitted {new Date(app.submittedAt).toLocaleDateString()}
                  </Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function ActionBox({ icon, label, delay, onPress }: { icon: any; label: string; delay: number; onPress: () => void }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.actionWrap}>
      <Pressable 
        style={({ pressed }) => [
          styles.actionBox, 
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
        ]}
        onPress={onPress}
      >
        <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
          <Feather name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    paddingTop: 8,
    gap: 32,
  },
  statusCard: {
    padding: 24,
    borderWidth: 0,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBody: {
    marginBottom: 24,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAction: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionWrap: {
    width: '47%',
  },
  actionBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  appCard: {
    marginBottom: 12,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appId: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  appRoute: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  appDate: {
    fontSize: 12,
  },
});
