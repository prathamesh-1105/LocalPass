import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/authStore';
import { useApplications } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const colors = useColors();
  const { data: applications, isLoading, refetch } = useApplications();

  // Find the most relevant application
  const activeApp = applications?.[0];

  const handleQuickAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <Screen 
      scrollable 
      safeAreaEdges={['top']} 
      refreshing={isLoading}
      onRefresh={refetch}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.name ? user.name.split(' ')[0] : 'Student'}
          </Text>
        </View>
        <Pressable 
          style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleQuickAction('/(tabs)/profile')}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.name ? user.name.charAt(0) : 'S'}
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Dynamic Status / Pass Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          {activeApp?.status === 'Approved' ? (
            /* Premium Active Pass Card */
            <Card 
              style={[styles.passCard, { backgroundColor: '#0f172a' }]} // Slate 900 for dark premium pass look
              onPress={() => handleQuickAction(`/certificate/${activeApp.id}`)}
            >
              <View style={styles.passHeader}>
                <View style={styles.passLogoContainer}>
                  <Feather name="train" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.passTitle}>LOCALONE DIGITAL PASS</Text>
                </View>
                <Badge label="ACTIVE" variant="success" />
              </View>
              
              <View style={styles.passBody}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.passPhoto} />
                ) : (
                  <View style={styles.passPhotoPlaceholder}>
                    <Feather name="user" size={24} color="#64748b" />
                  </View>
                )}
                <View style={styles.passDetails}>
                  <Text style={styles.passName}>{user?.name || 'Student Name'}</Text>
                  <Text style={styles.passRoute}>
                    {activeApp.sourceStation} ➔ {activeApp.destinationStation}
                  </Text>
                  <Text style={styles.passMuted}>Class: Second • {activeApp.travelType}</Text>
                </View>
              </View>

              <View style={[styles.passDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

              <View style={styles.passFooter}>
                <View style={styles.passValidityWrap}>
                  <Feather name="calendar" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                  <Text style={styles.passValidity}>Valid till: 30 Oct 2026</Text>
                </View>
                <View style={styles.showPassBtn}>
                  <Text style={styles.showPassText}>View Pass</Text>
                  <Feather name="qr-code" size={16} color="#38bdf8" style={{ marginLeft: 6 }} />
                </View>
              </View>
            </Card>
          ) : activeApp ? (
            /* Pending / Submitted Application Card */
            <Card 
              style={[styles.statusCard, { borderColor: colors.border }]}
              onPress={() => handleQuickAction(`/application/${activeApp.id}`)}
            >
              <View style={styles.statusHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                  <Feather name="file-text" size={24} color={colors.primary} />
                </View>
                <Badge 
                  label={activeApp.status} 
                  variant={activeApp.status === 'Rejected' ? 'destructive' : 'warning'} 
                />
              </View>
              <View style={styles.statusBody}>
                <Text style={[styles.statusTitleText, { color: colors.foreground }]}>
                  Application Status
                </Text>
                <Text style={[styles.statusSubtitleText, { color: colors.mutedForeground }]}>
                  Route: {activeApp.sourceStation} to {activeApp.destinationStation}
                </Text>
                {activeApp.status === 'Rejected' && (
                  <View style={[styles.rejectionNotice, { backgroundColor: colors.destructive + '10' }]}>
                    <Feather name="alert-triangle" size={14} color={colors.destructive} style={{ marginRight: 6 }} />
                    <Text style={[styles.rejectionNoticeText, { color: colors.destructive }]} numberOfLines={1}>
                      Click to review reason & resubmit
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.passDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statusFooter}>
                <Text style={[styles.statusActionText, { color: colors.primary }]}>
                  {activeApp.status === 'Rejected' ? 'Resubmit Now' : 'Track Application'}
                </Text>
                <Feather name="arrow-right" size={16} color={colors.primary} />
              </View>
            </Card>
          ) : (
            /* No Application Card */
            <Card 
              style={[styles.statusCard, { backgroundColor: colors.primary }]}
              onPress={() => handleQuickAction('/apply')}
            >
              <View style={styles.statusHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Feather name="plus-circle" size={24} color="#fff" />
                </View>
              </View>
              <View style={styles.statusBody}>
                <Text style={[styles.statusTitleText, { color: '#fff' }]}>
                  Apply for Concession
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 }}>
                  Get discounted student railway passes in 3 simple steps. Complete your profile, select your route, and upload your Bonafide.
                </Text>
              </View>
              <View style={styles.statusFooter}>
                <Text style={[styles.statusActionText, { color: '#fff' }]}>
                  Start New Application
                </Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </View>
            </Card>
          )}
        </Animated.View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.grid}>
            <ActionBox 
              icon="file-plus" 
              label="New Apply" 
              delay={200} 
              onPress={() => handleQuickAction('/apply')} 
            />
            <ActionBox 
              icon="refresh-cw" 
              label="Renew Pass" 
              delay={250} 
              onPress={() => handleQuickAction(activeApp?.status === 'Approved' ? '/apply?renew=true' : '/apply')} 
            />
            <ActionBox 
              icon="folder" 
              label="Doc Vault" 
              delay={300} 
              onPress={() => handleQuickAction('/documents')} 
            />
            <ActionBox 
              icon="help-circle" 
              label="Help Center" 
              delay={350} 
              onPress={() => handleQuickAction('/help')} 
            />
          </View>
        </View>

        {/* Recent Applications Timeline snippet */}
        {applications && applications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
                Concession History
              </Text>
              <Pressable onPress={() => handleQuickAction('/(tabs)/applications')}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>See all</Text>
              </Pressable>
            </View>
            {applications.slice(0, 2).map((app, index) => (
              <Animated.View key={app.id} entering={FadeInDown.delay(400 + index * 100).springify()}>
                <Card 
                  style={styles.appCard} 
                  onPress={() => handleQuickAction(`/application/${app.id}`)}
                >
                  <View style={styles.appHeader}>
                    <Text style={[styles.appId, { color: colors.mutedForeground }]}>#{app.id}</Text>
                    <Badge 
                      label={app.status} 
                      variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'destructive' : 'warning'} 
                    />
                  </View>
                  <Text style={[styles.appRoute, { color: colors.foreground }]}>
                    {app.sourceStation} ➔ {app.destinationStation}
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
          <Feather name={icon} size={22} color={colors.primary} />
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
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  content: {
    padding: 24,
    paddingTop: 8,
    gap: 32,
  },
  /* Premium Pass Card */
  passCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 0,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passTitle: {
    color: '#cbd5e1', // Slate 300
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'Inter_700Bold',
  },
  passBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#38bdf8', // sky-400
  },
  passPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  passDetails: {
    flex: 1,
  },
  passName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  passRoute: {
    color: '#38bdf8', // sky 400
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  passMuted: {
    color: '#94a3b8',
    fontSize: 12,
  },
  passDivider: {
    height: 1,
    marginBottom: 16,
  },
  passFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passValidityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passValidity: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  showPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)', // sky 400 with opacity
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  showPassText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  /* Standard Status Card */
  statusCard: {
    padding: 20,
    borderRadius: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBody: {
    marginBottom: 16,
  },
  statusTitleText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  statusSubtitleText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  rejectionNoticeText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusActionText: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
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
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  appCard: {
    marginBottom: 12,
    padding: 16,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appId: {
    fontSize: 13,
    fontWeight: '500',
  },
  appRoute: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  appDate: {
    fontSize: 12,
  },
});
