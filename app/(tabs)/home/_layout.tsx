import { Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HomeTopNavigation, type HomeTopTab } from '@/components/home-top-navigation';
import { ThemedView } from '@/components/themed-view';

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

  return (
    <ThemedView style={styles.container}>
      <HomeTopNavigation activeTab={getActiveTab(pathname)} />
      <View style={styles.stack}>
        <Stack screenOptions={{ animation: 'none', headerShown: false }} />
      </View>
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
