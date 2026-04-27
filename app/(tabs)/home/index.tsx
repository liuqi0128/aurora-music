import { useCallback, useMemo } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { HomeBannerSection } from '@/components/home/home-banner-section';
import { RecommendedPlaylistsSection } from '@/components/home/recommended-playlists-section';
import { TopArtistsSection } from '@/components/home/top-artists-section';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';
import { useCachedRequest } from '@/hooks/use-cached-request';
import {
  homeApi,
  type Banner,
  type BannerType,
  type PersonalizedPlaylist,
  type TopArtist,
} from '@/services/api';

const RECOMMENDATION_LIMIT = 6;
const TOP_ARTIST_LIMIT = 8;

export default function RecommendScreen() {
  const bannerType = useMemo<BannerType>(() => {
    if (Platform.OS === 'web') {
      return 0;
    }
    if (Platform.OS === 'ios') {
      return 2;
    }
    return 1;
  }, []);

  const loadBanners = useCallback(() => homeApi.getBanners(bannerType), [bannerType]);
  const {
    data: bannerData,
    error: bannerError,
    loading: bannerLoading,
    refresh: refreshBanners,
    refreshing: bannersRefreshing,
  } = useCachedRequest(`home:banners:${bannerType}`, loadBanners);
  const banners = useMemo<Banner[]>(() => bannerData?.banners ?? [], [bannerData]);

  const loadRecommendations = useCallback(
    () => homeApi.getRecommendations({ limit: RECOMMENDATION_LIMIT }),
    []
  );
  const {
    data: recommendationData,
    error: recommendationError,
    loading: recommendationsLoading,
    refresh: refreshRecommendations,
    refreshing: recommendationsRefreshing,
  } = useCachedRequest('home:recommendations:personalized', loadRecommendations);
  const recommendations = useMemo<PersonalizedPlaylist[]>(
    () => recommendationData?.result ?? [],
    [recommendationData]
  );

  const loadTopArtists = useCallback(
    () => homeApi.getTopArtists({ limit: TOP_ARTIST_LIMIT, offset: 0 }),
    []
  );
  const {
    data: topArtistsData,
    error: topArtistsError,
    loading: topArtistsLoading,
    refresh: refreshTopArtists,
    refreshing: topArtistsRefreshing,
  } = useCachedRequest('home:artists:top', loadTopArtists);
  const topArtists = useMemo<TopArtist[]>(() => topArtistsData?.artists ?? [], [topArtistsData]);

  const refreshing = bannersRefreshing || recommendationsRefreshing || topArtistsRefreshing;
  const refreshHome = useCallback(() => {
    void Promise.all([refreshBanners(), refreshRecommendations(), refreshTopArtists()]);
  }, [refreshBanners, refreshRecommendations, refreshTopArtists]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[AppTheme.colors.primary]}
            onRefresh={refreshHome}
            refreshing={refreshing}
            tintColor={AppTheme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        <HomeBannerSection banners={banners} error={bannerError} loading={bannerLoading} />
        <RecommendedPlaylistsSection
          error={recommendationError}
          loading={recommendationsLoading}
          playlists={recommendations}
        />
        <TopArtistsSection
          artists={topArtists}
          error={topArtistsError}
          loading={topArtistsLoading}
        />
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
    paddingHorizontal: 24,
    paddingTop: 28,
  },
});
