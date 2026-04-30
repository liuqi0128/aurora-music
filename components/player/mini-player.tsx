import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

import { useMusicPlayer } from './music-player-context';

const PLAYER_SIDE_OFFSET = 12;
const PROGRESS_THUMB_SIZE = 10;
const ACCESSIBILITY_SEEK_STEP = 15;

function getDurationSeconds(duration?: number) {
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return duration > 1000 ? duration / 1000 : duration;
}

function formatPlayerTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = `${totalSeconds % 60}`.padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

export function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const mutedColor = useThemeColor({}, 'muted');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const {
    currentTrack,
    error,
    seekTo,
    setVolume,
    status,
    togglePlay,
    volume,
  } = useMusicPlayer();
  const [seekingValue, setSeekingValue] = useState<number | null>(null);
  const [restoreVolume, setRestoreVolume] = useState(1);
  const [progressWidth, setProgressWidth] = useState(0);

  const bottomOffset = insets.bottom + 12;
  const duration = useMemo(() => {
    if (status.duration > 0) {
      return status.duration;
    }

    return getDurationSeconds(currentTrack?.duration);
  }, [currentTrack?.duration, status.duration]);
  const currentTime = Math.min(seekingValue ?? status.currentTime ?? 0, duration || 0);
  const canSeek = duration > 0 && progressWidth > 0;
  const progressRatio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const progressFillWidth = progressWidth * progressRatio;
  const progressThumbLeft =
    progressWidth > 0
      ? Math.max(0, Math.min(progressWidth - PROGRESS_THUMB_SIZE, progressFillWidth - PROGRESS_THUMB_SIZE / 2))
      : 0;
  const volumeIcon = volume <= 0 ? 'speaker.slash.fill' : 'speaker.wave.2.fill';

  const handleProgressLayout = useCallback((event: LayoutChangeEvent) => {
    setProgressWidth(event.nativeEvent.layout.width);
  }, []);

  const getSeekValueFromLocation = useCallback(
    (locationX: number) => {
      if (!canSeek) {
        return 0;
      }

      const boundedLocation = Math.max(0, Math.min(progressWidth, locationX));

      return (boundedLocation / progressWidth) * duration;
    },
    [canSeek, duration, progressWidth]
  );

  const updateSeekingFromLocation = useCallback(
    (locationX: number) => {
      if (!canSeek) {
        return;
      }

      setSeekingValue(getSeekValueFromLocation(locationX));
    },
    [canSeek, getSeekValueFromLocation]
  );

  const completeSeekFromLocation = useCallback(
    (locationX: number) => {
      if (!canSeek) {
        return;
      }

      const nextTime = getSeekValueFromLocation(locationX);
      setSeekingValue(nextTime);
      void seekTo(nextTime).finally(() => {
        setSeekingValue((value) => (value === nextTime ? null : value));
      });
    },
    [canSeek, getSeekValueFromLocation, seekTo]
  );

  const handleProgressAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (duration <= 0) {
        return;
      }

      const offset =
        event.nativeEvent.actionName === 'increment'
          ? ACCESSIBILITY_SEEK_STEP
          : -ACCESSIBILITY_SEEK_STEP;
      const nextTime = Math.max(0, Math.min(duration, currentTime + offset));

      setSeekingValue(nextTime);
      void seekTo(nextTime).finally(() => {
        setSeekingValue((value) => (value === nextTime ? null : value));
      });
    },
    [currentTime, duration, seekTo]
  );

  const progressPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => canSeek,
        onPanResponderGrant: (event) => {
          updateSeekingFromLocation(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateSeekingFromLocation(event.nativeEvent.locationX);
        },
        onPanResponderRelease: (event) => {
          completeSeekFromLocation(event.nativeEvent.locationX);
        },
        onPanResponderTerminate: () => {
          setSeekingValue(null);
        },
        onStartShouldSetPanResponder: () => canSeek,
      }),
    [canSeek, completeSeekFromLocation, updateSeekingFromLocation]
  );

  const handleVolumePress = useCallback(() => {
    if (volume <= 0) {
      setVolume(restoreVolume);
      return;
    }

    setRestoreVolume(volume);
    setVolume(0);
  }, [restoreVolume, setVolume, volume]);

  if (!currentTrack) {
    return null;
  }

  return (
    <ThemedView
      lightColor={AppTheme.colors.background}
      darkColor={AppTheme.colors.surfaceDark}
      style={[styles.container, { bottom: bottomOffset }]}>
      <View style={styles.trackRow}>
        {currentTrack.coverUrl ? (
          <Image contentFit="cover" source={{ uri: currentTrack.coverUrl }} style={styles.cover} />
        ) : (
          <ThemedView
            lightColor={AppTheme.colors.surfaceSoft}
            darkColor={AppTheme.colors.surfaceSoftDark}
            style={styles.cover}>
            <ThemedText numberOfLines={1} style={styles.coverText}>
              {currentTrack.name.slice(0, 1)}
            </ThemedText>
          </ThemedView>
        )}

        <View style={styles.trackInfo}>
          <ThemedText numberOfLines={1} style={styles.trackTitle} type="defaultSemiBold">
            {currentTrack.name}
          </ThemedText>
          <View style={styles.trackMetaRow}>
            <ThemedText numberOfLines={1} style={styles.trackMeta}>
            {currentTrack.artist ?? '未知歌手'}
            {currentTrack.album ? ` · ${currentTrack.album}` : ''}
            </ThemedText>
            {currentTrack.isPreview ? (
              <ThemedView
                lightColor={AppTheme.colors.primaryLight}
                darkColor={AppTheme.colors.surfaceSoftDark}
                style={styles.previewBadge}>
                <IconSymbol color={AppTheme.colors.primaryDark} name="headphones" size={11} />
                <ThemedText style={styles.previewBadgeText}>试听</ThemedText>
              </ThemedView>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={volume <= 0 ? '恢复音量' : '静音'}
            accessibilityRole="button"
            onPress={handleVolumePress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <IconSymbol color={mutedColor} name={volumeIcon} size={21} />
          </Pressable>

          <Pressable
            accessibilityLabel={status.playing ? '暂停播放' : '继续播放'}
            accessibilityRole="button"
            onPress={togglePlay}
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
            <IconSymbol
              color={AppTheme.colors.textInverted}
              name={status.playing ? 'pause.fill' : 'play.fill'}
              size={26}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.progressRow}>
        <ThemedText style={styles.timeText}>{formatPlayerTime(currentTime)}</ThemedText>
        <View
          accessible
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          accessibilityLabel="播放进度"
          accessibilityRole="adjustable"
          accessibilityValue={{
            max: Math.round(duration),
            min: 0,
            now: Math.round(currentTime),
          }}
          onAccessibilityAction={handleProgressAccessibilityAction}
          onLayout={handleProgressLayout}
          style={[styles.progressTouchArea, duration <= 0 && styles.progressDisabled]}
          {...progressPanResponder.panHandlers}>
          <View pointerEvents="none" style={[styles.progressTrack, { backgroundColor: surfaceSoftColor }]}>
            <View style={[styles.progressFill, { width: progressFillWidth }]} />
            <View style={[styles.progressThumb, { left: progressThumbLeft }]} />
          </View>
        </View>
        <ThemedText style={styles.timeText}>{formatPlayerTime(duration)}</ThemedText>
      </View>

      {error ? (
        <ThemedText numberOfLines={1} style={styles.errorText}>
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: AppTheme.radius.md,
    elevation: 8,
    gap: 6,
    left: PLAYER_SIDE_OFFSET,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    right: PLAYER_SIDE_OFFSET,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    zIndex: 20,
  },
  cover: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.sm,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 50,
  },
  coverText: {
    color: AppTheme.colors.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: AppTheme.colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: AppTheme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  progressDisabled: {
    opacity: 0.45,
  },
  progressFill: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.pill,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  progressThumb: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: PROGRESS_THUMB_SIZE / 2,
    height: PROGRESS_THUMB_SIZE,
    position: 'absolute',
    top: -3,
    width: PROGRESS_THUMB_SIZE,
  },
  progressTouchArea: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  progressTrack: {
    borderRadius: AppTheme.radius.pill,
    height: 4,
    position: 'relative',
  },
  timeText: {
    color: AppTheme.colors.muted,
    fontSize: 11,
    lineHeight: 14,
    minWidth: 36,
    textAlign: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  trackMeta: {
    color: AppTheme.colors.muted,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  trackMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  trackRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  trackTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
});
