# 项目总览（overview）

## 一句话定位

**健脑乐园**是一款面向认知退化长辈（如奶奶辈）的移动端认知训练 App：用 5 个轻量小游戏（舒尔特方格、数字划消、翻牌配对、连线、找不同）做每日脑力锻炼。Web 层为**根目录 Web 源**（原生 HTML/CSS/JS，无构建步骤），通过 **Capacitor 7** 封装为 Android APK。

## 技术栈

- **Web 层**：原生 HTML5 + CSS + vanilla JavaScript（ES5 风格 IIFE，零运行时依赖、零打包器）。
- **封装层**：Capacitor 7（`@capacitor/core`、`@capacitor/android` 等）。
- **原生层**：Android（Gradle，应用 ID `com.jiannao.brain`，应用名「健脑乐园」）。
- **脚本层**：PowerShell 5.1（构建 / 打包 / 图标 / 同步后补丁），无 BOM UTF-8 写入。
- **默认环境**：Windows + PowerShell（命令行窗口隐藏，不弹黑窗）。

## 模块地图

| 模块 | 目录 | 职责 |
|------|------|------|
| Web 源（权威） | 根 `index.html`、`css/`、`js/` | 应用入口、样式、游戏逻辑，**唯一可手改的 Web 源码** |
| Capacitor 同步产物 | `www/` | `cap sync` 从根 Web 源复制而来，**生成产物，禁止手改** |
| 游戏逻辑 | `js/games/*.js` | 各游戏向 `window.Games` 注册 `{ name, start }` |
| 主控制器 | `js/app.js` | 导航 / 难度 / 计时 / 最佳成绩（localStorage）/ 完成弹窗 |
| 封装配置 | `android/capacitor.config.ts` | appId、appName、webDir（`../www`） |
| 构建脚本 | `android/scripts/*.ps1` | 复制 Web→www、cap sync、post-sync-patch、gradlew 打包 |
| 原生工程 | `android/android/` | Gradle 原生 Android 工程（由 Capacitor 生成，部分被补丁修改） |
| 版本 | `version.json` | 唯一版本号源；APK 命名 `jiannao-v{version}.apk` |
| 产物 | `android/release/` | 编译产出的 APK 落盘位置 |

## 三种姿态（不同角色看同一套规则）

1. **开发姿态**：改 Web 源码只动根 `index.html` / `css/` / `js/`；改完跑 `android/scripts/build-apk.ps1` 出包。
2. **AI Agent 姿态**：会话启动加载 `AGENTS.md` / `CLAUDE.md`，细节按需读取 `docs/rules/*`；规则变更走单一权威源，不写多份副本。
3. **交付姿态**：版本号只改 `version.json`；APK 命名与清单随版本走，不硬编码在脚本常量里。

## 已知漂移（待清理，已推断请确认）

- `android/package.json` 残留「省心投 BI」描述，其 `build` 脚本 `cd ../frontend-react && npm run build` 指向本仓库不存在的 `frontend-react`；**规范构建入口是 `android/scripts/build-apk.ps1`**，不要使用 `npm run build`。
- `android/scripts/post-sync-patch.ps1` 仍有「省心投 / shengxintou」字样与 SQLite DB 打包步骤（step 8），本 App 无内置 DB，该步骤会静默跳过；属历史遗留，建议择机清理。
- `post-sync-patch.ps1` 内 APK 命名用 `shengxintou-vX.Y.Z.apk`，与 `build-apk.ps1` 的 `jiannao-v{version}.apk` 不一致，以 `build-apk.ps1` 为准。

> 详见 [`business-invariants.md`](./business-invariants.md) 与 [`toolchain.md`](./toolchain.md)。
