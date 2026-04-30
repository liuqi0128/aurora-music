import type {
  PlaylistSong,
  SongFreeTimeTrialPrivilege,
  SongFreeTrialInfo,
  SongFreeTrialPrivilege,
  SongPrivilege,
  SongUrl,
} from '@/services/api';

type TrialSource = {
  freeTimeTrialPrivilege?: SongFreeTimeTrialPrivilege;
  freeTrialInfo?: SongFreeTrialInfo | null;
  freeTrialPrivilege?: SongFreeTrialPrivilege;
};

function hasTrialInfo(trialInfo?: SongFreeTrialInfo | null) {
  if (!trialInfo) {
    return false;
  }

  const { end, start } = trialInfo;

  if (typeof start === 'number' && typeof end === 'number') {
    return end > start;
  }

  return Object.keys(trialInfo).length > 0;
}

function hasMeaningfulValue(value: unknown) {
  return value !== undefined && value !== null && value !== false && value !== 0 && value !== '';
}

function hasTrialPrivilege(trialPrivilege?: SongFreeTrialPrivilege) {
  return Boolean(
    trialPrivilege?.resConsumable ||
      trialPrivilege?.userConsumable ||
      hasMeaningfulValue(trialPrivilege?.listenType) ||
      hasMeaningfulValue(trialPrivilege?.playReason)
  );
}

function hasTimeTrialPrivilege(trialPrivilege?: SongFreeTimeTrialPrivilege) {
  return Boolean(
    trialPrivilege?.resConsumable ||
      trialPrivilege?.userConsumable ||
      (typeof trialPrivilege?.remainTime === 'number' && trialPrivilege.remainTime > 0)
  );
}

function hasTrialPlayback(source?: TrialSource | null) {
  return (
    hasTrialInfo(source?.freeTrialInfo) ||
    hasTrialPrivilege(source?.freeTrialPrivilege) ||
    hasTimeTrialPrivilege(source?.freeTimeTrialPrivilege)
  );
}

export function isPreviewSong(song: PlaylistSong, privilege?: SongPrivilege) {
  return hasTrialPlayback(song) || hasTrialPlayback(song.privilege) || hasTrialPlayback(privilege);
}

export function isPreviewSongUrl(songUrl?: SongUrl | null) {
  return hasTrialPlayback(songUrl);
}
