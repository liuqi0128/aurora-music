import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatFansCount } from '@/components/home/formatters';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import type { TopArtist } from '@/services/api';

type TopArtistsSectionProps = {
  artists: TopArtist[];
  error: string;
  loading: boolean;
};

function createArtistDetailHref(artist: TopArtist) {
  const imageUrl = artist.picUrl ?? artist.img1v1Url;
  const params = [`id=${encodeURIComponent(String(artist.id))}`];

  params.push(`name=${encodeURIComponent(artist.name)}`);

  if (imageUrl) {
    params.push(`picUrl=${encodeURIComponent(imageUrl)}`);
  }

  if (artist.alias?.[0]) {
    params.push(`alias=${encodeURIComponent(artist.alias[0])}`);
  }

  if (artist.trans) {
    params.push(`trans=${encodeURIComponent(artist.trans)}`);
  }

  if (typeof artist.fansCount === 'number') {
    params.push(`fansCount=${encodeURIComponent(String(artist.fansCount))}`);
  }

  if (typeof artist.musicSize === 'number') {
    params.push(`musicSize=${encodeURIComponent(String(artist.musicSize))}`);
  }

  if (typeof artist.albumSize === 'number') {
    params.push(`albumSize=${encodeURIComponent(String(artist.albumSize))}`);
  }

  return `/artist-detail?${params.join('&')}` as Href;
}

export function TopArtistsSection({ artists, error, loading }: TopArtistsSectionProps) {
  const router = useRouter();

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
              <Pressable
                accessibilityLabel={`查看 ${artist.name} 的歌曲`}
                accessibilityRole="button"
                key={artist.id}
                onPress={() => {
                  router.push(createArtistDetailHref(artist));
                }}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView
                  lightColor={AppTheme.colors.background}
                  darkColor={AppTheme.colors.surfaceDark}
                  style={styles.artistCard}>
                  <View pointerEvents="none" style={styles.artistAccent} />
                  <ThemedView
                    lightColor={AppTheme.colors.background}
                    darkColor={AppTheme.colors.surfaceDark}
                    style={styles.artistAvatarRing}>
                    <View style={styles.artistAvatarFrame}>
                      {imageUrl ? (
                        <Image
                          contentFit="cover"
                          source={{ uri: imageUrl }}
                          style={styles.artistAvatar}
                        />
                      ) : (
                        <ThemedView
                          lightColor={AppTheme.colors.surfaceSoft}
                          darkColor={AppTheme.colors.surfaceSoftDark}
                          style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
                          <IconSymbol
                            color={AppTheme.colors.muted}
                            name="person.circle.fill"
                            size={34}
                          />
                          <ThemedText numberOfLines={1} style={styles.artistAvatarText}>
                            {artist.name}
                          </ThemedText>
                        </ThemedView>
                      )}
                    </View>
                  </ThemedView>

                  <View style={styles.artistInfo}>
                    <ThemedText numberOfLines={1} style={styles.artistName} type="defaultSemiBold">
                      {artist.name}
                    </ThemedText>
                    <ThemedText numberOfLines={1} style={styles.artistMeta}>
                      {artistMeta}
                    </ThemedText>
                  </View>

                  {artistStat ? (
                    <View style={styles.artistStatPill}>
                      <ThemedText numberOfLines={1} style={styles.artistStat}>
                        {artistStat}
                      </ThemedText>
                    </View>
                  ) : null}
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
  artistAccent: {
    backgroundColor: 'rgba(255, 92, 122, 0.11)',
    borderTopLeftRadius: AppTheme.radius.md,
    borderTopRightRadius: AppTheme.radius.md,
    height: 56,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  artistAvatar: {
    height: '100%',
    width: '100%',
  },
  artistAvatarFrame: {
    aspectRatio: 1,
    borderRadius: AppTheme.radius.pill,
    overflow: 'hidden',
    width: 88,
  },
  artistAvatarPlaceholder: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  artistAvatarRing: {
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: AppTheme.radius.pill,
    borderWidth: 3,
    elevation: 2,
    marginTop: 6,
    padding: 3,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  artistAvatarText: {
    color: AppTheme.colors.muted,
    fontSize: 11,
    lineHeight: 14,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  artistCard: {
    alignItems: 'center',
    borderColor: 'rgba(255, 92, 122, 0.12)',
    borderRadius: AppTheme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    gap: 8,
    minHeight: 188,
    padding: 12,
    position: 'relative',
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    width: 144,
  },
  artistInfo: {
    alignItems: 'center',
    gap: 3,
    minHeight: 39,
    width: '100%',
  },
  artistMeta: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  artistName: {
    fontSize: 15,
    lineHeight: 20,
  },
  artistRail: {
    gap: 16,
    paddingHorizontal: 24,
  },
  artistStat: {
    color: AppTheme.colors.primary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  artistStatPill: {
    backgroundColor: 'rgba(255, 92, 122, 0.13)',
    borderRadius: AppTheme.radius.pill,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  horizontalScroller: {
    marginHorizontal: -24,
  },
  pressed: {
    opacity: 0.72,
  },
  section: {
    gap: 14,
  },
});
