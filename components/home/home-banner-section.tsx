import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BannerCarousel, type BannerCarouselItem } from '@/components/banner-carousel';
import { HomeSectionStatus } from '@/components/home/home-section-status';
import { AppTheme } from '@/constants/theme';
import type { Banner } from '@/services/api';

type HomeBannerSectionProps = {
  banners: Banner[];
  error: string;
  loading: boolean;
};

export function HomeBannerSection({ banners, error, loading }: HomeBannerSectionProps) {
  const bannerItems = useMemo<BannerCarouselItem[]>(
    () =>
      banners.map((banner, index) => ({
        id: `${banner.encodeId ?? banner.targetId ?? 'banner'}-${index}`,
        imageUrl: banner.pic ?? banner.imageUrl,
        title: banner.typeTitle,
      })),
    [banners]
  );

  return (
    <View style={styles.bannerSection}>
      {loading ? <HomeSectionStatus loading message="正在加载推荐..." /> : null}

      {error && banners.length === 0 ? (
        <HomeSectionStatus message={error} title="Banner 加载失败" />
      ) : null}

      {!loading && banners.length > 0 ? <BannerCarousel data={bannerItems} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerSection: {
    marginBottom: AppTheme.spacing.xxl,
  },
});
