import { request } from '@/services/api/client';
import type { ListParams, Playlist, Song, UserProfile } from '@/services/api/types';

export const userApi = {
  getFavorites(params?: ListParams) {
    return request<Playlist[]>({
      method: 'GET',
      params,
      url: '/user/favorites',
    });
  },

  getPlayHistory(params?: ListParams) {
    return request<Song[]>({
      method: 'GET',
      params,
      url: '/user/play-history',
    });
  },

  getProfile() {
    return request<UserProfile>({
      method: 'GET',
      url: '/user/profile',
    });
  },
};
