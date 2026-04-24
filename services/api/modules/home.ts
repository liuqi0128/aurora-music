import { request } from '@/services/api/client';
import type { BannerResponse, BannerType, ListParams, Playlist, Ranking } from '@/services/api/types';

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

  getRankings() {
    return request<Ranking[]>({
      method: 'GET',
      url: '/home/rankings',
    });
  },

  getRecommendations(params?: ListParams) {
    return request<Playlist[]>({
      method: 'GET',
      params,
      url: '/home/recommendations',
    });
  },
};
