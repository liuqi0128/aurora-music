import { type Href, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type TopNavigationProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: readonly string[];
  title?: string;
};

const DRAWER_RATIO = 0.75;
const DRAWER_ITEMS: { href?: Href; label: string }[] = [
  { href: '/recent-plays', label: '最近播放' },
  { label: '设置' },
];

export function TopNavigation({ activeTab, onTabChange, tabs, title }: TopNavigationProps) {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.round(width * DRAWER_RATIO);
  const slideX = useRef(new Animated.Value(-drawerWidth)).current;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const mutedColor = useThemeColor({}, 'muted');
  const hasTabs = Boolean(tabs?.length);

  const openDrawer = () => {
    slideX.setValue(-drawerWidth);
    setDrawerVisible(true);
    Animated.timing(slideX, {
      duration: 220,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = (onClosed?: () => void) => {
    Animated.timing(slideX, {
      duration: 180,
      toValue: -drawerWidth,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
      onClosed?.();
    });
  };

  const navigateFromDrawer = (href: Href) => {
    closeDrawer(() => {
      router.push(href);
    });
  };

  return (
    <>
      <View style={[styles.nav, { backgroundColor, paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="打开菜单"
          accessibilityRole="button"
          onPress={openDrawer}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <IconSymbol color={textColor} name="line.3.horizontal" size={24} />
        </Pressable>

        <View style={styles.center}>
          {hasTabs ? (
            <View style={[styles.segment, { backgroundColor: surfaceColor }]}>
              {tabs?.map((tab) => {
                const selected = tab === activeTab;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={tab}
                    onPress={() => onTabChange?.(tab)}
                    style={[
                      styles.segmentItem,
                      selected && { backgroundColor: tintColor },
                    ]}>
                    <ThemedText
                      numberOfLines={1}
                      style={[
                        styles.segmentText,
                        { color: selected ? backgroundColor : mutedColor },
                        selected && styles.segmentTextActive,
                      ]}>
                      {tab}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <ThemedText numberOfLines={1} type="subtitle">
              {title}
            </ThemedText>
          )}
        </View>

        <View style={styles.rightSpace} />
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          closeDrawer();
        }}
        statusBarTranslucent
        transparent
        visible={drawerVisible}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              closeDrawer();
            }}
          />
          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor,
                paddingTop: insets.top + 28,
                transform: [{ translateX: slideX }],
                width: drawerWidth,
              },
            ]}>
            <View style={styles.drawerHeader}>
              <ThemedText type="title">Aurora Music</ThemedText>
              <ThemedText style={[styles.drawerSubTitle, { color: mutedColor }]}>
                你的音乐空间
              </ThemedText>
            </View>

            <View style={styles.drawerList}>
              {DRAWER_ITEMS.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    if (item.href) {
                      navigateFromDrawer(item.href);
                      return;
                    }

                    closeDrawer();
                  }}
                  style={({ pressed }) => [
                    styles.drawerItem,
                    { backgroundColor: surfaceColor },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppTheme.colors.overlay,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  drawer: {
    height: '100%',
    paddingHorizontal: 20,
    shadowColor: AppTheme.colors.shadow,
    shadowOffset: { height: 0, width: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  drawerHeader: {
    gap: 8,
    marginBottom: 28,
  },
  drawerItem: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  drawerList: {
    gap: 10,
  },
  drawerSubTitle: {
    fontSize: 14,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  modalRoot: {
    flex: 1,
  },
  nav: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  rightSpace: {
    width: 42,
  },
  segment: {
    borderRadius: 8,
    flexDirection: 'row',
    maxWidth: 270,
    padding: 3,
    width: '100%',
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  segmentTextActive: {
    fontWeight: '700',
  },
});
