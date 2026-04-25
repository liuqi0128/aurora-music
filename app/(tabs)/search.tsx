import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopNavigation } from '@/components/top-navigation';
import { AppTheme } from '@/constants/theme';

export default function SearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <TopNavigation title="搜索" />

      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.subTitle}>查找歌曲、歌手或专辑</ThemedText>
          </ThemedView>

          <TextInput
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
            placeholder="输入关键词"
            placeholderTextColor={AppTheme.colors.placeholder}
            returnKeyType="done"
            style={styles.input}
          />

          <View style={styles.section}>
            <ThemedText type="subtitle">热门搜索</ThemedText>
            <View style={styles.tags}>
              {['华语流行', '轻音乐', '电子', '独立音乐'].map((item) => (
                <ThemedView
                  key={item}
                  lightColor={AppTheme.colors.primaryLight}
                  darkColor={AppTheme.colors.surfaceDark}
                  style={styles.tag}>
                  <ThemedText>{item}</ThemedText>
                </ThemedView>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    gap: 10,
    marginBottom: 24,
  },
  subTitle: {
    color: AppTheme.colors.muted,
  },
  input: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    color: AppTheme.colors.text,
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
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
