import { request } from '@/services/api/client';
import type { ToplistDetailResponse, ToplistResponse } from '@/services/api/types';

export const rankingApi = {
  getToplist() {
    return request<ToplistResponse>({
      method: 'GET',
      url: '/toplist',
    });
  },

  getToplistDetail() {
    return request<ToplistDetailResponse>({
      method: 'GET',
      url: '/toplist/detail',
    });
  },
};
