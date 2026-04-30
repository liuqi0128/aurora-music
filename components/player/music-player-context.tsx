import {
  setAudioModeAsync,
  type AudioStatus,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { homeApi, type ApiId } from '@/services/api';

import { isPreviewSongUrl } from './playback-flags';

const AUDIO_PLAYER_OPTIONS = {
  updateInterval: 500,
};

const MAX_RECENT_TRACKS = 50;

export type MusicPlayerTrack = {
  album?: string;
  artist?: string;
  coverUrl?: string;
  duration?: number;
  id: ApiId;
  isPreview?: boolean;
  name: string;
};

type MusicPlayerContextValue = {
  clearRecentTracks: () => void;
  clearError: () => void;
  currentTrack: MusicPlayerTrack | null;
  error: string;
  isCurrentTrack: (id: ApiId) => boolean;
  loadingTrackId: string | null;
  playTrack: (track: MusicPlayerTrack) => Promise<void>;
  recentTracks: MusicPlayerTrack[];
  seekTo: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => void;
  status: AudioStatus;
  togglePlay: () => void;
  volume: number;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '播放失败，请稍后重试';
}

function getPlayableUrl(url?: string | null) {
  return typeof url === 'string' ? url.trim() : '';
}

function getTrackKey(id: ApiId) {
  return String(id);
}

function getLockScreenMetadata(track: MusicPlayerTrack) {
  return {
    albumTitle: track.album,
    artist: track.artist,
    artworkUrl: track.coverUrl,
    title: track.name,
  };
}

function activateLockScreenControls(
  audioPlayer: ReturnType<typeof useAudioPlayer>,
  track: MusicPlayerTrack
) {
  try {
    audioPlayer.setActiveForLockScreen(true, getLockScreenMetadata(track), {
      showSeekBackward: true,
      showSeekForward: true,
    });
  } catch {
    // Expo Go or unsupported native containers may not expose lock screen controls.
  }
}

function clampVolume(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(0, Math.min(1, value));
}

export function MusicPlayerProvider({ children }: PropsWithChildren) {
  const audioPlayer = useAudioPlayer(null, AUDIO_PLAYER_OPTIONS);
  const status = useAudioPlayerStatus(audioPlayer);
  const playRequestIdRef = useRef(0);
  const [currentTrack, setCurrentTrack] = useState<MusicPlayerTrack | null>(null);
  const [error, setError] = useState('');
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<MusicPlayerTrack[]>([]);
  const [volume, setVolumeState] = useState(1);

  const currentTrackId = currentTrack ? getTrackKey(currentTrack.id) : null;

  useEffect(() => {
    void setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'doNotMix',
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    }).catch(() => {
      // Background audio mode requires native support; keep foreground playback working.
    });
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const clearRecentTracks = useCallback(() => {
    setRecentTracks([]);
  }, []);

  const addRecentTrack = useCallback((track: MusicPlayerTrack) => {
    const trackId = getTrackKey(track.id);

    setRecentTracks((tracks) => [
      track,
      ...tracks.filter((recentTrack) => getTrackKey(recentTrack.id) !== trackId),
    ].slice(0, MAX_RECENT_TRACKS));
  }, []);

  const seekTo = useCallback(
    async (seconds: number) => {
      const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);

      try {
        await audioPlayer.seekTo(safeSeconds);
      } catch (seekError) {
        setError(getErrorMessage(seekError));
      }
    },
    [audioPlayer]
  );

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clampedVolume = clampVolume(nextVolume);
      audioPlayer.volume = clampedVolume;
      setVolumeState(clampedVolume);
    },
    [audioPlayer]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      return;
    }

    setError('');

    if (status.playing) {
      audioPlayer.pause();
      return;
    }

    const shouldReplay =
      status.duration > 0 && status.currentTime >= Math.max(0, status.duration - 0.2);

    if (shouldReplay) {
      void audioPlayer
        .seekTo(0)
        .then(() => {
          audioPlayer.play();
        })
        .catch((playError) => {
          setError(getErrorMessage(playError));
        });
      return;
    }

    audioPlayer.play();
  }, [audioPlayer, currentTrack, status.currentTime, status.duration, status.playing]);

  const playTrack = useCallback(
    async (track: MusicPlayerTrack) => {
      const trackId = getTrackKey(track.id);

      if (loadingTrackId === trackId) {
        return;
      }

      setError('');

      if (currentTrackId === trackId) {
        togglePlay();
        return;
      }

      const requestId = playRequestIdRef.current + 1;
      playRequestIdRef.current = requestId;
      setLoadingTrackId(trackId);

      try {
        const songUrlData = await homeApi.getSongUrl({ id: track.id, level: 'standard' });

        if (playRequestIdRef.current !== requestId) {
          return;
        }

        const songUrls = songUrlData.data ?? [];
        const playableSong = songUrls.find((item) => getTrackKey(item.id) === trackId) ?? songUrls[0];
        const playableUrl = getPlayableUrl(playableSong?.url);

        if (!playableUrl || (playableSong?.code !== undefined && playableSong.code !== 200)) {
          throw new Error(playableSong?.message ?? '暂无可播放音源');
        }

        const playableTrack = {
          ...track,
          isPreview: track.isPreview || isPreviewSongUrl(playableSong),
        };

        audioPlayer.replace({ uri: playableUrl });
        setCurrentTrack(playableTrack);
        addRecentTrack(playableTrack);
        audioPlayer.play();
        activateLockScreenControls(audioPlayer, playableTrack);
      } catch (playError) {
        if (playRequestIdRef.current === requestId) {
          setError(getErrorMessage(playError));
        }
      } finally {
        if (playRequestIdRef.current === requestId) {
          setLoadingTrackId(null);
        }
      }
    },
    [addRecentTrack, audioPlayer, currentTrackId, loadingTrackId, togglePlay]
  );

  const isCurrentTrack = useCallback(
    (id: ApiId) => currentTrackId === getTrackKey(id),
    [currentTrackId]
  );

  const value = useMemo<MusicPlayerContextValue>(
    () => ({
      clearRecentTracks,
      clearError,
      currentTrack,
      error,
      isCurrentTrack,
      loadingTrackId,
      playTrack,
      recentTracks,
      seekTo,
      setVolume,
      status,
      togglePlay,
      volume,
    }),
    [
      clearRecentTracks,
      clearError,
      currentTrack,
      error,
      isCurrentTrack,
      loadingTrackId,
      playTrack,
      recentTracks,
      seekTo,
      setVolume,
      status,
      togglePlay,
      volume,
    ]
  );

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error('useMusicPlayer must be used inside MusicPlayerProvider');
  }

  return context;
}
