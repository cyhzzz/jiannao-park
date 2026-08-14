<!-- module_id: android-wrapper -->
<!-- root_dirs: android/ -->
<!-- desc: Capacitor 配置、PowerShell 构建/补丁脚本、原生 Gradle 工程 -->

# 模块：Android 封装（android-wrapper）

## 文件登记表

| 文件 | 功能说明 |
|------|----------|
| android/capacitor.config.ts | Capacitor 配置：appId、appName、webDir(`../www`)、SplashScreen |
| android/package.json | Capacitor 依赖与脚本（注意：`build` 脚本是「省心投 BI」遗留，指向不存在的 `frontend-react`，勿用） |
| android/scripts/build-apk.ps1 | 一键出包：复制 Web→www → cap sync → post-sync-patch → gradlew assembleDebug → 产物 `release/jiannao-v{version}.apk` |
| android/scripts/post-sync-patch.ps1 | cap sync 后幂等补丁：竖屏/largeHeap、图标、JDK17、应用名、全屏、阿里云镜像、Gradle 配置（含历史遗留 DB 步骤，本 App 静默跳过） |
| android/scripts/generate-icons.ps1 | 从 `icon/LOGO.png` 生成各密度 `ic_launcher` |
| android/android/ | 由 Capacitor 生成的原生 Gradle 工程（部分文件被 post-sync-patch 修改，勿直接长期手改） |

## 约定

- 规范构建入口：`android/scripts/build-apk.ps1`（不要用 `npm run build`）。
- 原生改动应通过补丁脚本 / Capacitor 配置承载，避免直接改 `android/android/` 后下次 sync 被覆盖。
- 版本仅 `version.json`；APK 命名随其走。
- JDK 17；`GRADLE_USER_HOME` 当前绑定 `..\省心投BI\...`（已推断，换机需调整）。

## 注意（已知漂移）

- `android/package.json` 残留「省心投 BI」描述与失效 build 脚本。
- `post-sync-patch.ps1` 的 SQLite DB 打包步骤与 `shengxintou` 命名属历史遗留，建议清理。
