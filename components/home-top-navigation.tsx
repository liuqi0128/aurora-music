import { useRouter } from 'expo-router';

import { TopNavigation } from '@/components/top-navigation';

const HOME_TOP_ROUTES = {
  推荐: '/home',
  排行榜: '/home/ranking',
  歌单: '/home/playlists',
} as const;

export const HOME_TOP_TABS = Object.keys(HOME_TOP_ROUTES);

export type HomeTopTab = keyof typeof HOME_TOP_ROUTES;

type HomeTopNavigationProps = {
  activeTab: HomeTopTab;
};

export function HomeTopNavigation({ activeTab }: HomeTopNavigationProps) {
  const router = useRouter();

  return (
    <TopNavigation
      activeTab={activeTab}
      onTabChange={(tab) => {
        router.replace(HOME_TOP_ROUTES[tab as HomeTopTab]);
      }}
      tabs={HOME_TOP_TABS}
    />
  );
}
