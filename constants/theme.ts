/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const AppTheme = {
  colors: {
    // 品牌主色：Tab 选中态、Loading、链接、主要激活状态。
    primary: '#FF5C7A',
    // 品牌深色：按压态、深色模式里的主色辅助色。
    primaryDark: '#D83F5F',
    // 品牌浅色：浅色模式里的标签、弱强调背景。
    primaryLight: '#FFF0F4',
    // 辅助强调色：少量点缀，例如高亮、徽标或特殊状态。
    accent: '#F6C453',
    // 浅色模式主文本。
    text: '#11181C',
    // 深色模式主文本。
    textDark: '#ECEDEE',
    // 深色背景上的反白文本，例如 Banner 徽标文字。
    textInverted: '#FFFFFF',
    // 浅色模式弱文本：副标题、说明文字、列表摘要。
    muted: '#6B7280',
    // 深色模式弱文本。
    mutedDark: '#A8B0B8',
    // 输入框 placeholder 文本。
    placeholder: '#8A8F98',
    // 浅色模式页面背景。
    background: '#FFFFFF',
    // 深色模式页面背景。
    backgroundDark: '#151718',
    // 浅色模式普通面板背景：输入框、标签、状态块。
    surface: '#F3F6F8',
    // 深色模式普通面板背景。
    surfaceDark: '#202326',
    // 浅色模式更浅的占位背景：图片占位、封面占位。
    surfaceSoft: '#EEF2F6',
    // 深色模式更浅的占位背景。
    surfaceSoftDark: '#2B3035',
    // 浅色模式默认图标色。
    icon: '#687076',
    // 深色模式默认图标色。
    iconDark: '#9BA1A6',
    // 弹窗、抽屉的遮罩背景。
    overlay: 'rgba(0, 0, 0, 0.35)',
    // 图片上方的半透明徽标背景。
    badgeOverlay: 'rgba(0, 0, 0, 0.55)',
    // 轮播图激活圆点，独立于品牌主色。
    carouselDotActive: '#FFFFFF',
    // 轮播图未激活圆点。
    dotInactive: 'rgba(255, 255, 255, 0.55)',
    // 卡片、抽屉等投影颜色。
    shadow: '#000000',
  },
  radius: {
    sm: 6,
    md: 8,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 28,
  },
} as const;

const tintColorLight = AppTheme.colors.primary;
const tintColorDark = AppTheme.colors.primary;

export const Colors = {
  light: {
    text: AppTheme.colors.text,
    background: AppTheme.colors.background,
    tint: tintColorLight,
    icon: AppTheme.colors.icon,
    tabIconDefault: AppTheme.colors.icon,
    tabIconSelected: tintColorLight,
    primary: AppTheme.colors.primary,
    primaryDark: AppTheme.colors.primaryDark,
    primaryLight: AppTheme.colors.primaryLight,
    accent: AppTheme.colors.accent,
    muted: AppTheme.colors.muted,
    placeholder: AppTheme.colors.placeholder,
    surface: AppTheme.colors.surface,
    surfaceElevated: AppTheme.colors.background,
    surfaceSoft: AppTheme.colors.surfaceSoft,
  },
  dark: {
    text: AppTheme.colors.textDark,
    background: AppTheme.colors.backgroundDark,
    tint: tintColorDark,
    icon: AppTheme.colors.iconDark,
    tabIconDefault: AppTheme.colors.iconDark,
    tabIconSelected: tintColorDark,
    primary: AppTheme.colors.primary,
    primaryDark: AppTheme.colors.primaryDark,
    primaryLight: AppTheme.colors.primaryDark,
    accent: AppTheme.colors.accent,
    muted: AppTheme.colors.mutedDark,
    placeholder: AppTheme.colors.mutedDark,
    surface: AppTheme.colors.surfaceDark,
    surfaceElevated: AppTheme.colors.surfaceDark,
    surfaceSoft: AppTheme.colors.surfaceSoftDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
