# 项目总览（Spec · L1）

> 来源：AI 项目 Spec 自动构建（阶段 1）。本文件是模块地图的总表，详细文档见各 `modules/*.md`。

## 模块表

| 模块 | 职责 | 详细文档 |
|------|------|----------|
| Web 源（权威） | 应用入口、样式、游戏逻辑，唯一可手改的 Web 源码 | [web-app.md](./modules/web-app.md) |
| Android 封装 | Capacitor 配置、PowerShell 构建脚本、原生 Gradle 工程 | [android-wrapper.md](./modules/android-wrapper.md) |

## 关键事实

- 应用名：健脑乐园；应用 ID：`com.jiannao.brain`；面向认知退化长辈。
- Web 层：原生 HTML/CSS/JS，无框架、无构建步骤；源在仓库根，生成镜像在 `www/`。
- 封装：Capacitor 7 → Android APK；规范构建入口 `android/scripts/build-apk.ps1`。
- 版本：仅 `version.json`；APK 命名 `jiannao-v{version}.apk`。
- 默认环境：Windows + PowerShell。

## 与规则体系的关系

行为红线 / 编码约定见 `docs/rules/*`（`AGENTS.md` 为字节一致锚点）。本 `project_spec/` 偏向「系统由哪些模块构成、各自职责、命名约定」，与 `docs/rules/` 互补，不重复。
