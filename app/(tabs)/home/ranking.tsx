import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { createPlaylistDetailHref } from '@/components/home/playlist-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import { useCachedRequest } from '@/hooks/use-cached-request';
import { rankingApi, type Toplist } from '@/services/api';

export default function RankingScreen() {
  const router = useRouter();
  const loadRankings = useCallback(() => rankingApi.getToplistDetail(), []);
  const {
    data: rankingsData,
    error: rankingsError,
    loading: rankingsLoading,
    refresh: refreshRankings,
    refreshing: rankingsRefreshing,
  } = useCachedRequest('home:rankings:toplist-detail', loadRankings);
  const rankings: Toplist[] = rankingsData?.list ?? [];

  if (rankingsLoading && rankings.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.fullScreenStatus]}>
        <ActivityIndicator color={AppTheme.colors.primary} size="large" />
        <ThemedText style={styles.muted}>正在加载榜单...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[AppTheme.colors.primary]}
            onRefresh={() => {
              void refreshRankings();
            }}
            refreshing={rankingsRefreshing}
            tintColor={AppTheme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText type="subtitle">热门榜单</ThemedText>
          <View style={styles.rankingList}>
            {rankingsError && rankings.length === 0 ? (
              <ThemedView
                lightColor={AppTheme.colors.surface}
                darkColor={AppTheme.colors.surfaceDark}
                style={styles.statusPanel}>
                <ThemedText type="defaultSemiBold">榜单加载失败</ThemedText>
                <ThemedText style={styles.muted}>{rankingsError}</ThemedText>
              </ThemedView>
            ) : null}

            {!rankingsLoading && !rankingsError && rankings.length === 0 ? (
              <ThemedView
                lightColor={AppTheme.colors.surface}
                darkColor={AppTheme.colors.surfaceDark}
                style={styles.statusPanel}>
                <ThemedText style={styles.muted}>暂无榜单数据</ThemedText>
              </ThemedView>
            ) : null}

            {rankings.length > 0
              ? rankings.map((ranking, index) => (
                  <Pressable
                    key={ranking.id}
                    accessibilityRole="button"
                    onPress={() => {
                      router.push(
                        createPlaylistDetailHref({
                          coverUrl: ranking.coverImgUrl,
                          from: '/home/ranking',
                          id: ranking.id,
                          name: ranking.name,
                        })
                      );
                    }}
                    style={({ pressed }) => [pressed && styles.pressed]}>
                    <ThemedView
                      lightColor={AppTheme.colors.background}
                      darkColor={AppTheme.colors.surfaceDark}
                      style={styles.rankingCard}>
                      {ranking.coverImgUrl ? (
                        <Image
                          contentFit="cover"
                          source={{ uri: ranking.coverImgUrl }}
                          style={styles.cover}
                        />
                      ) : (
                        <ThemedView
                          lightColor={AppTheme.colors.surfaceSoft}
                          darkColor={AppTheme.colors.surfaceSoftDark}
                          style={styles.cover}>
                          <ThemedText numberOfLines={1} style={styles.coverText}>
                            {ranking.name}
                          </ThemedText>
                        </ThemedView>
                      )}

                      <View style={styles.rankingInfo}>
                        <View style={styles.rankingHeader}>
                          <ThemedText
                            numberOfLines={1}
                            style={styles.rankingTitle}
                            type="defaultSemiBold">
                            {index + 1}. {ranking.name}
                          </ThemedText>
                          {ranking.updateFrequency ? (
                            <ThemedText style={styles.frequency}>
                              {ranking.updateFrequency}
                            </ThemedText>
                          ) : null}
                        </View>

                        <View style={styles.trackList}>
                          {ranking.tracks?.slice(0, 3).map((track, trackIndex) => (
                            <ThemedText
                              key={`${ranking.id}-${trackIndex}`}
                              numberOfLines={1}
                              style={styles.trackText}>
                              {trackIndex + 1}. {track.first}
                              {track.second ? ` - ${track.second}` : ''}
                            </ThemedText>
                          ))}
                        </View>
                      </View>
                    </ThemedView>
                  </Pressable>
                ))
              : null}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  cover: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: AppTheme.radius.md,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 92,
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  frequency: {
    color: AppTheme.colors.muted,
    fontSize: 12,
  },
  fullScreenStatus: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    gap: 10,
    marginBottom: 32,
  },
  muted: {
    color: AppTheme.colors.muted,
  },
  pressed: {
    opacity: 0.72,
  },
  rankingCard: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    elevation: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  rankingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rankingList: {
    gap: 12,
  },
  rankingInfo: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  rankingTitle: {
    flex: 1,
  },
  section: {
    gap: 14,
  },
  statusPanel: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    gap: 10,
    padding: 18,
  },
  subTitle: {
    color: AppTheme.colors.muted,
  },
  trackText: {
    color: AppTheme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  trackList: {
    gap: 4,
  },
});
