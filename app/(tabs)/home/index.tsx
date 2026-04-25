import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { BannerCarousel, type BannerCarouselItem } from '@/components/banner-carousel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import { homeApi, type Banner, type BannerType } from '@/services/api';

export default function RecommendScreen() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerError, setBannerError] = useState('');
  const [bannerLoading, setBannerLoading] = useState(false);

  const bannerType = useMemo<BannerType>(() => {
    if (Platform.OS === 'web') {
      return 0;
    }
    if (Platform.OS === 'ios') {
      return 2;
    }
    return 1;
  }, []);

  const bannerItems = useMemo<BannerCarouselItem[]>(
    () =>
      banners.map((banner, index) => ({
        id: `${banner.encodeId ?? banner.targetId ?? 'banner'}-${index}`,
        imageUrl: banner.pic ?? banner.imageUrl,
        title: banner.typeTitle,
      })),
    [banners]
  );

  useEffect(() => {
    let mounted = true;

    async function loadBanners() {
      setBannerError('');
      setBannerLoading(true);

      try {
        const data = await homeApi.getBanners(bannerType);

        if (mounted) {
          setBanners(data.banners ?? []);
        }
      } catch (error) {
        if (mounted) {
          setBannerError(error instanceof Error ? error.message : 'Banner 加载失败');
        }
      } finally {
        if (mounted) {
          setBannerLoading(false);
        }
      }
    }

    loadBanners();

    return () => {
      mounted = false;
    };
  }, [bannerType]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerSection}>
          {bannerLoading ? (
            <ThemedView
              lightColor={AppTheme.colors.surface}
              darkColor={AppTheme.colors.surfaceDark}
              style={styles.bannerStatus}>
              <ActivityIndicator color={AppTheme.colors.primary} />
              <ThemedText style={styles.muted}>正在加载推荐...</ThemedText>
            </ThemedView>
          ) : null}

          {bannerError ? (
            <ThemedView
              lightColor={AppTheme.colors.surface}
              darkColor={AppTheme.colors.surfaceDark}
              style={styles.bannerStatus}>
              <ThemedText type="defaultSemiBold">Banner 加载失败</ThemedText>
              <ThemedText style={styles.muted}>{bannerError}</ThemedText>
            </ThemedView>
          ) : null}

          {!bannerLoading && !bannerError && banners.length > 0 ? (
            <BannerCarousel data={bannerItems} />
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">推荐歌单</ThemedText>
          <ThemedView
            lightColor={AppTheme.colors.surface}
            darkColor={AppTheme.colors.surfaceDark}
            style={styles.panel}>
            <ThemedText type="defaultSemiBold">Aurora Daily Mix</ThemedText>
            <ThemedText style={styles.muted}>为你整理的精选旋律</ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bannerSection: {
    marginBottom: 28,
  },
  bannerStatus: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    gap: 10,
    minHeight: 120,
    padding: 18,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  muted: {
    color: AppTheme.colors.muted,
  },
  panel: {
    borderRadius: AppTheme.radius.md,
    gap: 8,
    padding: 18,
  },
  section: {
    gap: 14,
  },
});
