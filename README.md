# 健脑乐园 · 脑力训练

为认知退化长辈（如奶奶辈）设计的移动端认知训练小游戏。界面大字号、高对比、操作极简，每天动一动大脑。

> 温馨提示：本应用为日常脑力锻炼的辅助训练，**不能替代医学治疗**，但每天练一练总没有坏处。

## 游戏一览

| 游戏 | 训练维度 |
| --- | --- |
| 舒尔特方格 | 注意力 · 视觉搜索 |
| 数字划消 | 持续性注意 |
| 翻牌配对 | 工作记忆 |
| 连线游戏 | 执行功能 |
| 找不同 | 视觉分辨 |

每个难度页下方还附有「训练科普」面板，说明该训练的方案来源科学家与锻炼原理。

## 特性

- 移动端优先的适老化 UI（大按钮、清晰图标）
- 本地成绩记录与个人最佳（浏览器 / App 内均落本地，不上传）
- **PWA**：可「添加到主屏幕」，离线也能玩
- 可作为 **Android APK** 安装使用

## 在线体验

- 网页版（GitHub Pages，支持安装到主屏 / 离线）：<https://cyhzzz.github.io/jiannao-park/>
- Android APK 下载（最新版）：<https://github.com/cyhzzz/jiannao-park/releases/latest>

## 技术栈

- Web 层：原生 HTML / CSS / JavaScript（无框架、无打包步骤）
- 本地记录：浏览器内 SQLite（[sql.js](https://github.com/sql-js/sql.js) WASM），失败自动降级为 localStorage
- 移动端封装：[Capacitor 7](https://capacitorjs.com/) + 原生 Android（Gradle）

## 本地运行（网页版）

直接用浏览器打开 `index.html` 即可；或起一个静态服务器：

```bash
# 任选其一
python -m http.server 8080
npx serve .
```

然后访问 `http://localhost:8080`。

## 构建 Android APK

前置环境：Node.js、JDK 17、Android SDK（含 `sdkmanager` 与构建工具）、Capacitor CLI。

```bash
# 1. 安装依赖
npm install

# 2. 同步 Web 资源进原生工程
npx cap sync android

# 3. 用 Android Studio 打开 android/android 并构建，或命令行：
cd android/android
./gradlew assembleDebug
```

仓库里也提供了一键脚本（Windows，已内置 JDK / Gradle 路径与镜像源）：

```powershell
powershell -ExecutionPolicy Bypass -File android/scripts/build-apk.ps1
```

产物在 `android/release/jiannao-v1.0.0.apk`。

## 仓库结构

```
index.html              网页入口（同时供 PWA 与原生 WebView 使用）
css/  js/               网页样式与逻辑（含 5 个游戏、本地记录、科普面板）
icon/                   App / PWA 图标源与生成脚本
android/                Capacitor 原生 Android 工程
scripts/                图标生成等辅助脚本
.github/workflows/      GitHub Pages 部署工作流
```

## 开源协议

[MIT](./LICENSE) © 2026 cyhzzz
