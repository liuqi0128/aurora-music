import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppTheme } from '@/constants/theme';

type HomeSectionStatusProps = {
  message: string;
  title?: string;
  loading?: boolean;
};

export function HomeSectionStatus({ loading = false, message, title }: HomeSectionStatusProps) {
  return (
    <ThemedView
      lightColor={AppTheme.colors.surface}
      darkColor={AppTheme.colors.surfaceDark}
      style={styles.statusPanel}>
      {loading ? <ActivityIndicator color={AppTheme.colors.primary} /> : null}
      {title ? <ThemedText type="defaultSemiBold">{title}</ThemedText> : null}
      <ThemedText style={styles.muted}>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: AppTheme.colors.muted,
  },
  statusPanel: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    gap: 10,
    padding: 18,
  },
});
