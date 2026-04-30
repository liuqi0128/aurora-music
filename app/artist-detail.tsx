import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { formatFansCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { isPreviewSong } from '@/components/player/playback-flags';
import {
  useMusicPlayer,
  type MusicPlayerTrack,
} from '@/components/player/music-player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import { useCachedRequest } from '@/hooks/use-cached-request';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  homeApi,
  type ArtistTopSongsResponse,
  type PlaylistSong,
} from '@/services/api';

type ArtistDetailRouteParams = {
  albumSize?: string;
  alias?: string;
  fansCount?: string;
  id?: string;
  musicSize?: string;
  name?: string;
  picUrl?: string;
  trans?: string;
};

function getRouteParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumberParam(value?: string) {
  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
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

function getPlayerTrack(song: PlaylistSong): MusicPlayerTrack {
  return {
    album: getAlbumText(song),
    artist: getArtistText(song),
    coverUrl: getSongCoverUrl(song),
    duration: song.dt ?? song.duration,
    id: song.id,
    isPreview: isPreviewSong(song),
    name: song.name,
  };
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

export default function ArtistDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ArtistDetailRouteParams>();
  const artistId = getRouteParam(params.id);
  const artistName = getRouteParam(params.name) ?? '歌手详情';
  const artistPicUrl = getRouteParam(params.picUrl);
  const alias = getRouteParam(params.alias);
  const trans = getRouteParam(params.trans);
  const fansCount = getNumberParam(getRouteParam(params.fansCount));
  const musicSize = getNumberParam(getRouteParam(params.musicSize));
  const albumSize = getNumberParam(getRouteParam(params.albumSize));
  const textColor = useThemeColor({}, 'text');
  const {
    currentTrack,
    error: playbackError,
    isCurrentTrack,
    loadingTrackId,
    playTrack,
  } = useMusicPlayer();

  const loadArtistSongs = useCallback(async (): Promise<ArtistTopSongsResponse> => {
    if (!artistId) {
      return { code: 400, songs: [] };
    }

    return homeApi.getArtistTopSongs({ id: artistId });
  }, [artistId]);

  const {
    data: artistSongsData,
    error: artistSongsError,
    loading: artistSongsLoading,
    refresh: refreshArtistSongs,
    refreshing: artistSongsRefreshing,
  } = useCachedRequest(`artist:top-songs:${artistId ?? 'missing'}`, loadArtistSongs, {
    enabled: Boolean(artistId),
  });

  const songs = useMemo(() => artistSongsData?.songs ?? [], [artistSongsData?.songs]);
  const artistSubTitle = alias || trans || (musicSize ? `${musicSize} 首歌曲` : '热门歌手');
  const stats = useMemo(
    () =>
      [
        formatFansCount(fansCount),
        typeof musicSize === 'number' ? `${musicSize} 首歌曲` : '',
        typeof albumSize === 'number' ? `${albumSize} 张专辑` : '',
      ].filter(Boolean),
    [albumSize, fansCount, musicSize]
  );

  const handleSongPress = useCallback(
    (song: PlaylistSong) => {
      void playTrack(getPlayerTrack(song));
    },
    [playTrack]
  );

  const renderSong = useCallback(
    ({ item, index }: ListRenderItemInfo<PlaylistSong>) => {
      const songCoverUrl = getSongCoverUrl(item);
      const duration = formatDuration(item.dt ?? item.duration);
      const songId = getSongKey(item);
      const isActive = isCurrentTrack(item.id);
      const isLoading = loadingTrackId === songId;
      const isPreview = isPreviewSong(item);

      return (
        <Pressable
          accessibilityLabel={`${isActive ? '切换播放' : '播放'} ${item.name}`}
          accessibilityRole="button"
          onPress={() => {
            handleSongPress(item);
          }}
          style={({ pressed }) => [
            styles.songRow,
            isActive && styles.songRowActive,
            pressed && styles.pressed,
          ]}>
          <View style={styles.songIndex}>
            <ThemedText style={[styles.indexText, isActive && styles.activeText]}>
              {index + 1}
            </ThemedText>
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
            <View style={styles.songTitleRow}>
              <ThemedText
                numberOfLines={1}
                style={[styles.songTitle, isActive && styles.activeText]}
                type="defaultSemiBold">
                {item.name}
              </ThemedText>
              {isPreview ? (
                <ThemedView
                  lightColor={AppTheme.colors.primaryLight}
                  darkColor={AppTheme.colors.surfaceSoftDark}
                  style={styles.previewBadge}>
                  <IconSymbol color={AppTheme.colors.primaryDark} name="headphones" size={11} />
                  <ThemedText style={styles.previewBadgeText}>试听</ThemedText>
                </ThemedView>
              ) : null}
            </View>
            <ThemedText numberOfLines={1} style={styles.songMeta}>
              {getAlbumText(item)}
            </ThemedText>
          </View>

          <View style={styles.songTrailing}>
            {isLoading ? (
              <ActivityIndicator color={AppTheme.colors.primary} size="small" />
            ) : duration ? (
              <ThemedText style={styles.duration}>{duration}</ThemedText>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [handleSongPress, isCurrentTrack, loadingTrackId]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.pageHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          onPress={() => {
            router.back();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol color={textColor} name="chevron.left" size={26} />
        </Pressable>
        <ThemedText numberOfLines={1} style={styles.pageTitle} type="subtitle">
          歌手详情
        </ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <FlatList
        contentContainerStyle={[styles.content, currentTrack && styles.contentWithPlayer]}
        data={songs}
        keyExtractor={(item, index) => `${getSongKey(item)}-${index}`}
        ListEmptyComponent={
          <View style={styles.statusWrap}>
            {!artistId ? (
              <HomeSectionStatus message="缺少歌手 ID" title="无法打开歌手详情" />
            ) : artistSongsLoading ? (
              <HomeSectionStatus loading message="正在加载热门歌曲..." />
            ) : artistSongsError ? (
              <HomeSectionStatus message={artistSongsError} title="热门歌曲加载失败" />
            ) : (
              <HomeSectionStatus message="暂无热门歌曲数据" />
            )}
          </View>
        }
        ListFooterComponent={
          songs.length > 0 && (artistSongsError || playbackError) ? (
            <View style={styles.footer}>
              {artistSongsError ? (
                <HomeSectionStatus message={artistSongsError} title="热门歌曲加载失败" />
              ) : null}
              {playbackError ? (
                <HomeSectionStatus message={playbackError} title="播放失败" />
              ) : null}
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.hero}>
              {artistPicUrl ? (
                <Image contentFit="cover" source={{ uri: artistPicUrl }} style={styles.artistAvatar} />
              ) : (
                <ThemedView
                  lightColor={AppTheme.colors.surfaceSoft}
                  darkColor={AppTheme.colors.surfaceSoftDark}
                  style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
                  <ThemedText numberOfLines={2} style={styles.artistAvatarText}>
                    {artistName}
                  </ThemedText>
                </ThemedView>
              )}

              <View style={styles.heroInfo}>
                <ThemedText numberOfLines={2} style={styles.artistName} type="subtitle">
                  {artistName}
                </ThemedText>
                <ThemedText numberOfLines={1} style={styles.artistSubTitle}>
                  {artistSubTitle}
                </ThemedText>
                {stats.length > 0 ? (
                  <View style={styles.stats}>
                    {stats.map((stat) => (
                      <ThemedView
                        key={stat}
                        lightColor={AppTheme.colors.surface}
                        darkColor={AppTheme.colors.surfaceDark}
                        style={styles.statBadge}>
                        <ThemedText style={styles.statText}>{stat}</ThemedText>
                      </ThemedView>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <ThemedText type="subtitle">热门歌曲</ThemedText>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[AppTheme.colors.primary]}
            enabled={Boolean(artistId)}
            onRefresh={() => {
              void refreshArtistSongs();
            }}
            refreshing={artistSongsRefreshing}
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
  activeText: {
    color: AppTheme.colors.primary,
  },
  artistAvatar: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.pill,
    height: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 112,
  },
  artistAvatarPlaceholder: {
    paddingHorizontal: 10,
  },
  artistAvatarText: {
    color: AppTheme.colors.muted,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  artistName: {
    lineHeight: 25,
  },
  artistSubTitle: {
    color: AppTheme.colors.muted,
    fontSize: 14,
    lineHeight: 18,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: 8,
    paddingBottom: 30,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  contentWithPlayer: {
    paddingBottom: 148,
  },
  duration: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    gap: 12,
    paddingTop: 4,
  },
  header: {
    gap: 20,
    marginBottom: 2,
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
  previewBadge: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.sm,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  previewBadgeText: {
    color: AppTheme.colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
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
  songRowActive: {
    backgroundColor: 'rgba(255, 92, 122, 0.1)',
  },
  songTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  songTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  songTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 28,
    width: 46,
  },
  statBadge: {
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statText: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusWrap: {
    paddingVertical: 12,
  },
});
