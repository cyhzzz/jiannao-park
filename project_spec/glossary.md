# 项目约定（glossary · L3）

## 文件命名

- kebab-case：`schulte.js`、`cancellation.js`、`build-apk.ps1`。
- 目录：根 `css/`、`js/`、`js/games/`、`android/`、`android/scripts/`。

## 变量 / 键命名

- DOM 钩子：`id`（如 `#page-home`、`#timer`）与 `data-*`（如 `data-game`、`data-diff`）。
- 游戏注册键：`window.Games.<key>`，与 `index.html` 的 `data-game` 一致（`schulte` / `cancellation` / `memory` / `trail` / `difference`）。
- 最佳成绩键：`best_${game.name}_${diff}`（localStorage）。
- 难度：`easy` / `medium` / `hard`。

## 函数命名

- 主控制器用 `show*` / `open*` / `start*` / `stop*` / `on*`（`onComplete`、`onProgress`）。
- 计时格式化 `fmt(ms)` → `MM:SS`。

## 文案风格

- 中文、口语化、对长辈友好；正向鼓励（「太棒了」「新纪录」「完成得真好」）；禁止挫败性表达。

## 目录职责

- 仓库根：`index.html` / `css/` / `js/` = Web 权威源。
- `www/`：生成镜像，禁手改。
- `android/`：Capacitor 封装与构建脚本。
- `icon/LOGO.png`：图标源图。
- `version.json`：版本唯一源。
- `android/release/`：APK 落盘。
