import { Image } from 'expo-image';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPlayCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import { useCachedRequest } from '@/hooks/use-cached-request';
import { useThemeColor } from '@/hooks/use-theme-color';
import { homeApi, type ApiId, type PlaylistDetailResponse, type PlaylistSong } from '@/services/api';

type PlaylistDetailRouteParams = {
  coverUrl?: string;
  from?: string;
  id?: string;
  name?: string;
};

const DEFAULT_RETURN_ROUTE = '/home/playlists' as Href;

function getRouteParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getSongKey(song: PlaylistSong) {
  return String(song.id);
}

function getArtistText(song: PlaylistSong) {
  const artistNames = song.ar?.map((artist) => artist.name).filter(Boolean);

  if (artistNames?.length) {
    return artistNames.join(' / ');
  }

  return song.artist || '未知歌手';
}

function getAlbumText(song: PlaylistSong) {
  return song.al?.name ?? song.album ?? '未知专辑';
}

function getSongCoverUrl(song: PlaylistSong) {
  return song.al?.picUrl ?? song.coverUrl;
}

function formatDuration(duration?: number) {
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
    return '';
  }

  const totalSeconds = Math.floor(duration > 1000 ? duration / 1000 : duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function getOrderedSongs(songs: PlaylistSong[], trackIds: ApiId[]) {
  if (trackIds.length === 0 || songs.length === 0) {
    return songs;
  }

  const songsById = new Map(songs.map((song) => [getSongKey(song), song]));
  const orderedSongs = trackIds
    .map((id) => songsById.get(String(id)))
    .filter((song): song is PlaylistSong => Boolean(song));
  const orderedSongIds = new Set(orderedSongs.map(getSongKey));
  const remainingSongs = songs.filter((song) => !orderedSongIds.has(getSongKey(song)));

  return [...orderedSongs, ...remainingSongs];
}

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<PlaylistDetailRouteParams>();
  const playlistId = getRouteParam(params.id);
  const routeName = getRouteParam(params.name);
  const routeCoverUrl = getRouteParam(params.coverUrl);
  const returnPath = getRouteParam(params.from);
  const textColor = useThemeColor({}, 'text');

  const handleBack = useCallback(() => {
    router.replace((returnPath || DEFAULT_RETURN_ROUTE) as Href);
  }, [returnPath, router]);

  const loadPlaylistDetail = useCallback(async (): Promise<PlaylistDetailResponse> => {
    if (!playlistId) {
      return { code: 400 };
    }

    return homeApi.getPlaylistDetail({ id: playlistId });
  }, [playlistId]);

  const {
    data: playlistData,
    error: playlistError,
    loading: playlistLoading,
    refresh: refreshPlaylist,
    refreshing: playlistRefreshing,
  } = useCachedRequest(`playlist:detail:${playlistId ?? 'missing'}`, loadPlaylistDetail, {
    enabled: Boolean(playlistId),
  });

  const playlist = playlistData?.playlist;
  const trackIds = useMemo(
    () =>
      playlist?.trackIds
        ?.map((track) => track.id)
        .filter((id): id is ApiId => id !== undefined && id !== null) ?? [],
    [playlist?.trackIds]
  );
  const trackIdsSignature = useMemo(() => trackIds.map(String).join(','), [trackIds]);
  const playlistTracks = useMemo(() => playlist?.tracks ?? [], [playlist?.tracks]);
  const shouldLoadSongDetails = trackIds.length > 0 && playlistTracks.length < trackIds.length;

  const loadSongDetails = useCallback(() => homeApi.getSongDetails(trackIds), [trackIds]);
  const {
    data: songData,
    error: songError,
    loading: songsLoading,
    refresh: refreshSongs,
    refreshing: songsRefreshing,
  } = useCachedRequest(`playlist:songs:${playlistId ?? 'missing'}:${trackIdsSignature}`, loadSongDetails, {
    enabled: shouldLoadSongDetails,
  });

  const songs = useMemo(() => {
    const sourceSongs = songData?.songs?.length ? songData.songs : playlistTracks;

    return getOrderedSongs(sourceSongs, trackIds);
  }, [playlistTracks, songData?.songs, trackIds]);

  const refreshPage = useCallback(() => {
    void refreshPlaylist();

    if (shouldLoadSongDetails) {
      void refreshSongs();
    }
  }, [refreshPlaylist, refreshSongs, shouldLoadSongDetails]);

  const playlistName = playlist?.name ?? routeName ?? '歌单详情';
  const coverUrl = playlist?.coverImgUrl ?? playlist?.coverUrl ?? routeCoverUrl;
  const playCountText = formatPlayCount(playlist?.playCount);
  const trackCount = playlist?.trackCount ?? (trackIds.length || songs.length);
  const creatorName = playlist?.creator?.nickname;
  const refreshing = playlistRefreshing || songsRefreshing;

  const renderSong = useCallback(({ item, index }: ListRenderItemInfo<PlaylistSong>) => {
    const songCoverUrl = getSongCoverUrl(item);
    const duration = formatDuration(item.dt ?? item.duration);

    return (
      <View style={styles.songRow}>
        <View style={styles.songIndex}>
          <ThemedText style={styles.indexText}>{index + 1}</ThemedText>
        </View>

        {songCoverUrl ? (
          <Image contentFit="cover" source={{ uri: songCoverUrl }} style={styles.songCover} />
        ) : (
          <ThemedView
            lightColor={AppTheme.colors.surfaceSoft}
            darkColor={AppTheme.colors.surfaceSoftDark}
            style={styles.songCover}>
            <ThemedText numberOfLines={1} style={styles.songCoverText}>
              {item.name.slice(0, 1)}
            </ThemedText>
          </ThemedView>
        )}

        <View style={styles.songInfo}>
          <ThemedText numberOfLines={1} style={styles.songTitle} type="defaultSemiBold">
            {item.name}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.songMeta}>
            {getArtistText(item)} · {getAlbumText(item)}
          </ThemedText>
        </View>

        {duration ? <ThemedText style={styles.duration}>{duration}</ThemedText> : null}
      </View>
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.pageHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol color={textColor} name="chevron.left" size={26} />
        </Pressable>
        <ThemedText numberOfLines={1} style={styles.pageTitle} type="subtitle">
          歌单详情
        </ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <FlatList
        contentContainerStyle={styles.content}
        data={songs}
        keyExtractor={(item, index) => `${getSongKey(item)}-${index}`}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!playlistId ? (
              <HomeSectionStatus message="缺少歌单 ID" title="无法打开歌单" />
            ) : playlistLoading ? (
              <HomeSectionStatus loading message="正在加载歌单详情..." />
            ) : playlistError && !playlist ? (
              <HomeSectionStatus message={playlistError} title="歌单加载失败" />
            ) : songsLoading ? (
              <HomeSectionStatus loading message="正在加载歌曲..." />
            ) : songError ? (
              <HomeSectionStatus message={songError} title="歌曲加载失败" />
            ) : (
              <HomeSectionStatus message="暂无歌曲数据" />
            )}
          </View>
        }
        ListFooterComponent={
          songs.length > 0 ? (
            <View style={styles.footer}>
              {songsLoading && shouldLoadSongDetails ? (
                <HomeSectionStatus loading message="正在补全歌曲列表..." />
              ) : null}

              {songError && songs.length > 0 ? (
                <HomeSectionStatus message={songError} title="部分歌曲加载失败" />
              ) : null}
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.hero}>
              {coverUrl ? (
                <Image contentFit="cover" source={{ uri: coverUrl }} style={styles.cover} />
              ) : (
                <ThemedView
                  lightColor={AppTheme.colors.surfaceSoft}
                  darkColor={AppTheme.colors.surfaceSoftDark}
                  style={[styles.cover, styles.coverPlaceholder]}>
                  {playlistLoading ? (
                    <ActivityIndicator color={AppTheme.colors.primary} />
                  ) : (
                    <ThemedText numberOfLines={2} style={styles.coverText}>
                      {playlistName}
                    </ThemedText>
                  )}
                </ThemedView>
              )}

              <View style={styles.heroInfo}>
                <ThemedText numberOfLines={2} style={styles.heroTitle} type="subtitle">
                  {playlistName}
                </ThemedText>
                {creatorName ? (
                  <ThemedText numberOfLines={1} style={styles.heroMeta}>
                    {creatorName}
                  </ThemedText>
                ) : null}
                <View style={styles.badges}>
                  {trackCount ? (
                    <ThemedView
                      lightColor={AppTheme.colors.primaryLight}
                      darkColor={AppTheme.colors.surfaceDark}
                      style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{trackCount} 首</ThemedText>
                    </ThemedView>
                  ) : null}
                  {playCountText ? (
                    <ThemedView
                      lightColor={AppTheme.colors.surface}
                      darkColor={AppTheme.colors.surfaceDark}
                      style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{playCountText}</ThemedText>
                    </ThemedView>
                  ) : null}
                </View>
                {playlist?.description ? (
                  <ThemedText numberOfLines={2} style={styles.description}>
                    {playlist.description}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <ThemedText type="subtitle">歌曲列表</ThemedText>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[AppTheme.colors.primary]}
            enabled={Boolean(playlistId)}
            onRefresh={refreshPage}
            refreshing={refreshing}
            tintColor={AppTheme.colors.primary}
          />
        }
        renderItem={renderSong}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: AppTheme.colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 30,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  cover: {
    borderRadius: AppTheme.radius.md,
    height: 112,
    overflow: 'hidden',
    width: 112,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 14,
    lineHeight: 18,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  description: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContainer: {
    paddingVertical: 12,
  },
  footer: {
    gap: 12,
    paddingTop: 4,
  },
  header: {
    gap: 20,
    marginBottom: 2,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerSpacer: {
    width: 42,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  heroInfo: {
    flex: 1,
    gap: 9,
    minWidth: 0,
  },
  heroMeta: {
    color: AppTheme.colors.muted,
    fontSize: 14,
    lineHeight: 18,
  },
  heroTitle: {
    lineHeight: 25,
  },
  indexText: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  songCover: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.sm,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  songCoverText: {
    color: AppTheme.colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  songIndex: {
    alignItems: 'center',
    width: 28,
  },
  songInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  songMeta: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  songRow: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    gap: 10,
    minHeight: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  songTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
});
