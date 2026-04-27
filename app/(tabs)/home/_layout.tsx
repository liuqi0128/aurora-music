import { type Href, Stack, usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import {
  HomeTopNavigation,
  HOME_TOP_ROUTES,
  HOME_TOP_TABS,
  type HomeTopTab,
} from '@/components/home-top-navigation';
import { ThemedView } from '@/components/themed-view';

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 650;

function getActiveTab(pathname: string): HomeTopTab {
  if (pathname.includes('/home/ranking')) {
    return '排行榜';
  }

  if (pathname.includes('/home/playlists')) {
    return '歌单';
  }

  return '推荐';
}

export default function HomeLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  const switchTabBySwipe = useCallback(
    (translationX: number, velocityX: number) => {
      const activeIndex = HOME_TOP_TABS.indexOf(activeTab);
      const isStrongSwipe =
        Math.abs(translationX) >= SWIPE_DISTANCE || Math.abs(velocityX) >= SWIPE_VELOCITY;

      if (activeIndex < 0 || !isStrongSwipe) {
        return;
      }

      const nextIndex = translationX < 0 ? activeIndex + 1 : activeIndex - 1;
      const nextTab = HOME_TOP_TABS[nextIndex];

      if (!nextTab) {
        return;
      }

      router.replace(HOME_TOP_ROUTES[nextTab] as Href);
    },
    [activeTab, router]
  );

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-28, 28])
        .failOffsetY([-24, 24])
        .onEnd((event) => {
          runOnJS(switchTabBySwipe)(event.translationX, event.velocityX);
        }),
    [switchTabBySwipe]
  );

  return (
    <ThemedView style={styles.container}>
      <HomeTopNavigation activeTab={activeTab} />
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.stack}>
          <Stack screenOptions={{ animation: 'none', headerShown: false }} />
        </View>
      </GestureDetector>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stack: {
    flex: 1,
  },
});
