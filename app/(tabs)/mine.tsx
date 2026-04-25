import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopNavigation } from '@/components/top-navigation';
import { AppTheme } from '@/constants/theme';

export default function MineScreen() {
  return (
    <ThemedView style={styles.container}>
      <TopNavigation title="我的" />

      <View style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.subTitle}>管理你的收藏和播放记录</ThemedText>
        </ThemedView>

        <View style={styles.list}>
          {['我的收藏', '最近播放', '本地音乐'].map((item) => (
            <ThemedView
              key={item}
              lightColor={AppTheme.colors.surface}
              darkColor={AppTheme.colors.surfaceDark}
              style={styles.row}>
              <ThemedText type="defaultSemiBold">{item}</ThemedText>
            </ThemedView>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    gap: 10,
    marginBottom: 32,
  },
  subTitle: {
    color: AppTheme.colors.muted,
  },
  list: {
    gap: 12,
  },
  row: {
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
});
