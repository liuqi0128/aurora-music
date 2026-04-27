import { useRouter } from 'expo-router';

import { TopNavigation } from '@/components/top-navigation';

export const HOME_TOP_ROUTES = {
  推荐: '/home',
  排行榜: '/home/ranking',
  歌单: '/home/playlists',
} as const;

export type HomeTopTab = keyof typeof HOME_TOP_ROUTES;

export const HOME_TOP_TABS = Object.keys(HOME_TOP_ROUTES) as HomeTopTab[];

type HomeTopNavigationProps = {
  activeTab: HomeTopTab;
};

export function HomeTopNavigation({ activeTab }: HomeTopNavigationProps) {
  const router = useRouter();

  return (
    <TopNavigation
      activeTab={activeTab}
      onTabChange={(tab) => {
        const nextTab = tab as HomeTopTab;

        if (nextTab === activeTab) {
          return;
        }

        router.push(HOME_TOP_ROUTES[nextTab]);
      }}
      tabs={HOME_TOP_TABS}
    />
  );
}
