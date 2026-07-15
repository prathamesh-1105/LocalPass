import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import { useColors } from '@/hooks/useColors';
import { useApplications } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ApplicationsScreen() {
  const colors = useColors();
  const { data: applications, isLoading, refetch } = useApplications();

  return (
    <Screen safeAreaEdges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Passes</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => router.push('/apply')}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Skeleton width={80} height={16} />
                <Skeleton width={60} height={24} borderRadius={12} />
              </View>
              <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton width={120} height={14} />
            </Card>
          ))}
        </View>
      ) : applications?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.muted }]}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No passes yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            You haven't applied for any railway concessions yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
              <Card 
                style={styles.card}
                onPress={() => router.push(`/application/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.appType, { color: colors.mutedForeground }]}>
                      {item.travelType} Pass
                    </Text>
                    <Text style={[styles.appId, { color: colors.foreground }]}>
                      #{item.id}
                    </Text>
                  </View>
                  <Badge 
                    label={item.status} 
                    variant={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'destructive' : item.status === 'Under Review' ? 'warning' : 'default'} 
                  />
                </View>
                
                <View style={[styles.routeBox, { backgroundColor: colors.muted }]}>
                  <View style={styles.routeItem}>
                    <Feather name="map-pin" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.routeText, { color: colors.foreground }]}>{item.sourceStation}</Text>
                  </View>
                  <View style={styles.routeDivider} />
                  <View style={styles.routeItem}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                    <Text style={[styles.routeText, { color: colors.foreground }]}>{item.destinationStation}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={[styles.date, { color: colors.mutedForeground }]}>
                    Submitted {new Date(item.submittedAt).toLocaleDateString()}
                  </Text>
                  <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                </View>
              </Card>
            </Animated.View>
          )}
        />
      )}
    </Screen>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    padding: 24,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appType: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  appId: {
    fontSize: 16,
    fontWeight: '700',
  },
  routeBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    marginLeft: 12,
    fontWeight: '500',
    fontSize: 15,
  },
  routeDivider: {
    height: 16,
    width: 1,
    backgroundColor: '#ccc',
    marginLeft: 7,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
  },
});
