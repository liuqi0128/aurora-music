import { request } from '@/services/api/client';
import type { SearchParams, Song } from '@/services/api/types';

export const searchApi = {
  getHotKeywords() {
    return request<string[]>({
      method: 'GET',
      url: '/search/hot-keywords',
    });
  },

  searchSongs(params: SearchParams) {
    return request<Song[]>({
      method: 'GET',
      params,
      url: '/search/songs',
    });
  },
};
