import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatPlayCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { createPlaylistDetailHref } from '@/components/home/playlist-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
                accessibilityLabel={`查看 ${playlist.name} 歌单`}
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
                  darkColor={AppTheme.colors.background}
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
                        <IconSymbol
                          color={AppTheme.colors.textInverted}
                          name="headphones"
                          size={12}
                        />
                        <ThemedText style={styles.playCountText}>{playCountText}</ThemedText>
                      </View>
                    ) : null}

                    <View style={styles.coverDescription}>
                      <ThemedText
                        ellipsizeMode="tail"
                        numberOfLines={2}
                        style={styles.coverDescriptionText}>
                        {description}
                      </ThemedText>
                    </View>

                    <View pointerEvents="none" style={styles.coverBorder} />
                  </View>

                  <View style={styles.playlistInfo}>
                    <ThemedText
                      darkColor={AppTheme.colors.text}
                      lightColor={AppTheme.colors.text}
                      numberOfLines={2}
                      style={styles.playlistTitle}
                      type="defaultSemiBold">
                      {playlist.name}
                    </ThemedText>
                  </View>
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
  coverBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: AppTheme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  coverDescription: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    bottom: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'absolute',
    right: 0,
  },
  coverDescriptionText: {
    color: AppTheme.colors.textInverted,
    fontSize: 11,
    lineHeight: 15,
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
    backgroundColor: AppTheme.colors.background,
    marginHorizontal: -24,
  },
  playCountBadge: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.badgeOverlay,
    borderRadius: AppTheme.radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    position: 'absolute',
    left: 9,
    top: 9,
  },
  playCountText: {
    color: AppTheme.colors.textInverted,
    fontSize: 11,
    lineHeight: 14,
  },
  playlistCard: {
    backgroundColor: AppTheme.colors.background,
    borderColor: 'rgba(255, 92, 122, 0.12)',
    borderRadius: AppTheme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    gap: 10,
    minHeight: 218,
    padding: 10,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    width: 164,
  },
  playlistInfo: {
    gap: 6,
  },
  playlistRail: {
    gap: 16,
    paddingHorizontal: 24,
  },
  playlistTitle: {
    fontSize: 15,
    lineHeight: 20,
    minHeight: 40,
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
