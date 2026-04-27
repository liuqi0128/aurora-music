import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { formatPlayCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { createPlaylistDetailHref } from '@/components/home/playlist-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import { useCachedRequest } from '@/hooks/use-cached-request';
import { homeApi, type PersonalizedPlaylist } from '@/services/api';

const PLAYLIST_LIMIT = 24;

export default function PlaylistsScreen() {
  const router = useRouter();
  const loadPlaylists = useCallback(() => homeApi.getRecommendations({ limit: PLAYLIST_LIMIT }), []);
  const {
    data: playlistData,
    error: playlistError,
    loading: playlistsLoading,
    refresh: refreshPlaylists,
    refreshing: playlistsRefreshing,
  } = useCachedRequest('home:playlists:personalized', loadPlaylists);
  const playlists = useMemo<PersonalizedPlaylist[]>(
    () => playlistData?.result ?? [],
    [playlistData]
  );

  const renderPlaylist = useCallback(
    ({ item }: { item: PersonalizedPlaylist }) => {
      const trackCount = item.trackCount ?? item.trackNumber;
      const playCountText = formatPlayCount(item.playCount);
      const description =
        item.copywriter ?? (trackCount ? `${trackCount} 首歌曲` : '为你推荐的精选歌单');

      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            router.push(
              createPlaylistDetailHref({
                coverUrl: item.picUrl,
                from: '/home/playlists',
                id: item.id,
                name: item.name,
              })
            );
          }}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <ThemedView
            lightColor={AppTheme.colors.background}
            darkColor={AppTheme.colors.surfaceDark}
            style={styles.playlistCard}>
            {item.picUrl ? (
              <Image contentFit="cover" source={{ uri: item.picUrl }} style={styles.cover} />
            ) : (
              <ThemedView
                lightColor={AppTheme.colors.surfaceSoft}
                darkColor={AppTheme.colors.surfaceSoftDark}
                style={[styles.cover, styles.coverPlaceholder]}>
                <ThemedText numberOfLines={2} style={styles.coverText}>
                  {item.name}
                </ThemedText>
              </ThemedView>
            )}

            <View style={styles.playlistInfo}>
              <View style={styles.playlistHeader}>
                <ThemedText numberOfLines={2} style={styles.playlistTitle} type="defaultSemiBold">
                  {item.name}
                </ThemedText>
                {playCountText ? (
                  <ThemedText numberOfLines={1} style={styles.playCount}>
                    {playCountText}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText numberOfLines={2} style={styles.description}>
                {description}
              </ThemedText>
            </View>
          </ThemedView>
        </Pressable>
      );
    },
    [router]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={playlists}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View style={styles.statusWrap}>
            {playlistsLoading ? (
              <HomeSectionStatus loading message="正在加载歌单..." />
            ) : playlistError ? (
              <HomeSectionStatus message={playlistError} title="歌单加载失败" />
            ) : (
              <HomeSectionStatus message="暂无歌单数据" />
            )}
          </View>
        }
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title">歌单广场</ThemedText>
            <ThemedText style={styles.subTitle}>按心情、场景和风格整理灵感</ThemedText>
          </ThemedView>
        }
        refreshControl={
          <RefreshControl
            colors={[AppTheme.colors.primary]}
            onRefresh={() => {
              void refreshPlaylists();
            }}
            refreshing={playlistsRefreshing}
            tintColor={AppTheme.colors.primary}
          />
        }
        renderItem={renderPlaylist}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 12,
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
    width: 88,
  },
  coverPlaceholder: {
    paddingHorizontal: 8,
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  description: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    gap: 10,
    marginBottom: 18,
  },
  playCount: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  playlistCard: {
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
  playlistHeader: {
    gap: 4,
  },
  playlistInfo: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  playlistTitle: {
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.72,
  },
  statusWrap: {
    paddingTop: 8,
  },
  subTitle: {
    color: AppTheme.colors.muted,
  },
});
