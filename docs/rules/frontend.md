# Web 前端约定（frontend）

Web 层是仓库根的 `index.html` + `css/style.css` + `js/`，**原生 vanilla JS，无框架、无打包器、无运行时依赖、无构建步骤**。这是本仓库唯一可手改的 Web 源码；`www/` 是其生成镜像。

## 目录与文件

| 路径 | 职责 |
|------|------|
| `index.html` | 应用入口：首页游戏选择 + 游戏页容器 + 完成弹窗；以 `<script>` 顺序加载 `js/games/*.js` 再加载 `js/app.js` |
| `css/style.css` | 全部样式（主题色 `#f7f8fa`、卡片、按钮、弹窗、竖屏布局） |
| `js/app.js` | 主控制器：导航、难度选择、计时、最佳成绩、完成弹窗（IIFE 封装，避免全局污染） |
| `js/games/schulte.js` | 舒尔特方格（注意力 / 视觉搜索） |
| `js/games/cancellation.js` | 数字划消（持续性注意） |
| `js/games/memory.js` | 翻牌配对（工作记忆） |
| `js/games/trail.js` | 连线游戏（执行功能） |
| `js/games/difference.js` | 找不同（视觉分辨） |

## 游戏注册约定（必须遵守）

每个游戏文件在 `window.Games` 上注册一个键（与 `index.html` 中 `data-game` 一致），形如：

```js
window.Games = window.Games || {};
window.Games.schulte = {
  name: '舒尔特方格',                       // 用于计时键与最佳成绩键
  start(canvas, diff, { onProgress, onComplete }) { /* ... */ }
};
```

- `diff` 取值：`easy` / `medium` / `hard`（对应首页难度按钮 `data-diff`）。
- `onProgress(done, total)`：向信息栏汇报进度。
- `onComplete()`：完成时回调（主控制器据此停表、写最佳成绩、弹窗）。
- 新增游戏必须：① 在 `js/games/` 加文件；② 在 `index.html` 加 `<script>` 与首页 `.game-card`（带 `data-game`）；③ 在 `js/app.js` 的 `hintMap` 加提示语。

## 命名约定

- 文件名 kebab-case（`schulte.js`、`cancellation.js`）。
- DOM 钩子用 `id` / `data-*`（`#page-home`、`data-game`、`data-diff`）。
- 最佳成绩键：`best_${game.name}_${diff}`，存 `localStorage`（见 `js/app.js`）。
- 计时格式 `MM:SS`，由 `fmt(ms)` 统一。

## 编码风格

- ES5 风格 IIFE，避免引入现代语法导致老设备 WebView 兼容问题。
- 不引入 npm 包、不引入打包工具；如需工具函数，写在对应 `js/` 文件内。
- 文案用中文、口语化、对长辈友好；不使用挫败性表达。

## 常见陷阱

- 改了 `index.html` 忘了在 `www/` 同步 → 出包仍是旧逻辑。规则要求改根目录源，由 `build-apk.ps1` 第一步覆盖 `www/`。
- 在 `www/` 手改后以为生效，下次 sync 被覆盖。
- 游戏 `name` 含空格或特殊字符 → `localStorage` 键不稳定，保持简单可读。
