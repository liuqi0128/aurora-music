export type ListParams = {
  page?: number;
  pageSize?: number;
};

export type ApiId = number | string;

export type Song = {
  album?: string;
  artist?: string;
  coverUrl?: string;
  duration?: number;
  id: ApiId;
  name: string;
  url?: string;
};

export type Playlist = {
  coverUrl?: string;
  description?: string;
  id: ApiId;
  name: string;
  songs?: Song[];
  trackCount?: number;
};

export type BannerType = 0 | 1 | 2 | 3;

export type Banner = {
  encodeId?: string;
  imageUrl?: string;
  pic?: string;
  targetId?: ApiId;
  targetType?: number;
  titleColor?: string;
  typeTitle?: string;
  url?: string;
};

export type BannerResponse = {
  banners: Banner[];
  code: number;
};

export type Ranking = {
  id: ApiId;
  name: string;
  songs?: Song[];
};

export type ToplistTrack = {
  first?: string;
  second?: string;
};

export type Toplist = {
  coverImgUrl?: string;
  description?: string;
  id: ApiId;
  name: string;
  playCount?: number;
  subscribedCount?: number;
  trackCount?: number;
  tracks?: ToplistTrack[];
  updateFrequency?: string;
};

export type ToplistResponse = {
  code: number;
  list: Toplist[];
};

export type ToplistDetailResponse = ToplistResponse & {
  artistToplist?: {
    coverUrl?: string;
    name?: string;
    position?: number;
    updateFrequency?: string;
  };
  rewardToplist?: Toplist;
};

export type SearchParams = ListParams & {
  keyword: string;
};

export type UserProfile = {
  avatarUrl?: string;
  id: ApiId;
  nickname: string;
};
