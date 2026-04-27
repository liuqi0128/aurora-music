export function formatCompactCount(value: number) {
  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);

  return rounded.replace(/\.0$/, '');
}

export function formatPlayCount(playCount?: number) {
  if (typeof playCount !== 'number' || !Number.isFinite(playCount)) {
    return '';
  }

  if (playCount >= 100000000) {
    return `${formatCompactCount(playCount / 100000000)}亿播放`;
  }

  if (playCount >= 10000) {
    return `${formatCompactCount(playCount / 10000)}万播放`;
  }

  return `${Math.max(0, Math.round(playCount))}播放`;
}

export function formatFansCount(fansCount?: number) {
  if (typeof fansCount !== 'number' || !Number.isFinite(fansCount)) {
    return '';
  }

  if (fansCount >= 100000000) {
    return `${formatCompactCount(fansCount / 100000000)}亿粉丝`;
  }

  if (fansCount >= 10000) {
    return `${formatCompactCount(fansCount / 10000)}万粉丝`;
  }

  return `${Math.max(0, Math.round(fansCount))}粉丝`;
}
