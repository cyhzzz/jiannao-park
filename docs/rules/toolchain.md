# 工具链（toolchain）

## 运行时

- **Node**：运行 Capacitor CLI 与 `android/package.json` 脚本（开发机已装；优先用本机 Node）。
- **PowerShell 5.1**：所有 `.ps1` 脚本的运行环境（Windows 默认）。注意 `Set-Content -Encoding UTF8` 会写 BOM，Gradle 不支持 BOM，补丁脚本统一用 `[System.IO.File]::WriteAllText` 写无 BOM UTF-8。
- **JDK 17**：`post-sync-patch.ps1` 会把 Capacitor / 插件 `build.gradle` 的 `VERSION_21` / `jvmToolchain(21)` 降到 17。`build-apk.ps1` 通过 `JAVA_HOME` 指向具体 JDK（当前写死 `..\省心投BI\tools\jdk17`，换机需调整）。
- **Gradle**：原生工程用自带 `gradlew`（wrapper）。`gradle-wrapper.properties` 被补丁改为腾讯云镜像（`mirrors.cloud.tencent.com/gradle/`），`networkTimeout=120000`，`validateDistributionUrl=false`。

## Capacitor

- 配置：`android/capacitor.config.ts`（`appId: com.jiannao.brain`，`appName: 健脑乐园`，`webDir: '../www'`）。
- 同步：`npx cap sync android` → 把 `www/` 拷进原生 `assets`；随后必跑 `post-sync-patch.ps1`。
- 打开原生工程：`npx cap open android`（Android Studio）。

## 补丁脚本（post-sync-patch.ps1）

`cap sync` 之后运行，幂等、可重复：

1. `AndroidManifest.xml`：强制竖屏 `portrait` + `largeHeap=true`。
2. 调用 `generate-icons.ps1` 从 `icon/LOGO.png` 生成各尺寸 `ic_launcher`。
3. 各 `build.gradle` 的 JDK 21→17。
4. `strings.xml` 的 `app_name` 强制为「健脑乐园」。
5. `styles.xml` 注入全屏沉浸式（`windowFullscreen`）。
6. `settings.gradle` 注入阿里云镜像（国内网络）。
7. `gradle.properties` 注入 in-process Kotlin + 关闭 daemon（规避沙箱拦截 `~/.kotlin`）。
8. `gradle-wrapper.properties` 改腾讯云镜像。
9. （历史遗留）SQLite DB 打包步骤，本 App 无 DB，会静默跳过。

## 图标

- 源图：`icon/LOGO.png`（仓库根 `icon/`）。
- 生成：`android/scripts/generate-icons.ps1`，输出到 `android/android/app/src/main/res/` 各密度目录。
- 改图标只换 `icon/LOGO.png` 后重跑构建，不要手改 `res/` 里的 `ic_launcher`。

## 依赖安装

- Web 层零 npm 依赖，无需 `npm install`。
- 封装层：在 `android/` 下 `npm install`（仅 Capacitor 相关 devDeps）。
