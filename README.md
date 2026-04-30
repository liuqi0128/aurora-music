# Aurora Music

Aurora Music 是一个基于 Expo Router 和 React Native 的移动端音乐应用。项目目前聚焦在线音乐浏览、歌单详情、歌手热门歌曲、播放控制和最近播放等核心体验。

## 功能

- 首页推荐
  - Banner 轮播
  - 推荐歌单
  - 热门歌手
  - 热门歌手卡片可进入歌手歌曲页
- 歌单广场
  - 使用全量歌单接口展示歌单列表
  - 支持进入歌单详情
- 排行榜
  - 展示榜单入口
  - 支持进入榜单歌单详情
- 歌单详情
  - 展示封面、标题、作者、播放量、歌曲数和简介
  - 展示歌曲列表、歌手、专辑、时长
  - 点击歌曲播放
  - 当前播放歌曲高亮
  - 加载中歌曲显示状态
  - 支持试听歌曲标识
- 歌手详情
  - 展示歌手头像、名称、别名/翻译名和基础统计
  - 展示歌手热门歌曲
  - 点击歌曲播放
- 播放器
  - 全局 mini player
  - 播放/暂停
  - 点击或拖动进度条跳转
  - 静音/恢复音量
  - 当前播放歌曲封面、标题、歌手、专辑展示
  - 试听歌曲标识
  - 最近播放记录
- 侧边菜单
  - 最近播放
  - 设置入口占位
- 最近播放
  - 展示本次应用运行期间播放过的歌曲
  - 支持清空
  - 支持再次播放
- 音频后台能力
  - 已配置 `expo-audio` 后台播放相关配置
  - 已启用锁屏/通知栏媒体控制兜底逻辑

## 技术栈

- Expo 54
- Expo Router
- React 19
- React Native 0.81
- TypeScript
- Axios
- expo-audio
- expo-image
- @expo/vector-icons

## 页面结构

```text
app/
  (tabs)/
    home/
      index.tsx        首页推荐
      playlists.tsx    歌单广场
      ranking.tsx      排行榜
  artist-detail.tsx    歌手详情
  playlist-detail.tsx  歌单详情
  recent-plays.tsx     最近播放

components/
  home/                 首页模块
  player/               播放器上下文、mini player、试听判断
  top-navigation.tsx    顶部导航和侧边菜单

services/api/
  client.ts             Axios 客户端
  modules/home.ts       首页、歌单、歌手、歌曲 URL 等接口
  modules/ranking.ts    排行榜接口
  modules/search.ts     搜索接口
  modules/user.ts       用户相关接口
  types.ts              接口类型
```

## 截图展示

当前仓库没有提交真实运行截图。建议将截图放到 `docs/screenshots/` 目录，文件名按下面约定命名，README 后续可以直接改成图片表格展示。

| 页面 | 建议截图路径 | 说明 |
| --- | --- | --- |
| 首页推荐 | `docs/screenshots/home.png` | Banner、推荐歌单、热门歌手 |
| 歌单广场 | `docs/screenshots/playlists.png` | 全量歌单列表 |
| 歌单详情 | `docs/screenshots/playlist-detail.png` | 歌曲列表、试听标识、播放状态 |
| 歌手详情 | `docs/screenshots/artist-detail.png` | 歌手信息和热门歌曲 |
| 播放器 | `docs/screenshots/player.png` | mini player、进度条、音量按钮 |
| 最近播放 | `docs/screenshots/recent-plays.png` | 最近播放列表 |

如果截图已经放入上述路径，可以使用下面的 Markdown 片段展示：

```md
| 首页 | 歌单详情 | 播放器 |
| --- | --- | --- |
| ![首页](docs/screenshots/home.png) | ![歌单详情](docs/screenshots/playlist-detail.png) | ![播放器](docs/screenshots/player.png) |
```

## 环境变量

项目通过 Expo 公共环境变量读取 API 地址。

创建 `.env`：

```env
EXPO_PUBLIC_API_BASE_URL=http://your-api-host/
```

对应读取位置：

```ts
// services/api/client.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
```

## 本地运行

安装依赖：

```bash
pnpm install
```

启动 Expo：

```bash
pnpm start
```

也可以使用 npm：

```bash
npm install
npm run start
```

## 常用命令

```bash
npm run start       # 启动 Expo，端口 8801
npm run android     # Android 调试
npm run ios         # iOS 调试
npm run web         # Web 调试
npm run lint        # ESLint 检查
npx tsc --noEmit    # TypeScript 类型检查
```

## 后台播放说明

项目已在 `app.json` 中配置 `expo-audio`：

```json
[
  "expo-audio",
  {
    "enableBackgroundPlayback": true,
    "recordAudioAndroid": false
  }
]
```

播放器中也已设置：

```ts
await setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true
});
```

注意：Expo Go 不能可靠验证后台音频、锁屏控制、Android 前台服务等原生能力。需要使用 development build 或正式包验证。

```bash
npx expo run:android
npx expo run:ios
```

或使用 EAS：

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

## 接口概览

主要接口封装在 `services/api/modules/home.ts`：

- `/banner` - Banner
- `/personalized` - 推荐歌单
- `/top/playlist` - 歌单广场
- `/playlist/detail` - 歌单详情
- `/song/detail` - 歌曲详情
- `/song/url/v1` - 歌曲播放地址
- `/top/artists` - 热门歌手
- `/artist/top/song` - 歌手热门歌曲
- `/home/rankings` - 榜单

## 开发约定

- 页面路由使用 Expo Router 文件路由。
- API 类型集中维护在 `services/api/types.ts`。
- 播放器状态集中在 `components/player/music-player-context.tsx`。
- 试听标识判断集中在 `components/player/playback-flags.ts`。
- UI 主题颜色和圆角集中在 `constants/theme.ts`。
- 新页面如需要被全局访问，需要在 `app/_layout.tsx` 中注册 Stack Screen。

## 备注

- 最近播放当前是内存记录，应用重启后会清空。
- 试听标识只基于当前接口返回字段展示，不会为了标识额外请求播放地址。
- Android 持续后台播放需要 development build 或正式包，并启用锁屏/通知栏媒体控制。
