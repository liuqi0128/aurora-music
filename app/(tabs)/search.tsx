import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopNavigation } from '@/components/top-navigation';

export default function SearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <TopNavigation title="搜索" />

      <View style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.subTitle}>查找歌曲、歌手或专辑</ThemedText>
        </ThemedView>

        <TextInput
          placeholder="输入关键词"
          placeholderTextColor="#8A8F98"
          style={styles.input}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle">热门搜索</ThemedText>
          <View style={styles.tags}>
            {['华语流行', '轻音乐', '电子', '独立音乐'].map((item) => (
              <ThemedView key={item} lightColor="#F3F6F8" darkColor="#202326" style={styles.tag}>
                <ThemedText>{item}</ThemedText>
              </ThemedView>
            ))}
          </View>
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
    marginBottom: 24,
  },
  subTitle: {
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F3F6F8',
    borderRadius: 8,
    color: '#11181C',
    fontSize: 16,
    height: 52,
    marginBottom: 32,
    paddingHorizontal: 18,
  },
  section: {
    gap: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
