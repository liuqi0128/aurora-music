import type { Href } from 'expo-router';

import type { ApiId } from '@/services/api';

type PlaylistDetailHrefOptions = {
  coverUrl?: string;
  from?: string;
  id: ApiId;
  name?: string;
};

export function createPlaylistDetailHref({ coverUrl, from, id, name }: PlaylistDetailHrefOptions) {
  const params = [`id=${encodeURIComponent(String(id))}`];

  if (name) {
    params.push(`name=${encodeURIComponent(name)}`);
  }

  if (coverUrl) {
    params.push(`coverUrl=${encodeURIComponent(coverUrl)}`);
  }

  if (from) {
    params.push(`from=${encodeURIComponent(from)}`);
  }

  return `/playlist-detail?${params.join('&')}` as Href;
}
