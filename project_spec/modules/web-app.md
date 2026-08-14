<!-- module_id: web-app -->
<!-- root_dirs: index.html, css/, js/ -->
<!-- desc: 应用 Web 源码（权威），原生 vanilla JS，无框架无构建步骤；www/ 是其生成镜像 -->

# 模块：Web 源（web-app）

## 文件登记表

| 文件 | 功能说明 |
|------|----------|
| index.html | 应用入口：首页游戏选择 + 游戏页容器 + 完成弹窗；按序加载 `js/games/*.js` 与 `js/app.js` |
| css/style.css | 全部样式：主题 `#f7f8fa`、卡片网格、按钮、弹窗、竖屏布局 |
| js/app.js | 主控制器：导航、难度选择、计时、最佳成绩（localStorage）、完成弹窗（IIFE 封装） |
| js/games/schulte.js | 舒尔特方格（注意力 / 视觉搜索），注册 `window.Games.schulte` |
| js/games/cancellation.js | 数字划消（持续性注意），注册 `window.Games.cancellation` |
| js/games/memory.js | 翻牌配对（工作记忆），注册 `window.Games.memory` |
| js/games/trail.js | 连线游戏（执行功能），注册 `window.Games.trail` |
| js/games/difference.js | 找不同（视觉分辨），注册 `window.Games.difference` |

## 约定

- 每个游戏向 `window.Games` 注册 `{ name, start(canvas, diff, { onProgress, onComplete }) }`，`diff ∈ {easy, medium, hard}`。
- 最佳成绩键：`best_${game.name}_${diff}`，存 `localStorage`。
- 新增游戏三步：加 `js/games/<name>.js` → `index.html` 加 `.game-card`(data-game) 与 `<script>` → `js/app.js` 的 `hintMap` 加提示。
- 文案对长辈友好、正向鼓励，不用挫败性表达。

## 注意

`www/` 是本模块的生成镜像（`cap sync` 产物），禁止手改；改源后由 `build-apk.ps1` 第一步覆盖。
