# 关键约束与红线（business-invariants）

> Critical 红线：触发即停，先回退 / 先确认，不要硬改。

## 1. 生成产物：www/ 是生成产物，禁止手改

`www/` 由 `cap sync` 从**根目录 Web 源**（`index.html` / `css/` / `js/`）复制生成，是 Capacitor 的 `webDir`（`android/capacitor.config.ts` 中 `webDir: '../www'`）。任何 Web 改动都改根目录源，`build-apk.ps1` 第一步会把根目录源覆盖进 `www/`。

- ⛔ 不要在 `www/` 下直接编辑 `index.html`、`css/`、`js/`，改了也会被下次同步覆盖。
- ✅ Web 源码的唯一可编辑位置：仓库根 `index.html`、`css/`、`js/`。

## 2. 构建入口：唯一用 build-apk.ps1

本仓库**规范构建入口是 `android/scripts/build-apk.ps1`**（一键：复制 Web→www → cap sync → post-sync-patch → gradlew assembleDebug → 产物落 `android/release/jiannao-v{version}.apk`）。

- ⛔ 不要用 `android/package.json` 里的 `npm run build`：它是「省心投 BI」遗留，`cd ../frontend-react && npm run build` 指向本仓库不存在的 `frontend-react`，且本 Web 层本就无构建步骤。
- ✅ 需要重新出包时只跑 `powershell -File android/scripts/build-apk.ps1`。

## 3. 版本号：version.json 是唯一源

当前版本只在 `version.json` 的 `version` 字段。APK 命名为 `jiannao-v{version}.apk`（由 `build-apk.ps1` 读取）。

- ⛔ 不要把版本号硬编码进规则文件、脚本常量或清单文案（规则自校验会 FAIL）。
- ✅ 发版只改 `version.json`，其余引用从它读取。

## 4. 老人优先的 UI 不变式

本 App 用户是认知退化长辈，UI 必须满足：

- **竖屏单手操作**：`post-sync-patch.ps1` 强制 `screenOrientation=portrait`，且 `largeHeap=true`（防同步大内存 OOM）。
- **大字号、大点按区**：按钮 / 卡片命中区足够大，文案通俗正面。
- **正向鼓励文案**：完成弹窗用「太棒了 / 完成得真好 / 新纪录」等鼓励语，不使用失败、错误、负数等挫败性表达（见 `js/app.js` 的 `onComplete`）。
- **全屏沉浸式**：隐藏系统状态栏（`styles.xml` 注入 `windowFullscreen`），减少长辈误触。

## 5. 原生工程：未经确认不手改

`android/android/` 由 Capacitor 生成，`cap sync` / `post-sync-patch.ps1` 会重写 `AndroidManifest.xml`、`strings.xml`、`styles.xml`、`settings.gradle`、`gradle.properties`、各 `build.gradle`。

- ⛔ 不要直接手改被同步覆盖的原生文件当长期修改，改动会被下次 sync 丢弃。
- ✅ 需要长期原生改动时，改 `post-sync-patch.ps1`（补丁式，幂等）或 Capacitor 配置，而非原生文件本身。

## 6. 已知漂移 / 待清理（已推断，请确认）

- `android/package.json`：残留「省心投 BI 移动端（Capacitor 封装）」描述与失效 `build` 脚本 → 建议改为本仓库真实信息或直接弃用 `npm run build`。
- `android/scripts/post-sync-patch.ps1`：step 8 的 SQLite DB 打包（`database/shengxintou.db` / `frontend-react/public/...`）对本 App 无效，会静默跳过；step 9 内 `Rename-ApkToChinese` 用 `shengxintou` 命名与 `build-apk.ps1` 的 `jiannao` 冲突，已死代码。建议清理。
- `build-apk.ps1` 的 JDK / `GRADLE_USER_HOME` 指向 `..\省心投BI\...` 兄弟目录，绑定特定机器布局；换机需重设或参数化。

## 红线触发模板

```
⛔ 触发红线：<标题>
当前情形：<具体说明>
建议处理：<回退到哪一步 / 需要用户确认什么>
```
