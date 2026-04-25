import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';

export default function PlaylistsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">歌单广场</ThemedText>
          <ThemedText style={styles.subTitle}>按心情、场景和风格整理灵感</ThemedText>
        </ThemedView>

        <View style={styles.section}>
          <ThemedText type="subtitle">精选歌单</ThemedText>
          <ThemedView
            lightColor={AppTheme.colors.surface}
            darkColor={AppTheme.colors.surfaceDark}
            style={styles.panel}>
            <ThemedText type="defaultSemiBold">城市夜行</ThemedText>
            <ThemedText style={styles.muted}>适合夜晚通勤和独处的声音</ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    gap: 10,
    marginBottom: 32,
  },
  muted: {
    color: AppTheme.colors.muted,
  },
  panel: {
    borderRadius: AppTheme.radius.md,
    gap: 8,
    padding: 18,
  },
  section: {
    gap: 14,
  },
  subTitle: {
    color: AppTheme.colors.muted,
  },
});
