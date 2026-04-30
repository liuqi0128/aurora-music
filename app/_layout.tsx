import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { MiniPlayer } from '@/components/player/mini-player';
import { MusicPlayerProvider } from '@/components/player/music-player-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const GESTURE_ENABLED_ROUTES = new Set<string>([]);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <MusicPlayerProvider>
          <Stack
            screenOptions={({ route }) => ({
              animationTypeForReplace: 'pop',
              gestureEnabled: GESTURE_ENABLED_ROUTES.has(route.name),
            })}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="artist-detail" options={{ headerShown: false }} />
            <Stack.Screen name="playlist-detail" options={{ headerShown: false }} />
            <Stack.Screen name="recent-plays" options={{ headerShown: false }} />
          </Stack>
          <MiniPlayer />
          <StatusBar style="auto" />
        </MusicPlayerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});
