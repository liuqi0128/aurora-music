import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeSectionStatus } from '@/components/home/home-section-status';
import {
  useMusicPlayer,
  type MusicPlayerTrack,
} from '@/components/player/music-player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

function formatDuration(duration?: number) {
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
    return '';
  }

  const totalSeconds = Math.floor(duration > 1000 ? duration / 1000 : duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function getTrackMeta(track: MusicPlayerTrack) {
  if (track.artist && track.album) {
    return `${track.artist} · ${track.album}`;
  }

  return track.artist ?? track.album ?? '未知歌曲信息';
}

export default function RecentPlaysScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const {
    clearRecentTracks,
    currentTrack,
    isCurrentTrack,
    loadingTrackId,
    playTrack,
    recentTracks,
  } = useMusicPlayer();

  const renderTrack = useCallback(
    ({ item, index }: ListRenderItemInfo<MusicPlayerTrack>) => {
      const isActive = isCurrentTrack(item.id);
      const isLoading = loadingTrackId === String(item.id);
      const duration = formatDuration(item.duration);

      return (
        <Pressable
          accessibilityLabel={`${isActive ? '切换播放' : '播放'} ${item.name}`}
          accessibilityRole="button"
          onPress={() => {
            void playTrack(item);
          }}
          style={({ pressed }) => [
            styles.trackRow,
            isActive && styles.trackRowActive,
            pressed && styles.pressed,
          ]}>
          <View style={styles.trackIndex}>
            <ThemedText style={[styles.indexText, isActive && styles.activeText]}>
              {index + 1}
            </ThemedText>
          </View>

          {item.coverUrl ? (
            <Image contentFit="cover" source={{ uri: item.coverUrl }} style={styles.cover} />
          ) : (
            <ThemedView
              lightColor={AppTheme.colors.surfaceSoft}
              darkColor={AppTheme.colors.surfaceSoftDark}
              style={styles.cover}>
              <ThemedText numberOfLines={1} style={styles.coverText}>
                {item.name.slice(0, 1)}
              </ThemedText>
            </ThemedView>
          )}

          <View style={styles.trackInfo}>
            <View style={styles.trackTitleRow}>
              <ThemedText
                numberOfLines={1}
                style={[styles.trackTitle, isActive && styles.activeText]}
                type="defaultSemiBold">
                {item.name}
              </ThemedText>
              {item.isPreview ? (
                <ThemedView
                  lightColor={AppTheme.colors.primaryLight}
                  darkColor={AppTheme.colors.surfaceSoftDark}
                  style={styles.previewBadge}>
                  <IconSymbol color={AppTheme.colors.primaryDark} name="headphones" size={11} />
                  <ThemedText style={styles.previewBadgeText}>试听</ThemedText>
                </ThemedView>
              ) : null}
            </View>
            <ThemedText numberOfLines={1} style={styles.trackMeta}>
              {getTrackMeta(item)}
            </ThemedText>
          </View>

          <View style={styles.trailing}>
            {isLoading ? (
              <ActivityIndicator color={AppTheme.colors.primary} size="small" />
            ) : duration ? (
              <ThemedText style={styles.duration}>{duration}</ThemedText>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [isCurrentTrack, loadingTrackId, playTrack]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="返回"
          accessibilityRole="button"
          onPress={() => {
            router.back();
          }}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <IconSymbol color={textColor} name="chevron.left" size={26} />
        </Pressable>

        <ThemedText numberOfLines={1} style={styles.headerTitle} type="subtitle">
          最近播放
        </ThemedText>

        {recentTracks.length > 0 ? (
          <Pressable
            accessibilityLabel="清空最近播放"
            accessibilityRole="button"
            onPress={clearRecentTracks}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
            <ThemedText style={styles.clearText}>清空</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
      </ThemedView>

      <FlatList
        contentContainerStyle={[
          styles.content,
          currentTrack && styles.contentWithPlayer,
          recentTracks.length === 0 && styles.emptyContent,
        ]}
        data={recentTracks}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <HomeSectionStatus message="播放过的歌曲会显示在这里" title="暂无最近播放" />
        }
        renderItem={renderTrack}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  activeText: {
    color: AppTheme.colors.primary,
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: 8,
  },
  clearText: {
    color: AppTheme.colors.primary,
    fontSize: 14,
    lineHeight: 18,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: 8,
    paddingBottom: 30,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  contentWithPlayer: {
    paddingBottom: 138,
  },
  cover: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.sm,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  duration: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  indexText: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
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
  trackIndex: {
    alignItems: 'center',
    width: 28,
  },
  trackInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  trackMeta: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  trackRow: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    gap: 10,
    minHeight: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  trackRowActive: {
    backgroundColor: 'rgba(255, 92, 122, 0.1)',
  },
  trackTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  trackTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 28,
    width: 46,
  },
});
