import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatPlayCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { createPlaylistDetailHref } from '@/components/home/playlist-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import type { PersonalizedPlaylist } from '@/services/api';

type RecommendedPlaylistsSectionProps = {
  error: string;
  loading: boolean;
  playlists: PersonalizedPlaylist[];
};

export function RecommendedPlaylistsSection({
  error,
  loading,
  playlists,
}: RecommendedPlaylistsSectionProps) {
  const router = useRouter();

  return (
    <View style={[styles.section, styles.sectionSpacing]}>
      <ThemedText type="subtitle">推荐歌单</ThemedText>

      {loading && playlists.length === 0 ? (
        <HomeSectionStatus loading message="正在加载推荐歌单..." />
      ) : null}

      {error && playlists.length === 0 ? (
        <HomeSectionStatus message={error} title="推荐歌单加载失败" />
      ) : null}

      {!loading && !error && playlists.length === 0 ? (
        <HomeSectionStatus message="暂无推荐歌单数据" />
      ) : null}

      {playlists.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.playlistRail}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroller}>
          {playlists.map((playlist) => {
            const trackCount = playlist.trackCount ?? playlist.trackNumber;
            const description =
              playlist.copywriter ?? (trackCount ? `${trackCount} 首歌曲` : '为你推荐的精选歌单');
            const playCountText = formatPlayCount(playlist.playCount);

            return (
              <Pressable
                accessibilityRole="button"
                key={playlist.id}
                onPress={() => {
                  router.push(
                    createPlaylistDetailHref({
                      coverUrl: playlist.picUrl,
                      from: '/home',
                      id: playlist.id,
                      name: playlist.name,
                    })
                  );
                }}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView
                  lightColor={AppTheme.colors.background}
                  darkColor={AppTheme.colors.surfaceDark}
                  style={styles.playlistCard}>
                  <View style={styles.coverFrame}>
                    {playlist.picUrl ? (
                      <Image
                        contentFit="cover"
                        source={{ uri: playlist.picUrl }}
                        style={styles.coverImage}
                      />
                    ) : (
                      <ThemedView
                        lightColor={AppTheme.colors.surfaceSoft}
                        darkColor={AppTheme.colors.surfaceSoftDark}
                        style={[styles.coverImage, styles.coverPlaceholder]}>
                        <ThemedText numberOfLines={2} style={styles.coverText}>
                          {playlist.name}
                        </ThemedText>
                      </ThemedView>
                    )}

                    {playCountText ? (
                      <View style={styles.playCountBadge}>
                        <ThemedText style={styles.playCountText}>{playCountText}</ThemedText>
                      </View>
                    ) : null}
                  </View>

                  <ThemedText
                    numberOfLines={2}
                    style={styles.playlistTitle}
                    type="defaultSemiBold">
                    {playlist.name}
                  </ThemedText>
                  <ThemedText numberOfLines={2} style={styles.playlistDescription}>
                    {description}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  coverFrame: {
    aspectRatio: 1,
    borderRadius: AppTheme.radius.md,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  horizontalScroller: {
    marginHorizontal: -24,
  },
  playCountBadge: {
    backgroundColor: AppTheme.colors.badgeOverlay,
    borderRadius: AppTheme.radius.pill,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
  },
  playCountText: {
    color: AppTheme.colors.textInverted,
    fontSize: 11,
    lineHeight: 14,
  },
  playlistCard: {
    borderRadius: AppTheme.radius.md,
    elevation: 1,
    gap: 8,
    padding: 10,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: 152,
  },
  playlistDescription: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  playlistRail: {
    gap: 14,
    paddingHorizontal: 24,
  },
  playlistTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
  section: {
    gap: 14,
  },
  sectionSpacing: {
    marginBottom: AppTheme.spacing.xxl,
  },
});
