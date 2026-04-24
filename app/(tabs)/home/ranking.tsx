import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { rankingApi, type Toplist } from '@/services/api';

export default function RankingScreen() {
  const [rankings, setRankings] = useState<Toplist[]>([]);
  const [rankingsError, setRankingsError] = useState('');
  const [rankingsLoading, setRankingsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRankings() {
      setRankingsError('');
      setRankingsLoading(true);

      try {
        const data = await rankingApi.getToplistDetail();

        if (mounted) {
          setRankings(data.list ?? []);
        }
      } catch (error) {
        if (mounted) {
          setRankingsError(error instanceof Error ? error.message : '排行榜加载失败');
        }
      } finally {
        if (mounted) {
          setRankingsLoading(false);
        }
      }
    }

    loadRankings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText type="subtitle">热门榜单</ThemedText>
          <View style={styles.rankingList}>
            {rankingsLoading ? (
              <ThemedView lightColor="#F3F6F8" darkColor="#202326" style={styles.statusPanel}>
                <ActivityIndicator color="#0a7ea4" />
                <ThemedText style={styles.muted}>正在加载榜单...</ThemedText>
              </ThemedView>
            ) : null}

            {rankingsError ? (
              <ThemedView lightColor="#F3F6F8" darkColor="#202326" style={styles.statusPanel}>
                <ThemedText type="defaultSemiBold">榜单加载失败</ThemedText>
                <ThemedText style={styles.muted}>{rankingsError}</ThemedText>
              </ThemedView>
            ) : null}

            {!rankingsLoading && !rankingsError && rankings.length === 0 ? (
              <ThemedView lightColor="#F3F6F8" darkColor="#202326" style={styles.statusPanel}>
                <ThemedText style={styles.muted}>暂无榜单数据</ThemedText>
              </ThemedView>
            ) : null}

            {!rankingsLoading && !rankingsError
              ? rankings.map((ranking, index) => (
                  <ThemedView
                    key={ranking.id}
                    lightColor="#FFFFFF"
                    darkColor="#202326"
                    style={styles.rankingCard}>
                    {ranking.coverImgUrl ? (
                      <Image
                        contentFit="cover"
                        source={{ uri: ranking.coverImgUrl }}
                        style={styles.cover}
                      />
                    ) : (
                      <ThemedView lightColor="#EEF2F6" darkColor="#2B3035" style={styles.cover}>
                        <ThemedText numberOfLines={1} style={styles.coverText}>
                          {ranking.name}
                        </ThemedText>
                      </ThemedView>
                    )}

                    <View style={styles.rankingInfo}>
                      <View style={styles.rankingHeader}>
                        <ThemedText
                          numberOfLines={1}
                          style={styles.rankingTitle}
                          type="defaultSemiBold">
                          {index + 1}. {ranking.name}
                        </ThemedText>
                        {ranking.updateFrequency ? (
                          <ThemedText style={styles.frequency}>
                            {ranking.updateFrequency}
                          </ThemedText>
                        ) : null}
                      </View>

                      <View style={styles.trackList}>
                        {ranking.tracks?.slice(0, 3).map((track, trackIndex) => (
                          <ThemedText
                            key={`${ranking.id}-${trackIndex}`}
                            numberOfLines={1}
                            style={styles.trackText}>
                            {trackIndex + 1}. {track.first}
                            {track.second ? ` - ${track.second}` : ''}
                          </ThemedText>
                        ))}
                      </View>
                    </View>
                  </ThemedView>
                ))
              : null}
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  cover: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 92,
  },
  coverText: {
    color: '#6B7280',
    fontSize: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  frequency: {
    color: '#6B7280',
    fontSize: 12,
  },
  header: {
    gap: 10,
    marginBottom: 32,
  },
  muted: {
    color: '#6B7280',
  },
  rankingCard: {
    alignItems: 'center',
    borderRadius: 8,
    elevation: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  rankingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rankingList: {
    gap: 12,
  },
  rankingInfo: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  rankingTitle: {
    flex: 1,
  },
  section: {
    gap: 14,
  },
  statusPanel: {
    alignItems: 'center',
    borderRadius: 8,
    gap: 10,
    padding: 18,
  },
  subTitle: {
    color: '#6B7280',
  },
  trackText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  trackList: {
    gap: 4,
  },
});
