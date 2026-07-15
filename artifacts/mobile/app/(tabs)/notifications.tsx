import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { Skeleton } from '@/components/Skeleton';

export default function NotificationsScreen() {
  const colors = useColors();
  const { data: notifications, isLoading, refetch } = useNotifications();

  const getIconForCategory = (category: string) => {
    switch(category) {
      case 'Application': return 'file-text';
      case 'Action Required': return 'alert-circle';
      case 'Reminder': return 'clock';
      default: return 'bell';
    }
  };

  const getColorForCategory = (category: string) => {
    switch(category) {
      case 'Application': return colors.primary;
      case 'Action Required': return colors.destructive;
      case 'Reminder': return colors.warning;
      default: return colors.mutedForeground;
    }
  };

  return (
    <Screen safeAreaEdges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={styles.mockNotif}>
              <Skeleton width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
                <Skeleton width="40%" height={14} />
              </View>
            </View>
          ))}
        </View>
      ) : notifications?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            You don't have any new notifications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInLeft.delay(index * 100)}>
              <Pressable 
                style={({ pressed }) => [
                  styles.notificationItem,
                  !item.isRead && { backgroundColor: colors.primary + '08' },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: getColorForCategory(item.category) + '15' }]}>
                  <Feather name={getIconForCategory(item.category)} size={20} color={getColorForCategory(item.category)} />
                </View>
                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.foreground }, !item.isRead && styles.titleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.message, { color: colors.mutedForeground }]}>
                    {item.message}
                  </Text>
                </View>
                {!item.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </Screen>
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
  loadingContainer: {
    padding: 24,
  },
  mockNotif: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
  },
  list: {
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    marginTop: 6,
  },
});
