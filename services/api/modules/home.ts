import { request } from '@/services/api/client';
import type {
  BannerResponse,
  BannerType,
  ApiId,
  ListParams,
  PersonalizedParams,
  PersonalizedResponse,
  Playlist,
  PlaylistDetailParams,
  PlaylistDetailResponse,
  Ranking,
  SongDetailResponse,
  TopArtistsParams,
  TopArtistsResponse,
} from '@/services/api/types';

const SONG_DETAIL_CHUNK_SIZE = 400;

function normalizeSongIds(ids: ApiId[] | string) {
  if (Array.isArray(ids)) {
    return ids.map((id) => String(id)).filter(Boolean);
  }

  return ids
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export const homeApi = {
  getBanners(type: BannerType = 1) {
    return request<BannerResponse>({
      method: 'GET',
      params: { type },
      url: '/banner',
    });
  },

  getPlaylists(params?: ListParams) {
    return request<Playlist[]>({
      method: 'GET',
      params,
      url: '/home/playlists',
    });
  },

  getPlaylistDetail(params: PlaylistDetailParams) {
    return request<PlaylistDetailResponse>({
      method: 'GET',
      params,
      url: '/playlist/detail',
    });
  },

  getRankings() {
    return request<Ranking[]>({
      method: 'GET',
      url: '/home/rankings',
    });
  },

  getRecommendations(params?: PersonalizedParams) {
    return request<PersonalizedResponse>({
      method: 'GET',
      params,
      url: '/personalized',
    });
  },

  async getSongDetails(ids: ApiId[] | string) {
    const normalizedIds = normalizeSongIds(ids);

    if (normalizedIds.length === 0) {
      return {
        code: 200,
        privileges: [],
        songs: [],
      } satisfies SongDetailResponse;
    }

    const chunks: string[][] = [];

    for (let index = 0; index < normalizedIds.length; index += SONG_DETAIL_CHUNK_SIZE) {
      chunks.push(normalizedIds.slice(index, index + SONG_DETAIL_CHUNK_SIZE));
    }

    const responses = await Promise.all(
      chunks.map((chunk) =>
        request<SongDetailResponse>({
          method: 'GET',
          params: { ids: chunk.join(',') },
          url: '/song/detail',
        })
      )
    );

    if (responses.length === 1) {
      return responses[0];
    }

    const lastResponse = responses[responses.length - 1];

    return {
      code: lastResponse?.code ?? 200,
      privileges: responses.flatMap((response) => response.privileges ?? []),
      songs: responses.flatMap((response) => response.songs ?? []),
    } satisfies SongDetailResponse;
  },

  getTopArtists(params?: TopArtistsParams) {
    return request<TopArtistsResponse>({
      method: 'GET',
      params,
      url: '/top/artists',
    });
  },
};
