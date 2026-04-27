import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { formatFansCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import type { TopArtist } from '@/services/api';

type TopArtistsSectionProps = {
  artists: TopArtist[];
  error: string;
  loading: boolean;
};

export function TopArtistsSection({ artists, error, loading }: TopArtistsSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">热门歌手</ThemedText>

      {loading && artists.length === 0 ? (
        <HomeSectionStatus loading message="正在加载热门歌手..." />
      ) : null}

      {error && artists.length === 0 ? (
        <HomeSectionStatus message={error} title="热门歌手加载失败" />
      ) : null}

      {!loading && !error && artists.length === 0 ? (
        <HomeSectionStatus message="暂无热门歌手数据" />
      ) : null}

      {artists.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.artistRail}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroller}>
          {artists.map((artist) => {
            const imageUrl = artist.picUrl ?? artist.img1v1Url;
            const artistMeta =
              artist.alias?.[0] ||
              artist.trans ||
              (artist.musicSize ? `${artist.musicSize} 首歌曲` : '热门歌手');
            const artistStat =
              formatFansCount(artist.fansCount) ||
              (artist.albumSize ? `${artist.albumSize} 张专辑` : '');

            return (
              <ThemedView
                key={artist.id}
                lightColor={AppTheme.colors.background}
                darkColor={AppTheme.colors.surfaceDark}
                style={styles.artistCard}>
                <View style={styles.artistAvatarFrame}>
                  {imageUrl ? (
                    <Image contentFit="cover" source={{ uri: imageUrl }} style={styles.artistAvatar} />
                  ) : (
                    <ThemedView
                      lightColor={AppTheme.colors.surfaceSoft}
                      darkColor={AppTheme.colors.surfaceSoftDark}
                      style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
                      <ThemedText numberOfLines={1} style={styles.artistAvatarText}>
                        {artist.name}
                      </ThemedText>
                    </ThemedView>
                  )}
                </View>

                <ThemedText numberOfLines={1} style={styles.artistName} type="defaultSemiBold">
                  {artist.name}
                </ThemedText>
                <ThemedText numberOfLines={1} style={styles.artistMeta}>
                  {artistMeta}
                </ThemedText>
                {artistStat ? (
                  <ThemedText numberOfLines={1} style={styles.artistStat}>
                    {artistStat}
                  </ThemedText>
                ) : null}
              </ThemedView>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  artistAvatar: {
    height: '100%',
    width: '100%',
  },
  artistAvatarFrame: {
    aspectRatio: 1,
    borderRadius: AppTheme.radius.pill,
    overflow: 'hidden',
    width: 86,
  },
  artistAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistAvatarText: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  artistCard: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    elevation: 1,
    gap: 6,
    padding: 12,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: 132,
  },
  artistMeta: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  artistName: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  artistRail: {
    gap: 14,
    paddingHorizontal: 24,
  },
  artistStat: {
    color: AppTheme.colors.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  horizontalScroller: {
    marginHorizontal: -24,
  },
  section: {
    gap: 14,
  },
});
