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

export type SongUrlLevel =
  | 'standard'
  | 'higher'
  | 'exhigh'
  | 'lossless'
  | 'hires'
  | 'jyeffect'
  | 'sky'
  | 'dolby'
  | 'jymaster';

export type SongUrlParams = {
  id: ApiId | ApiId[] | string;
  level?: SongUrlLevel;
  unblock?: boolean;
};

export type SongFreeTrialInfo = {
  end?: number;
  start?: number;
};

export type SongFreeTrialPrivilege = {
  cannotListenReason?: number | null;
  listenType?: unknown;
  playReason?: unknown;
  resConsumable?: boolean;
  userConsumable?: boolean;
};

export type SongFreeTimeTrialPrivilege = {
  remainTime?: number;
  resConsumable?: boolean;
  type?: number;
  userConsumable?: boolean;
};

export type SongUrl = {
  br?: number;
  code?: number;
  encodeType?: string;
  fee?: number;
  freeTimeTrialPrivilege?: SongFreeTimeTrialPrivilege;
  freeTrialInfo?: SongFreeTrialInfo | null;
  freeTrialPrivilege?: SongFreeTrialPrivilege;
  id: ApiId;
  level?: SongUrlLevel | string;
  message?: string | null;
  size?: number;
  time?: number;
  type?: string;
  url?: string | null;
};

export type SongUrlResponse = {
  code: number;
  data: SongUrl[];
};

export type Playlist = {
  coverUrl?: string;
  description?: string;
  id: ApiId;
  name: string;
  songs?: Song[];
  trackCount?: number;
};

export type PersonalizedParams = {
  limit?: number;
};

export type PersonalizedPlaylist = {
  alg?: string;
  canDislike?: boolean;
  copywriter?: string;
  highQuality?: boolean;
  id: ApiId;
  name: string;
  picUrl?: string;
  playCount?: number;
  trackCount?: number;
  trackNumber?: number;
  type?: number;
};

export type PlaylistDetailParams = {
  id: ApiId;
  s?: number;
};

export type PlaylistTrackId = {
  alg?: string | null;
  at?: number;
  id: ApiId;
  rcmdReason?: string;
  t?: number;
  uid?: ApiId;
  v?: number;
};

export type SongArtist = {
  alias?: string[];
  id?: ApiId;
  name?: string;
  tns?: string[];
};

export type SongAlbum = {
  id?: ApiId;
  name?: string;
  pic?: ApiId;
  picUrl?: string;
  tns?: string[];
};

export type PlaylistSong = Song & {
  al?: SongAlbum;
  alia?: string[];
  ar?: SongArtist[];
  dt?: number;
  fee?: number;
  freeTimeTrialPrivilege?: SongFreeTimeTrialPrivilege;
  freeTrialInfo?: SongFreeTrialInfo | null;
  freeTrialPrivilege?: SongFreeTrialPrivilege;
  mv?: ApiId;
  privilege?: SongPrivilege;
};

export type SongPrivilege = {
  cp?: number;
  dl?: number;
  fee?: number;
  freeTimeTrialPrivilege?: SongFreeTimeTrialPrivilege;
  freeTrialInfo?: SongFreeTrialInfo | null;
  freeTrialPrivilege?: SongFreeTrialPrivilege;
  id: ApiId;
  pl?: number;
  sp?: number;
  st?: number;
};

export type PlaylistCreator = {
  avatarUrl?: string;
  nickname?: string;
  userId?: ApiId;
};

export type PlaylistDetail = Playlist & {
  coverImgUrl?: string;
  creator?: PlaylistCreator;
  playCount?: number;
  subscribedCount?: number;
  tags?: string[];
  trackIds?: PlaylistTrackId[];
  tracks?: PlaylistSong[];
};

export type PlaylistDetailResponse = {
  code: number;
  playlist?: PlaylistDetail;
  privileges?: SongPrivilege[];
};

export type SongDetailResponse = {
  code: number;
  privileges?: SongPrivilege[];
  songs: PlaylistSong[];
};

export type PersonalizedResponse = {
  category?: number;
  code: number;
  hasTaste?: boolean;
  result: PersonalizedPlaylist[];
};

export type TopPlaylistOrder = 'hot' | 'new';

export type TopPlaylistParams = {
  cat?: string;
  limit?: number;
  offset?: number;
  order?: TopPlaylistOrder;
};

export type TopPlaylistCreator = {
  avatarUrl?: string;
  nickname?: string;
  userId?: ApiId;
};

export type TopPlaylist = {
  coverImgUrl?: string;
  copywriter?: string;
  creator?: TopPlaylistCreator;
  description?: string | null;
  id: ApiId;
  name: string;
  playCount?: number;
  tags?: string[];
  trackCount?: number;
};

export type TopPlaylistResponse = {
  cat?: string;
  code: number;
  more?: boolean;
  playlists: TopPlaylist[];
  total?: number;
};

export type TopArtistsParams = {
  limit?: number;
  offset?: number;
};

export type TopArtist = {
  accountId?: ApiId | null;
  albumSize?: number;
  alias?: string[];
  alg?: string | null;
  briefDesc?: string;
  fansCount?: number;
  followed?: boolean;
  id: ApiId;
  identifyTag?: string[] | null;
  img1v1Id?: ApiId;
  img1v1Id_str?: string;
  img1v1Url?: string;
  isSubed?: boolean | null;
  musicSize?: number;
  mvSize?: number | null;
  name: string;
  picId?: ApiId;
  picId_str?: string;
  picUrl?: string;
  publishTime?: number | null;
  showPrivateMsg?: boolean | null;
  topicPerson?: number;
  trans?: string;
  transNames?: string[] | null;
};

export type TopArtistsResponse = {
  artists: TopArtist[];
  code: number;
  more: boolean;
};

export type ArtistTopSongsParams = {
  id: ApiId;
};

export type ArtistTopSongsResponse = {
  code: number;
  more?: boolean;
  songs: PlaylistSong[];
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
